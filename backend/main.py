import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image, ImageDraw
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import warnings
from datetime import datetime
import hashlib
import base64
import cv2
import traceback
warnings.filterwarnings("ignore")

try:
    import nibabel as nib
    NIBABEL_AVAILABLE = True
    print("✅ NIfTI support enabled")
except ImportError:
    NIBABEL_AVAILABLE = False
    print("⚠️  nibabel not installed — NIfTI uploads will be rejected")

app = FastAPI(title="Liver Tumor Detection API", version="6.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")
os.makedirs(MODEL_DIR, exist_ok=True)

device = torch.device("cpu")

print("=" * 60)
print("  LIVER TUMOR DETECTION — Two-Stage Pipeline")
print("  Stage 1: Liver/Non-Liver  |  Stage 2: Tumor + Grad-CAM")
print("=" * 60)


# ============================================================
# GRAD-CAM
# ============================================================
class GradCAM:
    def __init__(self, model, target_layer="layer4"):
        self.model = model
        self.gradients = None
        self.activations = None
        self.handles = []
        for name, module in self.model.named_modules():
            if name == target_layer or (not self.handles and "layer4" in name):
                self.handles.append(module.register_forward_hook(
                    lambda m, i, o: setattr(self, "activations", o.detach())))
                self.handles.append(module.register_full_backward_hook(
                    lambda m, gi, go: setattr(self, "gradients", go[0].detach())))
                break

    def generate(self, tensor, class_idx=None):
        out = self.model(tensor)
        if class_idx is None:
            class_idx = out.argmax(dim=1).item()
        self.model.zero_grad()
        one_hot = torch.zeros_like(out)
        one_hot[0, class_idx] = 1
        out.backward(gradient=one_hot, retain_graph=True)
        for h in self.handles:
            h.remove()
        self.handles = []
        if self.gradients is None or self.activations is None:
            return None, class_idx
        w = self.gradients.mean(dim=(2, 3), keepdim=True)
        cam = torch.relu((w * self.activations).sum(dim=1, keepdim=True))
        if cam.max() > 0:
            cam = cam / cam.max()
        else:
            cam = torch.ones_like(cam) * 0.5
        return cam.squeeze().cpu().numpy(), class_idx


# ============================================================
# MODEL ARCHITECTURES
# ============================================================
def _build_tumor_model():
    """
    Tumor model: standard 3-channel ResNet18
    with frozen early layers + dropout FC head.
    """
    m = models.resnet18(weights=None)
    for name, param in m.named_parameters():
        if "layer4" not in name and "fc" not in name:
            param.requires_grad = False
    in_f = m.fc.in_features
    m.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(in_f, 256),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(256, 2),
    )
    return m


def _build_liver_model():
    """
    Liver model: 1-channel grayscale ResNet18
    with simple Linear(512→2) FC — matches LiTS_Model_Package exactly.
    """
    m = models.resnet18(weights=None)
    m.conv1 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)
    m.fc = nn.Linear(m.fc.in_features, 2)
    return m


# ============================================================
# LOAD TUMOR MODEL (Stage 2) — local file
# ============================================================
def _clean_state_dict(raw):
    """Strip resnet./module. prefixes from keys when present."""
    if "model_state_dict" in raw:
        raw = raw["model_state_dict"]
    elif "state_dict" in raw:
        raw = raw["state_dict"]
    out = {}
    for k, v in raw.items():
        out[k[7:] if k.startswith(("resnet.", "module.")) else k] = v
    return out


TUMOR_MODEL_PATH = os.path.join(MODEL_DIR, "lits_tumor_model_fixed.pth")

if not os.path.exists(TUMOR_MODEL_PATH):
    raise FileNotFoundError(
        f"Tumor model not found at {TUMOR_MODEL_PATH}\n"
        "Place lits_tumor_model_fixed.pth in backend/model/"
    )

tumor_model = _build_tumor_model()
tumor_model.load_state_dict(_clean_state_dict(
    torch.load(TUMOR_MODEL_PATH, map_location=device, weights_only=False)), strict=True)
tumor_model.to(device).eval()
print("✅ Tumor model loaded (Stage 2)")


# ============================================================
# LOAD LIVER MODEL (Stage 1) — local file
# ============================================================
LIVER_MODEL_PATH = os.path.join(MODEL_DIR, "liver_model.pth")
liver_model = None
LIVER_MODEL_ENABLED = False

if os.path.exists(LIVER_MODEL_PATH):
    try:
        liver_model = _build_liver_model()
        # Package loads state dict directly — no wrappers
        liver_model.load_state_dict(
            torch.load(LIVER_MODEL_PATH, map_location=device, weights_only=False),
            strict=True)
        liver_model.to(device).eval()
        LIVER_MODEL_ENABLED = True
        print("✅ Liver model loaded (Stage 1 ENABLED)")
    except Exception as e:
        liver_model = None
        print(f"❌ Liver model failed to load: {e}")
else:
    print(f"⚠️  liver_model.pth not found in backend/model/ — Stage 1 disabled")

print("=" * 60)


# ============================================================
# EVALUATION METRICS (in-memory)
# ============================================================
class EvaluationMetrics:
    def __init__(self):
        self.results = []

    def add_result(self, filename, predicted_class, actual_class,
                   confidence, slices_analyzed=None, affected_ratio=None):
        self.results.append({
            "id": hashlib.md5(f"{filename}{datetime.now()}".encode()).hexdigest()[:8],
            "filename": filename,
            "timestamp": datetime.now().isoformat(),
            "predicted_class": predicted_class,
            "actual_class": actual_class,
            "confidence": confidence,
            "slices_analyzed": slices_analyzed,
            "affected_ratio": affected_ratio,
        })

    def reset_all_data(self):
        self.results = []

    def get_confusion_matrix(self):
        tp = tn = fp = fn = 0
        for r in self.results:
            if r.get("actual_class"):
                p, a = r["predicted_class"], r["actual_class"]
                if   p == "tumor"     and a == "tumor":     tp += 1
                elif p == "non-tumor" and a == "non-tumor": tn += 1
                elif p == "tumor"     and a == "non-tumor": fp += 1
                elif p == "non-tumor" and a == "tumor":     fn += 1
        return {"TP": tp, "TN": tn, "FP": fp, "FN": fn}

    def calculate_metrics(self):
        cm = self.get_confusion_matrix()
        tp, tn, fp, fn = cm["TP"], cm["TN"], cm["FP"], cm["FN"]
        total = tp + tn + fp + fn
        def safe_div(a, b): return a / b if b else 0
        prec = safe_div(tp, tp + fp)
        rec  = safe_div(tp, tp + fn)
        return {
            "accuracy":    safe_div(tp + tn, total) * 100,
            "precision":   prec * 100,
            "recall":      rec  * 100,
            "specificity": safe_div(tn, tn + fp) * 100,
            "f1_score":    safe_div(2 * prec * rec, prec + rec) * 100,
            "total_samples": total,
            "true_positives": tp, "true_negatives": tn,
            "false_positives": fp, "false_negatives": fn,
        }


evaluator = EvaluationMetrics()


# ============================================================
# PREPROCESSING
# ============================================================

# ── Tumor model preprocessing (3-channel RGB, ImageNet norm) ──────────
_tumor_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def preprocess_for_tumor(slice_2d: np.ndarray) -> torch.Tensor:
    """Min-max → uint8 → PIL RGB → ImageNet-normalised tensor [1,3,224,224]."""
    img = slice_2d.astype(np.float32)
    lo, hi = img.min(), img.max()
    img = ((img - lo) / (hi - lo) * 255).astype(np.uint8) if hi > lo else np.zeros_like(img, dtype=np.uint8)
    return _tumor_transform(Image.fromarray(img).convert("RGB")).unsqueeze(0)


# ── Liver model preprocessing (1-channel grayscale, CLAHE) ────────────
# Matches utils/preprocess.py from LiTS_Model_Package exactly:
#   resize → CLAHE → normalize [0,1] → tensor [1,1,224,224]

def preprocess_for_liver(slice_2d: np.ndarray) -> torch.Tensor:
    """
    Replicates preprocess_image() from LiTS_Model_Package/utils/preprocess.py.
    Input: 2D numpy array (any float range from NIfTI, or uint8 from image).
    Output: tensor [1, 1, 224, 224], float32, range [0,1].
    """
    img = slice_2d.astype(np.float32)
    lo, hi = img.min(), img.max()
    img_u8 = ((img - lo) / (hi - lo) * 255).astype(np.uint8) if hi > lo else np.zeros_like(img, dtype=np.uint8)
    img_u8 = cv2.resize(img_u8, (224, 224), interpolation=cv2.INTER_AREA)
    clahe  = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_u8 = clahe.apply(img_u8)
    img_f  = img_u8.astype(np.float32) / 255.0
    return torch.from_numpy(img_f).float().unsqueeze(0).unsqueeze(0)  # [1,1,224,224]


def extract_slices_from_nifti(nifti_bytes: bytes):
    """Return (raw_slices, volume_data) without preprocessing."""
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".nii", delete=False) as f:
        f.write(nifti_bytes)
        tmp = f.name
    try:
        data = nib.load(tmp).get_fdata()
        print(f"  Volume shape: {data.shape} → {data.shape[2]} slices")
        slices = [data[:, :, i] for i in range(data.shape[2])]
        return slices, data
    finally:
        os.unlink(tmp)


# ============================================================
# STAGE 1 — LIVER INFERENCE
# ============================================================
def _liver_prob(slice_2d: np.ndarray) -> float:
    """Probability that this slice is liver tissue (class 1)."""
    t = preprocess_for_liver(slice_2d).to(device)
    with torch.no_grad():
        return torch.softmax(liver_model(t), dim=1)[0, 1].item()


def stage1_volume(raw_slices: list) -> tuple:
    """
    Check whether the volume is a liver CT.
    Returns: (is_liver, liver_ratio_pct, liver_count, total)
    Threshold: >50% of slices classified as liver.
    """
    liver_count = sum(1 for s in raw_slices if _liver_prob(s) > 0.5)
    total = len(raw_slices)
    ratio = liver_count / total * 100 if total else 0
    return ratio > 50.0, ratio, liver_count, total


def stage1_image(slice_2d: np.ndarray) -> tuple:
    """
    Check whether a single 2D image is liver.
    Returns: (is_liver, liver_prob_pct)
    """
    prob = _liver_prob(slice_2d)
    return prob > 0.5, prob * 100


# ============================================================
# STAGE 2 — TUMOR INFERENCE + GRAD-CAM
# ============================================================
def _tumor_prob_and_gradcam(tensor: torch.Tensor) -> tuple:
    """Returns (tumor_probability, heatmap_array, predicted_class)."""
    t = tensor.to(device)
    with torch.no_grad():
        prob = torch.softmax(tumor_model(t), dim=1)[0, 1].item()
    cls = 1 if prob > 0.5 else 0
    try:
        cam, _ = GradCAM(tumor_model).generate(t, cls)
        if cam is None:
            raise ValueError("cam is None")
    except Exception as e:
        print(f"  ⚠️  Grad-CAM failed: {e} — using fallback")
        cam = t[0, 0].cpu().numpy()
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
    return prob, cam, cls


def advanced_tumor_detection(probs: list) -> tuple:
    """70% slice threshold + 11% affected-ratio cutoff."""
    arr = np.array(probs)
    above = int(np.sum(arr > 0.70))
    ratio = above / len(arr) * 100
    print(f"  Tumor stats — max:{arr.max():.3f} mean:{arr.mean():.3f} "
          f"slices>70%:{above}/{len(arr)} ({ratio:.1f}%)")
    if ratio <= 11:
        return False, min(0.30, ratio / 100 * 0.8), \
               f"HEALTHY: Affected ratio = {ratio:.1f}% (≤11% threshold)"
    return True, min(0.95, 0.50 + ratio / 100 * 0.5), \
           f"TUMOR: Affected ratio = {ratio:.1f}% (>11% threshold)"


def _make_heatmap_images(slice_2d: np.ndarray, cam: np.ndarray) -> tuple:
    """Returns (original_b64, overlay_b64) as PNG base64 strings."""
    try:
        lo, hi = slice_2d.min(), slice_2d.max()
        u8 = ((slice_2d - lo) / (hi - lo) * 255).astype(np.uint8) if hi > lo \
             else np.zeros_like(slice_2d, dtype=np.uint8)

        orig = Image.fromarray(u8, "L").convert("RGB")
        ImageDraw.Draw(orig).rectangle([1, 1, orig.width-2, orig.height-2],
                                       outline="white", width=2)

        if cam is not None and cam.size > 0:
            h, w = u8.shape
            c = cv2.resize(cam, (w, h)) if cam.shape != (h, w) else cam
            c = (c - c.min()) / (c.max() - c.min() + 1e-8)
            hm_col = cv2.applyColorMap((c * 255).astype(np.uint8), cv2.COLORMAP_JET)
            ovl_arr = cv2.addWeighted(cv2.cvtColor(u8, cv2.COLOR_GRAY2RGB),
                                      0.5, hm_col, 0.5, 0)
            ovl = Image.fromarray(ovl_arr)
        else:
            ovl = orig.copy()

        ImageDraw.Draw(ovl).rectangle([1, 1, ovl.width-2, ovl.height-2],
                                      outline="white", width=2)

        def to_b64(img):
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            return base64.b64encode(buf.getvalue()).decode()

        return to_b64(orig), to_b64(ovl)
    except Exception as e:
        print(f"  ❌ Heatmap creation failed: {e}")
        return None, None


# ============================================================
# API ENDPOINTS
# ============================================================
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "nifti_support": NIBABEL_AVAILABLE,
        "liver_model_enabled": LIVER_MODEL_ENABLED,
        "pipeline": "two-stage (liver → tumor)" if LIVER_MODEL_ENABLED else "single-stage (tumor only)",
        "detection_logic": "70% slice threshold + 11% affected ratio",
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    fname = file.filename.lower()
    is_nifti = fname.endswith(".nii") or fname.endswith(".nii.gz")
    is_image = fname.endswith((".jpg", ".jpeg", ".png"))

    if not (is_nifti or is_image):
        return JSONResponse(status_code=400,
                            content={"error": "Upload .nii, .nii.gz, .jpg, or .png"})

    try:
        contents = await file.read()
        print(f"\n{'='*60}\n  FILE: {fname}\n{'='*60}")

        # ── NIfTI (3-D volume) ────────────────────────────────────────
        if is_nifti:
            if not NIBABEL_AVAILABLE:
                return JSONResponse(status_code=500,
                                    content={"error": "nibabel not installed"})

            raw_slices, volume_data = extract_slices_from_nifti(contents)

            # ── Stage 1: Liver check ──────────────────────────────────
            if LIVER_MODEL_ENABLED:
                print(f"\n🔬 Stage 1 — Liver check ({len(raw_slices)} slices)…")
                is_liver, liver_ratio, liver_count, total = stage1_volume(raw_slices)
                print(f"  Liver slices: {liver_count}/{total} ({liver_ratio:.1f}%)")

                if not is_liver:
                    print("  ❌ Not a liver scan — pipeline stopped")
                    return JSONResponse(content={
                        "prediction": "Not a Liver Scan",
                        "result_class": "not-liver",
                        "tumor_probability": 0,
                        "non_tumor_probability": 0,
                        "liver_probability": round(liver_ratio, 1),
                        "liver_slices_checked": total,
                        "slices_analyzed": total,
                        "decision_reason": (
                            f"Only {liver_ratio:.1f}% of slices classified as liver "
                            f"({liver_count}/{total}). Threshold: >50%."
                        ),
                        "heatmap_image": None,
                        "original_image": None,
                        "heatmap_error": None,
                    })
                print(f"  ✅ Liver confirmed ({liver_ratio:.1f}%) → Stage 2")
                liver_ratio_out = round(liver_ratio, 1)
            else:
                liver_ratio_out = None

            # ── Stage 2: Tumor detection ──────────────────────────────
            print(f"\n🔬 Stage 2 — Tumor analysis ({len(raw_slices)} slices)…")
            all_probs, all_cams = [], []
            best_prob, best_idx = 0.0, 0

            for i, sl in enumerate(raw_slices):
                if (i + 1) % 50 == 0:
                    print(f"  ⏳ {i+1}/{len(raw_slices)}")
                tensor = preprocess_for_tumor(sl)
                prob, cam, _ = _tumor_prob_and_gradcam(tensor)
                all_probs.append(prob)
                all_cams.append(cam)
                if prob > best_prob:
                    best_prob, best_idx = prob, i

            is_tumor, conf, reason = advanced_tumor_detection(all_probs)
            arr = np.array(all_probs)
            high = int(np.sum(arr > 0.70))
            ratio70 = high / len(all_probs) * 100

            print(f"\n🔥 Grad-CAM for best slice (idx={best_idx}, prob={best_prob:.3f})…")
            orig_b64, heat_b64 = _make_heatmap_images(raw_slices[best_idx], all_cams[best_idx])

            resp = {
                "prediction": "Tumor Detected" if is_tumor else "No Tumor Detected",
                "result_class": "tumor" if is_tumor else "non-tumor",
                "tumor_probability": round(conf * 100, 2),
                "non_tumor_probability": round((1 - conf) * 100, 2),
                "slices_analyzed": len(raw_slices),
                "max_probability": round(float(arr.max()), 3),
                "mean_probability": round(float(arr.mean()), 3),
                "affected_slices": f"{high}/{len(raw_slices)}",
                "affected_ratio": f"{ratio70:.1f}%",
                "decision_reason": reason,
                "heatmap_image": heat_b64,
                "original_image": orig_b64,
                "heatmap_error": None if heat_b64 else "Heatmap generation failed",
            }
            if liver_ratio_out is not None:
                resp["liver_probability"] = liver_ratio_out

        # ── 2-D image (single slice) ──────────────────────────────────
        else:
            image     = Image.open(io.BytesIO(contents))
            img_array = np.array(image.convert("L"))   # grayscale numpy

            # ── Stage 1: Liver check ──────────────────────────────────
            if LIVER_MODEL_ENABLED:
                print(f"\n🔬 Stage 1 — Liver check (single image)…")
                is_liver, liver_prob = stage1_image(img_array)
                print(f"  Liver probability: {liver_prob:.1f}%")

                if not is_liver:
                    print("  ❌ Not a liver image — pipeline stopped")
                    return JSONResponse(content={
                        "prediction": "Not a Liver Scan",
                        "result_class": "not-liver",
                        "tumor_probability": 0,
                        "non_tumor_probability": 0,
                        "liver_probability": round(liver_prob, 1),
                        "decision_reason": (
                            f"Image classified as non-liver "
                            f"(liver probability: {liver_prob:.1f}%). Threshold: >50%."
                        ),
                        "heatmap_image": None,
                        "original_image": None,
                        "heatmap_error": None,
                    })
                print(f"  ✅ Liver image confirmed ({liver_prob:.1f}%) → Stage 2")
                liver_prob_out = round(liver_prob, 1)
            else:
                liver_prob_out = None

            # ── Stage 2: Tumor detection ──────────────────────────────
            print(f"\n🔬 Stage 2 — Tumor analysis (single image)…")
            tensor = preprocess_for_tumor(img_array)
            raw_prob, cam, _ = _tumor_prob_and_gradcam(tensor)
            is_tumor = raw_prob > 0.75
            conf     = raw_prob if is_tumor else 1 - raw_prob

            orig_b64, heat_b64 = _make_heatmap_images(img_array, cam)

            resp = {
                "prediction": "Tumor Detected" if is_tumor else "No Tumor Detected",
                "result_class": "tumor" if is_tumor else "non-tumor",
                "tumor_probability": round(conf * 100, 2),
                "non_tumor_probability": round((1 - conf) * 100, 2),
                "decision_reason": "Single image analysis — full NIfTI volume recommended for higher accuracy",
                "heatmap_image": heat_b64,
                "original_image": orig_b64,
                "heatmap_error": None if heat_b64 else "Heatmap generation failed",
            }
            if liver_prob_out is not None:
                resp["liver_probability"] = liver_prob_out

        print(f"\n✅ {resp['prediction']} | confidence {resp['tumor_probability']}% "
              f"| heatmap: {'yes' if resp.get('heatmap_image') else 'no'}")
        print("=" * 60 + "\n")
        return JSONResponse(content=resp)

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/evaluate")
async def evaluate_prediction(
    filename: str = Form(...),
    predicted_class: str = Form(...),
    actual_class: str = Form(...),
    confidence: float = Form(...),
    slices_analyzed: str = Form(None),
    affected_ratio: str = Form(None),
):
    try:
        evaluator.add_result(
            filename=filename,
            predicted_class=predicted_class,
            actual_class=actual_class,
            confidence=confidence,
            slices_analyzed=int(slices_analyzed)
                if slices_analyzed and slices_analyzed != "None" else None,
            affected_ratio=affected_ratio,
        )
        return JSONResponse(content={"success": True, "message": "Evaluation recorded"})
    except Exception as e:
        return JSONResponse(status_code=500,
                            content={"success": False, "error": str(e)})


@app.get("/metrics")
async def get_metrics():
    try:
        return JSONResponse(content={"success": True,
                                     "metrics": evaluator.calculate_metrics()})
    except Exception as e:
        return JSONResponse(status_code=500,
                            content={"success": False, "error": str(e)})


@app.post("/reset_evaluation")
async def reset_evaluation():
    evaluator.reset_all_data()
    return JSONResponse(content={"success": True, "message": "Evaluation data reset"})


if __name__ == "__main__":
    import uvicorn
    print(f"\n🚀  Stage 1 (Liver):  {'ENABLED' if LIVER_MODEL_ENABLED else 'DISABLED'}")
    print("🚀  Stage 2 (Tumor + Grad-CAM): ENABLED")
    print("URL: http://localhost:8000\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)

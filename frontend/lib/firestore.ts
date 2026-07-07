import {
  collection, addDoc, setDoc, updateDoc, doc,
  query, where, orderBy, getDocs, getDoc,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { PredictionResult, MetricsData, ScanRecord, ScanType } from './types'

export async function saveUserProfile(
  userId: string,
  name: string,
  email: string,
  role: 'doctor' | 'radiologist'
) {
  await setDoc(doc(db, 'users', userId), {
    uid: userId, name, email, role,
    createdAt: serverTimestamp(),
  })
}

export async function getUserProfile(userId: string) {
  const snap = await getDoc(doc(db, 'users', userId))
  if (!snap.exists()) return null
  return snap.data() as { name: string; email: string; role: string }
}

export async function saveScan(
  userId: string,
  filename: string,
  result: PredictionResult,
  scanType: ScanType = 'liver',
  patientInfo?: { name?: string; age?: string; gender?: string }
): Promise<string> {
  const fileType = filename.toLowerCase().endsWith('.nii') ||
                   filename.toLowerCase().endsWith('.nii.gz')
                   ? 'nifti' : 'image'

  const docRef = await addDoc(collection(db, 'scans'), {
    userId,
    filename,
    fileType,
    scanType,
    patientName:   patientInfo?.name   || null,
    patientAge:    patientInfo?.age    || null,
    patientGender: patientInfo?.gender || null,
    timestamp: serverTimestamp(),
    result: {
      prediction:          result.prediction,
      resultClass:         result.result_class,
      tumorProbability:    result.tumor_probability    ?? result.cancer_probability    ?? 0,
      nonTumorProbability: result.non_tumor_probability ?? result.non_cancer_probability ?? 0,
      slicesAnalyzed:      result.slices_analyzed      ?? null,
      affectedSlices:      result.affected_slices      ?? null,
      affectedRatio:       result.affected_ratio        ?? null,
      maxProbability:      result.max_probability       ?? null,
      meanProbability:     result.mean_probability      ?? null,
      decisionReason:      result.decision_reason       ?? null,
      lungConfidence:      result.lung_confidence       ?? null,
    },
  })
  return docRef.id
}

export async function saveEvaluation(
  scanId: string,
  actualClass: 'tumor' | 'non-tumor' | 'cancer' | 'non-cancer',
  predictedClass: string
) {
  await updateDoc(doc(db, 'scans', scanId), {
    evaluation: {
      actualClass,
      isCorrect:   actualClass === predictedClass,
      submittedAt: serverTimestamp(),
    },
  })
}

export async function getScanHistory(userId: string): Promise<ScanRecord[]> {
  const q = query(
    collection(db, 'scans'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => {
    const data = d.data()
    const st: ScanType = data.scanType ?? 'liver'
    const isLung = st === 'lung'
    return {
      id:            d.id,
      userId:        data.userId,
      filename:      data.filename,
      fileType:      data.fileType,
      scanType:      st,
      timestamp:     (data.timestamp as Timestamp)?.toDate() ?? new Date(),
      patientName:   data.patientName   ?? undefined,
      patientAge:    data.patientAge    ?? undefined,
      patientGender: data.patientGender ?? undefined,
      result: {
        prediction:              data.result.prediction,
        result_class:            data.result.resultClass,
        tumor_probability:       isLung ? 0 : (data.result.tumorProbability ?? 0),
        non_tumor_probability:   isLung ? 0 : (data.result.nonTumorProbability ?? 0),
        cancer_probability:      isLung ? (data.result.tumorProbability ?? 0) : undefined,
        non_cancer_probability:  isLung ? (data.result.nonTumorProbability ?? 0) : undefined,
        lung_confidence:         data.result.lungConfidence ?? undefined,
        slices_analyzed:         data.result.slicesAnalyzed,
        affected_slices:         data.result.affectedSlices,
        affected_ratio:          data.result.affectedRatio,
        max_probability:         data.result.maxProbability,
        mean_probability:        data.result.meanProbability,
        decision_reason:         data.result.decisionReason,
      },
      evaluation: data.evaluation ?? null,
    } as ScanRecord
  })
}

export async function getScanById(scanId: string): Promise<ScanRecord | null> {
  const snap = await getDoc(doc(db, 'scans', scanId))
  if (!snap.exists()) return null
  const data = snap.data()
  const st: ScanType = data.scanType ?? 'liver'
  const isLung = st === 'lung'
  return {
    id:        snap.id,
    userId:    data.userId,
    filename:  data.filename,
    fileType:  data.fileType,
    scanType:  st,
    timestamp: (data.timestamp as Timestamp)?.toDate() ?? new Date(),
    result: {
      prediction:              data.result.prediction,
      result_class:            data.result.resultClass,
      tumor_probability:       isLung ? 0 : (data.result.tumorProbability ?? 0),
      non_tumor_probability:   isLung ? 0 : (data.result.nonTumorProbability ?? 0),
      cancer_probability:      isLung ? (data.result.tumorProbability ?? 0) : undefined,
      non_cancer_probability:  isLung ? (data.result.nonTumorProbability ?? 0) : undefined,
      lung_confidence:         data.result.lungConfidence ?? undefined,
      slices_analyzed:         data.result.slicesAnalyzed,
      affected_slices:         data.result.affectedSlices,
      affected_ratio:          data.result.affectedRatio,
      max_probability:         data.result.maxProbability,
      mean_probability:        data.result.meanProbability,
      decision_reason:         data.result.decisionReason,
    },
    evaluation: data.evaluation ?? null,
  } as ScanRecord
}

export async function resetUserEvaluations(userId: string, organ?: 'liver' | 'lung'): Promise<void> {
  const scans = await getScanHistory(userId)
  const toReset = scans.filter(s => s.evaluation && (!organ || s.scanType === organ))
  await Promise.all(toReset.map(s => updateDoc(doc(db, 'scans', s.id), { evaluation: null })))
}

export async function getPersonalMetrics(userId: string, organ: 'liver' | 'lung' = 'liver'): Promise<MetricsData> {
  const scans = await getScanHistory(userId)
  const positive = organ === 'liver' ? 'tumor'     : 'cancer'
  const negative = organ === 'liver' ? 'non-tumor' : 'non-cancer'
  const evaluated = scans.filter(s => s.evaluation && s.scanType === organ)

  let tp = 0, tn = 0, fp = 0, fn = 0
  for (const s of evaluated) {
    const pred   = s.result.result_class
    const actual = s.evaluation!.actualClass
    if (pred === positive && actual === positive) tp++
    if (pred === negative && actual === negative) tn++
    if (pred === positive && actual === negative) fp++
    if (pred === negative && actual === positive) fn++
  }

  const total     = tp + tn + fp + fn
  const accuracy  = total > 0 ? ((tp + tn) / total) * 100 : 0
  const precision = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 0
  const recall    = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 0
  const specificity = (tn + fp) > 0 ? (tn / (tn + fp)) * 100 : 0
  const f1 = (precision + recall) > 0
    ? (2 * precision * recall) / (precision + recall) : 0

  return {
    accuracy, precision, recall, specificity, f1_score: f1,
    total_samples: total,
    true_positives: tp, true_negatives: tn,
    false_positives: fp, false_negatives: fn,
  }
}

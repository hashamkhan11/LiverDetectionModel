export interface ScanRecord {
  id: string
  userId: string
  filename: string
  fileType: 'nifti' | 'image'
  timestamp: Date
  result: PredictionResult
  evaluation?: {
    actualClass: 'tumor' | 'non-tumor'
    isCorrect: boolean
    submittedAt: Date
  } | null
}

export interface PredictionResult {
  prediction: string
  result_class: 'tumor' | 'non-tumor' | 'not-liver'
  tumor_probability: number
  non_tumor_probability: number
  slices_analyzed?: number
  max_probability?: number
  mean_probability?: number
  affected_slices?: string
  affected_ratio?: string
  decision_reason?: string
  // Grad-CAM heatmap images (base64 PNG, only present when tumor detected)
  heatmap_image?: string | null
  original_image?: string | null
  heatmap_error?: string | null
  // Stage 1 liver check fields
  liver_probability?: number
  liver_slices_checked?: number
}

export interface MetricsData {
  accuracy: number
  precision: number
  recall: number
  specificity: number
  f1_score: number
  total_samples: number
  true_positives: number
  true_negatives: number
  false_positives: number
  false_negatives: number
}

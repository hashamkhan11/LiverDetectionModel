export type ScanType = 'liver' | 'lung'

export interface ScanRecord {
  id: string
  userId: string
  filename: string
  fileType: 'nifti' | 'image'
  scanType: ScanType
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
  // liver classes
  result_class: 'tumor' | 'non-tumor' | 'not-liver' | 'cancer' | 'non-cancer' | 'not-lung'
  // liver fields
  tumor_probability: number
  non_tumor_probability: number
  slices_analyzed?: number
  max_probability?: number
  mean_probability?: number
  affected_slices?: string
  affected_ratio?: string
  heatmap_image?: string | null
  original_image?: string | null
  heatmap_error?: string | null
  liver_probability?: number
  liver_slices_checked?: number
  // lung fields
  cancer_probability?: number
  non_cancer_probability?: number
  lung_confidence?: number
  // shared
  decision_reason?: string
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

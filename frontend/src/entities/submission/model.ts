export type SubmissionResult = "Accepted" | "Wrong Answer"

export type SubmissionSummary = {
  id: string
  title: string
  language: string
  result: SubmissionResult
  runtime: string
  time: string
}

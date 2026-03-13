export type RunCodeInput = {
  problemId: string
  language: string
  code: string
  inputs: string[]
}

export type TestcaseExecutionResult = {
  label: string
  input: string
  output: string
  expected: string
  status: string
}

export type RunCodeResult = {
  status: string
  passedCount: number
  totalCount: number
  runtime: string
  memory: string
  beats: string
  testcaseResults: TestcaseExecutionResult[]
}

export type SubmitCodeInput = RunCodeInput

export type SubmitCodeResult = RunCodeResult & {
  submissionId: string
}

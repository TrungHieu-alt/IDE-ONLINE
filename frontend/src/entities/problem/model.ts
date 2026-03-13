export type ProblemDifficulty = "Easy" | "Medium" | "Hard"

export type ProblemSummary = {
  id: string
  title: string
  difficulty: ProblemDifficulty
  category: string
  acceptance: string
  solvedBy: string
  time: string
  description?: string
}

export type ProblemDetail = ProblemSummary

export type WorkspaceCase = {
  label: string
  status: string
  input: string
  output: string
  expected: string
}

export type ProblemWorkspaceData = {
  problem: ProblemDetail
  cases: WorkspaceCase[]
  starterCode: string
}

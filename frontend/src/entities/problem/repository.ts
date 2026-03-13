import type { MaybePromise } from "@/shared/types/async"

import type { ProblemDetail, ProblemSummary, ProblemWorkspaceData } from "./model"

export interface ProblemRepository {
  list(): MaybePromise<ProblemSummary[]>
  getById(problemId: string): MaybePromise<ProblemDetail>
  getWorkspace(problemId: string): MaybePromise<ProblemWorkspaceData>
}

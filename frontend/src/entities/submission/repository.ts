import type { MaybePromise } from "@/shared/types/async"

import type { SubmissionSummary } from "./model"

export interface SubmissionRepository {
  listRecent(): MaybePromise<SubmissionSummary[]>
}

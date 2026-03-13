import type { MaybePromise } from "@/shared/types/async"

import type {
  RunCodeInput,
  RunCodeResult,
  SubmitCodeInput,
  SubmitCodeResult,
} from "./model"

export interface ExecutionRepository {
  run(input: RunCodeInput): MaybePromise<RunCodeResult>
  submit(input: SubmitCodeInput): MaybePromise<SubmitCodeResult>
}

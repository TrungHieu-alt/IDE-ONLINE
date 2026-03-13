import type { ApiClient } from "@/shared/api/api-client"

import type { RunCodeInput, RunCodeResult, SubmitCodeInput, SubmitCodeResult } from "./model"
import type { ExecutionRepository } from "./repository"

export class HttpExecutionRepository implements ExecutionRepository {
  constructor(private readonly apiClient: ApiClient) {}

  run(input: RunCodeInput) {
    return this.apiClient.post<RunCodeResult>("/executions/run", input)
  }

  submit(input: SubmitCodeInput) {
    return this.apiClient.post<SubmitCodeResult>("/executions/submit", input)
  }
}

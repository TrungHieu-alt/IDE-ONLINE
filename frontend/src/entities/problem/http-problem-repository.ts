import type { ApiClient } from "@/shared/api/api-client"

import type { ProblemRepository } from "./repository"

export class HttpProblemRepository implements ProblemRepository {
  constructor(private readonly apiClient: ApiClient) {}

  list() {
    return this.apiClient.get("/problems")
  }

  getById(problemId: string) {
    return this.apiClient.get(`/problems/${problemId}`)
  }

  getWorkspace(problemId: string) {
    return this.apiClient.get(`/problems/${problemId}/workspace`)
  }
}

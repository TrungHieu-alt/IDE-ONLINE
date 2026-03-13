import type { ApiClient } from "@/shared/api/api-client"

import type { SubmissionRepository } from "./repository"

export class HttpSubmissionRepository implements SubmissionRepository {
  constructor(private readonly apiClient: ApiClient) {}

  listRecent() {
    return this.apiClient.get("/submissions/recent")
  }
}

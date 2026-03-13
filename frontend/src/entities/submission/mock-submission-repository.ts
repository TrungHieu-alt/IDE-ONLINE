import { mockRecentSubmissions } from "@/mocks/fixtures/mock-oj"

import type { SubmissionRepository } from "./repository"

export class MockSubmissionRepository implements SubmissionRepository {
  listRecent() {
    return mockRecentSubmissions
  }
}

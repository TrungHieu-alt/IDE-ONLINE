import { mockProblems, mockWorkspaceCases, mockWorkspaceCode } from "@/mocks/fixtures/mock-oj"

import type { ProblemRepository } from "./repository"

export class MockProblemRepository implements ProblemRepository {
  list() {
    return mockProblems
  }

  getById(problemId: string) {
    return mockProblems.find((problem) => problem.id === problemId) ?? mockProblems[0]
  }

  getWorkspace(problemId: string) {
    return {
      problem: this.getById(problemId),
      cases: mockWorkspaceCases,
      starterCode: mockWorkspaceCode,
    }
  }
}

import type { ExecutionRepository } from "./repository"

export class MockExecutionRepository implements ExecutionRepository {
  run(input: { inputs: string[] }) {
    return {
      status: "Accepted",
      passedCount: input.inputs.length,
      totalCount: input.inputs.length,
      runtime: "92 ms",
      memory: "42.1 MB",
      beats: "74.3%",
      testcaseResults: input.inputs.map((testInput, index) => ({
        label: `Test ${index + 1}`,
        input: testInput,
        output: index === 1 ? "null" : "200",
        expected: index === 1 ? "null" : "200",
        status: "Accepted",
      })),
    }
  }

  submit(input: { problemId: string; inputs: string[] }) {
    return {
      submissionId: `mock-${input.problemId}-submission`,
      ...this.run(input),
    }
  }
}

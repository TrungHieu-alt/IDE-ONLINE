import { useRepositories } from "@/app/repositories"
import { useRepositoryValue } from "@/shared/lib/use-repository-value"

export function useProblems() {
  const { problems } = useRepositories()

  return useRepositoryValue(() => problems.list(), [problems])
}

export function useProblem(problemId: string) {
  const { problems } = useRepositories()

  return useRepositoryValue(() => problems.getById(problemId), [problemId, problems])
}

export function useProblemWorkspace(problemId: string) {
  const { problems } = useRepositories()

  return useRepositoryValue(() => problems.getWorkspace(problemId), [problemId, problems])
}

import { useRepositories } from "@/app/repositories"
import { useRepositoryValue } from "@/shared/lib/use-repository-value"

export function useRecentSubmissions() {
  const { submissions } = useRepositories()

  return useRepositoryValue(() => submissions.listRecent(), [submissions])
}

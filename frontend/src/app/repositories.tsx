import type { ReactNode } from "react"
import { createContext, useContext } from "react"

import { HttpExecutionRepository } from "@/entities/execution/http-execution-repository"
import { MockExecutionRepository } from "@/entities/execution/mock-execution-repository"
import type { ExecutionRepository } from "@/entities/execution/repository"
import { HttpProblemRepository } from "@/entities/problem/http-problem-repository"
import { MockProblemRepository } from "@/entities/problem/mock-problem-repository"
import type { ProblemRepository } from "@/entities/problem/repository"
import { HttpSubmissionRepository } from "@/entities/submission/http-submission-repository"
import { MockSubmissionRepository } from "@/entities/submission/mock-submission-repository"
import type { SubmissionRepository } from "@/entities/submission/repository"
import { ApiClient } from "@/shared/api/api-client"
import { appConfig, type DataSourceMode } from "@/shared/config/app-config"

type RepositoryRegistry = {
  problems: ProblemRepository
  submissions: SubmissionRepository
  executions: ExecutionRepository
}

const apiClient = new ApiClient({
  baseUrl: appConfig.apiBaseUrl,
})

function createRepositories(mode: DataSourceMode): RepositoryRegistry {
  if (mode === "http") {
    return {
      problems: new HttpProblemRepository(apiClient),
      submissions: new HttpSubmissionRepository(apiClient),
      executions: new HttpExecutionRepository(apiClient),
    }
  }

  return {
    problems: new MockProblemRepository(),
    submissions: new MockSubmissionRepository(),
    executions: new MockExecutionRepository(),
  }
}

const repositories = createRepositories(appConfig.dataSourceMode)

const RepositoryContext = createContext<RepositoryRegistry | null>(null)

type RepositoryProviderProps = {
  children: ReactNode
}

export function RepositoryProvider({ children }: RepositoryProviderProps) {
  return <RepositoryContext.Provider value={repositories}>{children}</RepositoryContext.Provider>
}

export function useRepositories() {
  const value = useContext(RepositoryContext)

  if (!value) {
    throw new Error("RepositoryProvider is missing")
  }

  return value
}

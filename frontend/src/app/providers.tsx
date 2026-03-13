import type { PropsWithChildren } from "react"

import { RepositoryProvider } from "@/app/repositories"
import { ThemeProvider } from "@/components/theme-provider"

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <RepositoryProvider>{children}</RepositoryProvider>
    </ThemeProvider>
  )
}

import { CaretLeft, Moon, Play, Sun } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import { appRoutes } from "@/app/routes"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import type { ProblemDetail } from "@/entities/problem/model"

type WorkspaceTopbarProps = {
  question: ProblemDetail
}

export function WorkspaceTopbar({ question }: WorkspaceTopbarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 px-4 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-[#f8f8f3]/95 px-3 py-2.5 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.35)] backdrop-blur dark:border-white/8 dark:bg-[#161b17]/95 dark:shadow-none sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            to={appRoutes.home}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/8"
          >
            <CaretLeft size={14} />
          </Link>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              {question.id}. {question.title}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 rounded-xl px-3">Run</Button>
          <Button
            size="sm"
            className="h-8 rounded-xl bg-[#1b231d] px-3 text-white hover:bg-[#111713] dark:bg-[#8bd450] dark:text-[#162012] dark:hover:bg-[#7bc041]"
          >
            <Play size={14} weight="fill" />
            Submit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-xl px-2.5"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
      </div>
    </header>
  )
}

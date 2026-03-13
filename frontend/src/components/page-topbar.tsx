import { type ReactNode } from "react"
import { Moon, Sparkle, Sun } from "@phosphor-icons/react"
import { NavLink } from "react-router-dom"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PageTopbarProps = {
  title?: ReactNode
  actions?: ReactNode
}

const navItems = [
  { label: "Questions", to: "/" },
  { label: "Workspace", to: "/problems/176" },
]

export function PageTopbar({ title: _title, actions }: PageTopbarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 px-4 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 rounded-2xl border border-black/8 bg-[#f8f8f3]/92 px-3 py-3 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.35)] backdrop-blur dark:border-white/8 dark:bg-[#161b17]/92 dark:shadow-none lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#1b231d] text-[#d8f0c6] dark:bg-[#8bd450] dark:text-[#162012]">
            <Sparkle size={18} weight="fill" />
          </div>
          <div className="min-w-0 text-sm font-semibold tracking-wide">Judgee</div>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:justify-center">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"}>
              {({ isActive }) => (
                <span
                  className={cn(
                    "inline-flex border-b border-transparent px-0 py-1 text-sm transition",
                    isActive
                      ? "border-[#1b231d] text-foreground dark:border-[#8bd450]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {actions}
          <Button size="sm" variant="outline" className="h-8 rounded-xl px-2.5" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
      </div>
    </header>
  )
}

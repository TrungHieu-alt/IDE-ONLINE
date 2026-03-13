import { Outlet } from "react-router-dom"

export function AppShell() {
  return (
    <div className="min-h-svh w-full bg-[linear-gradient(180deg,#f6f6f1_0%,#eeefe8_100%)] text-foreground dark:bg-[linear-gradient(180deg,#131713_0%,#171d18_100%)]">
      <Outlet />
    </div>
  )
}

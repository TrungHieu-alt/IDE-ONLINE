import { MagnifyingGlass } from "@phosphor-icons/react"

import { Input } from "@/components/ui/input"

type DashboardSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function DashboardSearch({ value, onChange }: DashboardSearchProps) {
  return (
    <div className="relative min-w-0 flex-1 lg:w-72">
      <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 rounded-xl border-black/10 bg-white pl-9 dark:border-white/10 dark:bg-white/5"
        placeholder="Search by title or id"
      />
    </div>
  )
}

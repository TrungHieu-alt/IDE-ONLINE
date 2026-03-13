import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import type { ProblemDetail } from "@/entities/problem/model"

import { workspacePaneHeaderClassName } from "@/features/workspace/workspace.constants"
import { difficultyClass } from "@/features/workspace/workspace.utils"

type ProblemDescriptionPanelProps = {
  question: ProblemDetail
}

export function ProblemDescriptionPanel({ question }: ProblemDescriptionPanelProps) {
  return (
    <Card className="h-full min-h-0 min-w-0 gap-0 overflow-hidden rounded-xl border border-black/8 bg-[#fcfcf8] py-0 ring-0 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.22)] dark:border-white/8 dark:bg-[#171d18] dark:shadow-none">
      <div className={workspacePaneHeaderClassName}>
        <CardTitle className="text-sm">Description</CardTitle>
      </div>
      <CardContent className="h-[calc(100%-36px)] overflow-auto px-3 py-2 sm:px-3.5 sm:py-2.5">
        <div className="space-y-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`rounded-full px-2.5 py-1 text-xs font-medium shadow-none ${difficultyClass(question.difficulty)}`}>
                {question.difficulty}
              </Badge>
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{question.category}</span>
            </div>
            <div className="space-y-2 text-sm leading-6 text-muted-foreground">
              <p>{question.description}</p>
              <p>Return the second highest distinct salary. If it does not exist, return `null`.</p>
            </div>
          </div>

          <div className="space-y-2 text-sm leading-6 text-muted-foreground">
            <h3 className="text-sm font-semibold text-foreground">Example 1</h3>
            <pre className="whitespace-pre-wrap bg-transparent p-0 font-mono text-[13px] leading-6 text-foreground">{`Input:\nEmployee table:\n+----+--------+\n| id | salary |\n+----+--------+\n| 1  | 100    |\n| 2  | 200    |\n| 3  | 300    |\n+----+--------+\nOutput:\n+---------------------+\n| SecondHighestSalary |\n+---------------------+\n| 200                 |\n+---------------------+`}</pre>
          </div>

          <div className="space-y-2 text-sm leading-6 text-muted-foreground">
            <h3 className="text-sm font-semibold text-foreground">Schema</h3>
            <pre className="whitespace-pre-wrap bg-transparent p-0 font-mono text-[13px] leading-6 text-foreground">{`+-------------+------+\n| Column Name | Type |\n+-------------+------+\n| id          | int  |\n| salary      | int  |\n+-------------+------+`}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

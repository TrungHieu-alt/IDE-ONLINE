import { Plus } from "@phosphor-icons/react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { workspacePaneHeaderClassName } from "@/features/workspace/workspace.constants"
import { testcaseStatusClass } from "@/features/workspace/workspace.utils"

type TestcaseResult = {
  label: string
  input: string
  output: string
  expected: string
  status: string
}

type TestResultsPanelProps = {
  testcaseResults: TestcaseResult[]
  caseInputs: string[]
  selectedCaseIndex: number
  setSelectedCaseIndex: (index: number) => void
  setCaseInputs: React.Dispatch<React.SetStateAction<string[]>>
}

export function TestResultsPanel({
  testcaseResults,
  caseInputs,
  selectedCaseIndex,
  setSelectedCaseIndex,
  setCaseInputs,
}: TestResultsPanelProps) {
  return (
    <Card className="h-full min-h-0 gap-0 overflow-hidden rounded-xl border border-black/8 bg-[#fcfcf8] py-0 ring-0 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.22)] dark:border-white/8 dark:bg-[#171d18] dark:shadow-none">
      <Tabs defaultValue="testcase" className="flex h-full min-h-0 flex-col gap-0">
        <div className={workspacePaneHeaderClassName}>
          <TabsList variant="line" className="h-full shrink-0 gap-3 p-0">
            <TabsTrigger value="testcase" className="h-full rounded-none border-0 px-0 text-xs font-medium text-muted-foreground after:bottom-0 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-0 dark:data-[state=active]:bg-transparent">
              Testcase
            </TabsTrigger>
            <TabsTrigger value="result" className="h-full rounded-none border-0 px-0 text-xs font-medium text-muted-foreground after:bottom-0 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-0 dark:data-[state=active]:bg-transparent">
              Test Result
            </TabsTrigger>
          </TabsList>
        </div>
        <CardContent className="h-[calc(100%-36px)] min-h-0 overflow-hidden">
          <TabsContent value="testcase" className="mt-0 flex h-full min-h-0 flex-col gap-2 overflow-hidden pt-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {testcaseResults.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedCaseIndex(index)}
                  className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCaseIndex === index
                      ? "border-[#1b231d] bg-[#1b231d] text-white dark:border-[#8bd450] dark:bg-[#8bd450] dark:text-[#162012]"
                      : "border-black/8 bg-white text-foreground hover:bg-[#f3f5ed] dark:border-white/8 dark:bg-white/4 dark:hover:bg-white/8"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 shrink-0 rounded-md border-dashed px-2.5"
                onClick={() => {
                  setCaseInputs((current) => [...current, ""])
                  setSelectedCaseIndex(caseInputs.length)
                }}
              >
                <Plus size={14} />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-black/8 bg-white p-2 dark:border-white/8 dark:bg-white/4">
              <Textarea
                value={caseInputs[selectedCaseIndex] ?? ""}
                onChange={(event) => {
                  const nextValue = event.target.value
                  setCaseInputs((current) => {
                    const nextInputs = [...current]
                    nextInputs[selectedCaseIndex] = nextValue
                    return nextInputs
                  })
                }}
                className="min-h-full rounded-lg border-black/8 bg-[#f3f5ed] text-sm dark:border-white/8 dark:bg-black/20"
              />
            </div>
          </TabsContent>

          <TabsContent value="result" className="mt-0 h-full overflow-auto space-y-2 pr-1 pt-2">
            <div className="rounded-lg border border-black/8 bg-white p-3 dark:border-white/8 dark:bg-white/4">
              <div className="text-sm font-medium">Execution result</div>
              <div className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">Accepted</div>
              <div className="mt-1 text-sm text-muted-foreground">3 / 3 sample cases passed · Runtime 92 ms</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-[#f3f5ed] p-3 dark:bg-black/20">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Runtime</div>
                  <div className="mt-1 font-medium">92 ms</div>
                </div>
                <div className="rounded-md bg-[#f3f5ed] p-3 dark:bg-black/20">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Memory</div>
                  <div className="mt-1 font-medium">42.1 MB</div>
                </div>
                <div className="rounded-md bg-[#f3f5ed] p-3 dark:bg-black/20">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Beats</div>
                  <div className="mt-1 font-medium">74.3%</div>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible defaultValue="case-result-0" className="space-y-2">
              {testcaseResults.map((item, index) => (
                <AccordionItem
                  key={`${item.label}-result`}
                  value={`case-result-${index}`}
                  className="rounded-lg border border-black/8 bg-white px-3 dark:border-white/8 dark:bg-white/4"
                >
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex w-full items-center justify-between gap-3 pr-3 text-left">
                      <div>
                        <div className="font-medium">{item.label}</div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${testcaseStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="grid gap-3">
                      <div className="rounded-lg bg-[#f3f5ed] p-3 dark:bg-black/20">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Input</div>
                        <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground">{caseInputs[index]}</pre>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-[#f3f5ed] p-3 dark:bg-black/20">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Output</div>
                          <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground">{item.output}</pre>
                        </div>
                        <div className="rounded-lg bg-[#f3f5ed] p-3 dark:bg-black/20">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Expected output</div>
                          <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground">{item.expected}</pre>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function JoinSessionCard() {
  const [sessionCode, setSessionCode] = useState("");

  return (
    <Card className="rounded-xl border border-[#d6decf] bg-[linear-gradient(180deg,#f7faf1_0%,#eef5e6_100%)] shadow-[0_18px_50px_-30px_rgba(74,101,46,0.35)] dark:border-[#293126] dark:bg-[linear-gradient(180deg,#1a2218_0%,#151b14_100%)] dark:shadow-none">
      <CardHeader>
        <CardTitle>Join a session</CardTitle>
        <CardDescription>
          Enter a room code to collaborate live with your team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="session-code"
            className="text-sm font-medium text-foreground"
          >
            Session code
          </label>
          <div className="flex gap-2">
            <Input
              id="session-code"
              value={sessionCode}
              onChange={(event) =>
                setSessionCode(event.target.value.toUpperCase())
              }
              placeholder="ABCD-1234"
              className="h-10 rounded-xl bg-white/85 px-3 dark:bg-black/20"
            />
            <Button
              size="lg"
              className="rounded-xl bg-[#1b231d] px-4 text-[#d8f0c6] hover:bg-[#253128] dark:bg-[#8bd450] dark:text-[#162012] dark:hover:bg-[#9be45f]"
            >
              Join
              <ArrowRight size={16} weight="bold" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

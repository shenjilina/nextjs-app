"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";

export default function ChatPage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");
  const handleSubmit = (message: PromptInputMessage) => {
    console.log(message);
  };

  return (
    <div className="min-h-screen w-full flex items-start justify-center">
      <div className="w-full max-w-3xl pt-24 px-4">
        <h1 className="text-5xl font-bold tracking-widest text-center">
          CHAT WIKI
        </h1>
        <div className="mt-8 rounded-2xl shadow-sm bg-card">
          {/* <div className="px-5 pt-5">
            <input
              type="text"
              placeholder="尽管问..."
              className="w-full bg-transparent outline-none text-lg placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">OK Computer</Button>
              <Button size="sm" variant="outline">PPT</Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm"><Cpu className="size-4" /></Button>
              <Button variant="ghost" size="icon-sm"><Presentation className="size-4" /></Button>
              <Button variant="ghost" size="sm">K2 <ChevronDown className="size-4" /></Button>
              <Button variant="ghost" size="icon-sm"><Clock className="size-4" /></Button>
              <Button variant="ghost" size="icon-sm"><Settings className="size-4" /></Button>
              <Button variant="secondary" size="icon"><ArrowUp className="size-4" /></Button>
            </div>
          </div> */}
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="尽管问..."
                ref={textareaRef}
              ></PromptInputTextarea>
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <Button size="sm" variant="outline">
                  OK Computer
                </Button>
                <Button size="sm" variant="outline">
                  Send
                </Button>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!(text.trim() || status) || status === "streaming"}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

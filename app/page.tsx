"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";
import { Tool, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { CodeBlock } from "@/components/ai-elements/code-block";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DatabaseIcon, MessageSquareIcon, SendIcon } from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop, error } = useChat({
    api: "/api/chat",
  });

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4 pb-24">
        <div className="flex items-center gap-3 justify-center py-6">
          <div className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2">
            <DatabaseIcon className="h-5 w-5 text-primary-foreground" />
            <h1 className="text-xl font-bold text-primary-foreground">
              Neon Database Chat
            </h1>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message || "An error occurred while processing your request."}
            </AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquareIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">Start a conversation</h2>
              <p className="text-muted-foreground max-w-md">
                Ask questions about your database in natural language. The AI will query your Neon database and provide structured results.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.role === "user" ? (
                  <div>
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return <p key={i}>{part.text}</p>;
                      }
                      return null;
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <MessageResponse key={i}>{part.text}</MessageResponse>
                        );
                      }
                      if (part.type === "tool-call") {
                        return (
                          <Tool key={i} defaultOpen={false}>
                            <ToolHeader
                              title={`Database Query: ${part.toolName}`}
                              type={part.type}
                              state="output-available"
                            />
                            <ToolInput input={part.args} />
                            {message.parts[i + 1]?.type === "tool-result" && (
                              <ToolOutput 
                                output={message.parts[i + 1].result} 
                                errorText={message.parts[i + 1].errorText}
                              />
                            )}
                          </Tool>
                        );
                      }
                      if (part.type === "tool-result") {
                        const toolCallIndex = message.parts.findIndex(
                          (p, idx) => idx < i && p.type === "tool-call"
                        );
                        if (toolCallIndex === -1) {
                          return (
                            <Tool key={i} defaultOpen={true}>
                              <ToolHeader
                                title="Database Result"
                                type="tool-result"
                                state="output-available"
                              />
                              <ToolOutput output={part.result} />
                            </Tool>
                          );
                        }
                        return null;
                      }
                      return null;
                    })}
                  </div>
                )}
              </MessageContent>
            </Message>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <Message from="assistant">
              <MessageContent>
                <Loader />
              </MessageContent>
            </Message>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed inset-x-0 bottom-0 border-t bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto w-full max-w-4xl p-4">
          <PromptInput
            onSubmit={() => {
              sendMessage({ text: input });
              setInput("");
            }}
          >
            <PromptInputTextarea
              name="message"
              placeholder="Ask about your database (e.g., 'Show me all users' or 'What are the recent orders?')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
            />
            <PromptInputFooter>
              <PromptInputSubmit
                disabled={isLoading || !input.trim()}
                onClick={isLoading ? stop : undefined}
              >
                <SendIcon className="h-4 w-4" />
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

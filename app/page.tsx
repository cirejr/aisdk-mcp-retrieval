"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import {
	Message,
	MessageContent,
	MessageResponse,
	MessageActions,
	MessageAction,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputTextarea,
	PromptInputFooter,
	PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";
import {
	Tool,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "@/components/ai-elements/tool";
import { CodeBlock } from "@/components/ai-elements/code-block";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DatabaseIcon, MessageSquareIcon, SendIcon, CopyIcon, RefreshCcwIcon } from "lucide-react";
import {
	Context,
	ContextTrigger,
	ContextContent,
	ContextContentHeader,
	ContextContentBody,
	ContextContentFooter,
} from "@/components/ai-elements/context";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ai-elements/reasoning";

export default function Home() {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status, stop, error, usage } = useChat({
		body: {
			// Pass any additional context or configuration needed for MCP
		},
	});

	const isLoading = status === "streaming" || status === "submitted";

	return (
		<div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
			<header className="flex items-center gap-3 justify-center py-6">
				<div className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2">
					<DatabaseIcon className="h-5 w-5 text-primary-foreground" />
					<h1 className="text-xl font-bold text-primary-foreground">
						Neon Database Chat
					</h1>
					{usage && (
						<Context
							usedTokens={usage.inputTokens + (usage.outputTokens || 0)}
							maxTokens={1000000} // Typical model limit
							usage={usage}
							modelId="gemini-3-flash-preview"
						>
							<ContextTrigger />
							<ContextContent>
								<ContextContentHeader />
								<ContextContentBody>
									<div className="space-y-2">
										<p className="text-sm">Model: Gemini 3 Flash Preview</p>
										<div className="grid grid-cols-2 gap-2 text-sm">
											<div className="bg-muted p-2 rounded">
												<p className="text-xs text-muted-foreground">
													Input Tokens
												</p>
												<p>{usage.inputTokens || 0}</p>
											</div>
											<div className="bg-muted p-2 rounded">
												<p className="text-xs text-muted-foreground">
													Output Tokens
												</p>
												<p>{usage.outputTokens || 0}</p>
											</div>
										</div>
									</div>
								</ContextContentBody>
								<ContextContentFooter />
							</ContextContent>
						</Context>
					)}
				</div>
			</header>

			{error && (
				<Alert variant="destructive" className="mx-4">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						{error.message ||
							"An error occurred while processing your request."}
					</AlertDescription>
				</Alert>
			)}

			<Conversation className="flex-1">
				<ConversationContent>
					{messages.length === 0 && (
						<ConversationEmptyState
							title="Start a conversation"
							description="Ask questions about your database in natural language. The AI will query your Neon database and provide structured results."
							icon={<MessageSquareIcon className="h-12 w-12 text-muted-foreground" />}
						/>
					)}

					{messages.map((message) => (
						<div key={message.id}>
							{message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
								<Sources>
									<SourcesTrigger
										count={
											message.parts.filter(
												(part) => part.type === 'source-url',
											).length
										}
									/>
									{message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
										<SourcesContent key={`${message.id}-source-${i}`}>
											<Source
												href={part.url}
												title={part.url}
											/>
										</SourcesContent>
									))}
								</Sources>
							)}
							{message.parts.map((part, i) => {
								switch (part.type) {
									case 'text':
										return (
											<Message key={`${message.id}-${i}`} from={message.role}>
												<MessageContent>
													<MessageResponse>
														{part.text}
													</MessageResponse>
												</MessageContent>
												{message.role === 'assistant' && (
													<MessageActions>
														<MessageAction
															onClick={() => {
																// Regenerate functionality would go here
																// For now, we'll just copy the text
																navigator.clipboard.writeText(part.text);
															}}
															label="Retry"
														>
															<RefreshCcwIcon className="size-3" />
														</MessageAction>
														<MessageAction
															onClick={() =>
																navigator.clipboard.writeText(part.text)
															}
															label="Copy"
														>
															<CopyIcon className="size-3" />
														</MessageAction>
													</MessageActions>
												)}
											</Message>
										);
									case 'reasoning':
										return (
											<Reasoning
												key={`${message.id}-reasoning-${i}`}
												className="w-full"
												isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
											>
												<ReasoningTrigger />
												<ReasoningContent>{part.text}</ReasoningContent>
											</Reasoning>
										);
									case 'tool-call':
										return (
											<Message key={`${message.id}-tool-${i}`} from={message.role}>
												<MessageContent>
													<Tool defaultOpen={false}>
														<ToolHeader
															title={`Database Query: ${part.toolName}`}
															type={part.type}
															state={part.state || "input-available"}
														/>
														<ToolInput input={part.args} />
														{message.parts[i + 1]?.type === "tool-result" && (
															<ToolOutput
																output={message.parts[i + 1].result}
																errorText={message.parts[i + 1].errorText}
															/>
														)}
													</Tool>
												</MessageContent>
											</Message>
										);
									case 'tool-result':
										const toolCallIndex = message.parts.findIndex(
											(p, idx) => idx < i && p.type === "tool-call",
										);
										if (toolCallIndex === -1) {
											return (
												<Message key={`${message.id}-tool-result-${i}`} from={message.role}>
													<MessageContent>
														<Tool defaultOpen={true}>
															<ToolHeader
																title="Database Result"
																type="tool-result"
																state="output-available"
															/>
															<ToolOutput output={part.result} />
														</Tool>
													</MessageContent>
												</Message>
											);
										}
										return null;
									default:
										return null;
								}
							})}
						</div>
					))}

					{isLoading && messages[messages.length - 1]?.role === "user" && (
						<Message from="assistant">
							<MessageContent>
								<Loader />
							</MessageContent>
						</Message>
					)}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			{/* Input Area */}
			<div className="fixed bottom-0 w-full border-t backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80">
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

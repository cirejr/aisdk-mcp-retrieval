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

export default function Home() {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status, stop } = useChat({

	});

	const isLoading = status === "streaming" || status === "submitted";

	return (
		<div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
			<main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pb-24">
				<h1 className="py-4 text-center text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
					AI SDK + MCP Demo
				</h1>

				{/* Messages */}
				<div className="flex flex-1 flex-col gap-4">
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
									<div>
										{message.parts.map((part, i) => {
											if (part.type === "text") {
												return (
													<MessageResponse key={i}>{part.text}</MessageResponse>
												);
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
				<div className="mx-auto w-full max-w-3xl p-4">
					<PromptInput
						onSubmit={() => {
							sendMessage({ text: input });
							setInput("");
						}}
					>
						<PromptInputTextarea
							name="message"
							placeholder="Type a message..."
							value={input}
							onChange={(e) => setInput(e.target.value)}
						/>
						<PromptInputFooter>
							<PromptInputSubmit
								disabled={isLoading}
								onClick={isLoading ? stop : undefined}
							/>
						</PromptInputFooter>
					</PromptInput>
				</div>
			</div>
		</div>
	);
}
import { ollama } from 'ai-sdk-ollama';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: ollama('gemma3:4b'), // Using locally available model
    messages,
  });

  return result.toTextStreamResponse();
}

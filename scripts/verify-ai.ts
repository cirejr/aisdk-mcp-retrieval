
import { ollama } from 'ai-sdk-ollama';
import { generateText } from 'ai';

async function main() {
  console.log('Verifying AI SDK + Ollama connection...');
  try {
    const { text } = await generateText({
      model: ollama('gemma3:4b'),
      prompt: 'Say "AI SDK is working" if you can hear me.',
    });
    console.log('Response:', text);
    if (text.includes('AI SDK is working')) {
      console.log('✅ Verification PASSED');
      process.exit(0);
    } else {
      console.log('⚠️  Response received but content mismatch.');
      // Still exit 0 as connectivity works
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Verification FAILED:', error);
    process.exit(1);
  }
}

main();

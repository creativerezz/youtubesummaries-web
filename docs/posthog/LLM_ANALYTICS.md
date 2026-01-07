# PostHog LLM Analytics Setup

This project includes PostHog LLM analytics integration for tracking OpenRouter/OpenAI API calls.

## LLM Analytics Dashboard

The [LLM analytics dashboard](https://app.posthog.com/llm-analytics) provides an overview of your LLM usage and performance. It includes insights on:

- Users
- Traces
- Costs
- Generations
- Latency

<ProductScreenshot
    imageLight="https://res.cloudinary.com/dmukukwp6/image/upload/llma_dashboard_c710e66b5e.png"
    imageDark="https://res.cloudinary.com/dmukukwp6/image/upload/llma_dashboard_dark_aef0f67baf.png"
    alt="LLM observability dashboard"
    classes="rounded"
/>

It can be filtered like any dashboard in PostHog, including by event, person, and group properties. Our SDKs autocapture especially useful properties like provider, tokens, cost, model, and more.

This dashboard is a great starting point for understanding your LLM usage and performance. You can use it to answer questions like:

- Are users using our LLM-powered features?
- What are my LLM costs by customer, model, and in total?
- Are generations erroring?
- How many of my users are interacting with my LLM features?
- Are there generation latency spikes?

To dive into specific generation events, click on the [generations](https://app.posthog.com/llm-analytics/generations) or [traces](https://app.posthog.com/llm-analytics/traces) tabs to get a list of each captured by PostHog.

## Setup

1. **Install dependencies** (already done):
   ```bash
   npm install @posthog/ai posthog-node openai
   ```

2. **Configure environment variables** in `.env.local`:
   ```env
   # PostHog Server Configuration (for LLM analytics)
   POSTHOG_API_KEY=your-posthog-project-api-key
   POSTHOG_HOST=https://app.posthog.com
   
   # OpenRouter API Configuration
   OPENROUTER_API_KEY=your-openrouter-api-key
   ```

3. **Get your API keys**:
   - PostHog: Get your project API key from [PostHog Settings](https://app.posthog.com/project/settings)
   - OpenRouter: Get your API key from [OpenRouter](https://openrouter.ai/keys)

## Usage

### Basic Usage

```typescript
import { getOpenAIClient } from '@/lib/openai-client'

const client = getOpenAIClient()

const completion = await client.chat.completions.create({
  model: 'openai/gpt-4o-mini',
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
  posthogDistinctId: 'user_123', // optional
  posthogTraceId: 'trace_123', // optional
  posthogProperties: { conversation_id: 'abc123' }, // optional
})
```

### Using the Helper Function

```typescript
import { generateSummaryWithAnalytics } from '@/lib/openai-client'

const summary = await generateSummaryWithAnalytics(transcript, {
  model: 'openai/gpt-4o-mini',
  distinctId: 'user_123',
  traceId: 'video_abc123',
  properties: { video_id: 'abc123' },
})
```

### API Route Example

An example API route is available at `/app/api/summarize/route.ts`:

```typescript
POST /api/summarize
Body: {
  transcript: string,
  videoId: string,
  userId?: string
}
```

## Tracked Properties

PostHog automatically captures these properties for each LLM call:

- `$ai_model` - The model used (e.g., `gpt-4o-mini`)
- `$ai_latency` - Call latency in seconds
- `$ai_input_tokens` - Input token count
- `$ai_output_tokens` - Output token count
- `$ai_total_cost_usd` - Total cost in USD
- `$ai_input` - List of messages sent
- `$ai_output_choices` - Response choices
- Plus any custom properties you pass

## Viewing Analytics

1. Go to your PostHog dashboard
2. Navigate to **LLM Analytics** section
3. View **Traces** and **Generations** tabs
4. Filter by model, cost, latency, etc.

## Notes

- The PostHog SDK fires async calls in the background - it doesn't proxy your API calls
- If PostHog is not configured, the OpenAI client will still work (just without analytics)
- You can track anonymously by not passing a `distinctId`


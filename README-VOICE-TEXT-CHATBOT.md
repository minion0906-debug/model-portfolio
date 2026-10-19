# Voice + Text AI Chatbot

This upgrade adds a floating assistant to the public site, backed by the OpenRouter OpenAI-compatible Chat Completions API from a server-side Next.js route.

## Configure

Add these to `.env.local` (do not prefix the API key with `NEXT_PUBLIC_`):

```env
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_MODEL="openrouter/free"
OPENROUTER_SITE_URL="https://your-domain.example"
OPENROUTER_SITE_NAME="Portfolio Assistant"
```

Restart the development server after changing environment variables. Create a key at https://openrouter.ai/keys and keep it private. The `openrouter/free` router selects an available free model, but availability and rate limits vary; free inference is not guaranteed to be uninterrupted. See https://openrouter.ai/pricing for current limits.

## Features

- Floating chat panel across pages via the root layout
- Text conversation with recent-message context
- Browser speech recognition for voice input where supported
- Browser text-to-speech for spoken assistant replies
- Voice output mute toggle
- Input length limits, bounded history, basic per-process rate limiting, and generic provider errors
- Server-side API key only; no browser exposure of credentials
- Chatbot is not authorized to confirm bookings or payment status

## Limitations and production checks

- Browser speech recognition support varies; it generally requires HTTPS (or localhost) and user permission. The widget falls back to typed messages.
- Text-to-speech uses the browser's available voice and can vary by device/browser.
- The current response is not streamed token-by-token.
- The included in-memory rate limit is per server process and is not a substitute for a shared production rate limiter/WAF on multi-instance deployments.
- Configure a privacy notice/consent policy appropriate for your jurisdiction before launch. Chat messages are sent to the selected OpenRouter model/provider for processing; do not ask visitors for sensitive personal, payment, or wallet credentials.
- Test the full build, browser microphone permissions, API key configuration, provider quota, and deployment behavior before treating this as production-ready.


## OpenRouter setup

The chat API calls `https://openrouter.ai/api/v1/chat/completions` from the server and sends the `HTTP-Referer` and `X-Title` headers. Keep `OPENROUTER_API_KEY` server-only; do not expose it through a `NEXT_PUBLIC_` variable. Set `OPENROUTER_MODEL` to `openrouter/free` to route to an available free model, or use a specific model ID listed as free on OpenRouter. Free models may be rate-limited, change, or be temporarily unavailable. Browser speech recognition and browser text-to-speech remain separate from the LLM provider.

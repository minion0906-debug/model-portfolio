# Voice + Text AI Chatbot

This upgrade adds a floating assistant to the public site, backed by the OpenAI Chat Completions API from a server-side Next.js route.

## Configure

Add these to `.env.local` (do not prefix the API key with `NEXT_PUBLIC_`):

```env
OPENAI_API_KEY="your-openai-api-key"
OPENAI_CHAT_MODEL="gpt-4o-mini"
```

Restart the development server after changing environment variables. Keep the API key private and set usage limits/budget alerts in your OpenAI account.

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
- Configure a privacy notice/consent policy appropriate for your jurisdiction before launch. Chat messages are sent to OpenAI for processing; do not ask visitors for sensitive personal, payment, or wallet credentials.
- Test the full build, browser microphone permissions, API key configuration, provider quota, and deployment behavior before treating this as production-ready.

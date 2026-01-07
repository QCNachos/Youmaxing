## Security Policy

### Reporting a vulnerability

- **Do not** open a public issue for security problems.
- Report privately to the maintainers with:
  - A clear description and steps to reproduce
  - Impact (data exposure, auth bypass, RCE, etc.)
  - A proposed fix if you have one

### Project security notes

- **Secrets**: Never commit secrets. Use `.env.local` for local development (ignored by git).
- **Supabase**:
  - Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is expected to be present in the client.
  - Never expose Supabase service role keys to the browser.
- **LLM Providers**:
  - Any OpenAI/Anthropic API keys must be server-only (no `NEXT_PUBLIC_*`).
  - Prefer routing LLM calls through server routes / server actions and add rate limiting.












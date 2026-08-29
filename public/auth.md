# UltravioletaDAO auth.md

Audience: autonomous agents and developers calling UltravioletaDAO endpoints.

## What needs no authentication (available today)
- x402 facilitator: https://facilitator.ultravioletadao.xyz - GET /supported, GET /health, POST /verify, POST /settle.
  Payments are authorized per request with an EIP-3009 `transferWithAuthorization` signature (x402 v1, scheme "exact"); no account, API key, registration or gas required. Body for /verify and /settle: `{"paymentPayload": ..., "paymentRequirements": ...}`.
- Membership application: POST https://api.ultravioletadao.xyz/apply (JSON body: email required; fullName, twitter, telegram, twitch, walletAddress, story, purpose, references optional). Returns 201 on success, 400 on invalid email, 429 if the same email applied in the last 24h.
- Remote MCP server: POST https://api.ultravioletadao.xyz/mcp (Streamable HTTP, JSON-RPC 2.0, protocol 2025-06-18).
  No authentication, no session, no payments: 12 read-only tools over public data plus `apply_dao_membership`,
  which writes through the same public POST /apply above. GET returns 405 (there is no SSE channel).
  Tool catalog: https://ultravioletadao.xyz/.well-known/mcp/server-card.json
- All discovery documents under https://ultravioletadao.xyz/.well-known/ (api-catalog, mcp/server-card.json, agent-skills/index.json, ai-catalog.json) and this file.

## OAuth 2.0 (planned, not deployed)
- Authorization server metadata: https://ultravioletadao.xyz/.well-known/oauth-authorization-server
- Protected resource metadata: https://ultravioletadao.xyz/.well-known/oauth-protected-resource
- Scopes declared there: read:metrics, write:apply, read:bounties, write:bounties, admin:bounties
- The authorization, token and key endpoints listed in those documents are not live yet. Do not attempt an OAuth flow; use the public endpoints above.
- Agent registration (dynamic client registration) is not open. To request credentials write to mailto:ultravioletadao@gmail.com.

## Rate limits and abuse
- No published rate limits. POST /apply rejects repeated applications from the same email within 24 hours (HTTP 429).
- Security issues: https://ultravioletadao.xyz/.well-known/security.txt

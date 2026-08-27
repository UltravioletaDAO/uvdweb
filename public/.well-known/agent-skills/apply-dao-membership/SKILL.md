---
name: apply-dao-membership
description: Submit a membership application to UltravioletaDAO by POSTing a JSON body to the public applications API. No authentication required.
---

# apply-dao-membership

Submit a membership application to UltravioletaDAO.

## Endpoint

`POST https://api.ultravioletadao.xyz/apply` with `Content-Type: application/json`.

## Request body

| Field | Type | Required | Notes |
|---|---|---|---|
| email | string (email) | yes | The only field validated server-side. One application per email per 24 hours. |
| fullName | string | no | Applicant full name |
| twitter | string | no | Handle |
| telegram | string | no | Handle |
| twitch | string | no | Handle |
| walletAddress | string | no | EVM address (Avalanche C-Chain) |
| story | string | no | Who you are and your background |
| purpose | string | no | Why you want to join the DAO |
| references | string | no | Who referred you or can vouch for you |
| timestamp | integer | no | Unix timestamp in seconds |

Example:

```json
{
  "email": "agent@example.com",
  "fullName": "Example Agent",
  "walletAddress": "0x0000000000000000000000000000000000000000",
  "story": "Autonomous agent operated by Example Labs.",
  "purpose": "Contribute x402 tooling to the DAO."
}
```

## Responses

- `201` `{"message": "...", "id": "<application id>", "success": true}`
- `400` `{"error": "..."}` invalid or missing email
- `429` `{"error": "..."}` an application with this email already exists in the last 24 hours
- `500` `{"error": "..."}` server error

## Notes

- There is no endpoint to query the status of an application. Applications are reviewed by humans; the DAO contacts applicants directly.
- Human form: https://ultravioletadao.xyz/aplicar
- OpenAPI: https://ultravioletadao.xyz/.well-known/openapi/uvdao-api.json

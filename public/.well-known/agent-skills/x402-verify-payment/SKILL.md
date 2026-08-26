---
name: x402-verify-payment
description: Verify an x402 v1 payment authorization (EIP-3009 transferWithAuthorization, scheme "exact") through the UltravioletaDAO facilitator before delivering a paid HTTP resource.
---

# x402-verify-payment

Verify that an x402 payment presented by a client is valid (signature, amount, network, deadline, nonce not used) without settling it on-chain.

## Endpoint

`POST https://facilitator.ultravioletadao.xyz/verify` with `Content-Type: application/json`.

## Request body

```json
{
  "paymentPayload": { "x402Version": 1, "scheme": "exact", "network": "<network>", "payload": { "...": "signed EIP-3009 authorization" } },
  "paymentRequirements": { "...": "the PaymentRequirements object the resource server returned in its HTTP 402 response" }
}
```

- `paymentPayload`: the x402 PaymentPayload decoded from the client's `X-PAYMENT` header.
- `paymentRequirements`: the x402 PaymentRequirements the resource server advertised (scheme, network, asset, payTo, maxAmountRequired, resource, ...).

## Responses

- `200` JSON verification result from the facilitator (valid / invalid with reason and payer).
- `400` `{"error": "..."}` malformed body (for example, missing `paymentPayload`).

## Discover networks and tokens

`GET https://facilitator.ultravioletadao.xyz/supported` returns `{"kinds":[{"x402Version":1,"scheme":"exact","network":"...","extra":{...}}]}` with the live list of networks, tokens and fee payers. Do not hardcode the list.

## Related

- Settle after a successful verification: `POST https://facilitator.ultravioletadao.xyz/settle` (skill `x402-settle-payment`).
- `GET https://facilitator.ultravioletadao.xyz/verify` returns a short description of the expected body.
- OpenAPI 3.1: https://facilitator.ultravioletadao.xyz/api-docs/openapi.json
- Source: https://github.com/UltravioletaDAO/x402-rs

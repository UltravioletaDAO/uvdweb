---
name: x402-settle-payment
description: Settle a verified x402 v1 payment on-chain through the UltravioletaDAO facilitator, which pays the gas and executes the EIP-3009 transfer.
---

# x402-settle-payment

Execute the on-chain settlement of an x402 payment. The facilitator submits the EIP-3009 `transferWithAuthorization` (or the chain-specific equivalent) and pays the gas; neither the client nor the resource server needs native tokens.

## Endpoint

`POST https://facilitator.ultravioletadao.xyz/settle` with `Content-Type: application/json`.

## Request body

Same object as `x402-verify-payment`:

```json
{
  "paymentPayload": { "x402Version": 1, "scheme": "exact", "network": "<network>", "payload": { "...": "signed EIP-3009 authorization" } },
  "paymentRequirements": { "...": "the PaymentRequirements object the resource server returned in its HTTP 402 response" }
}
```

## Responses

- `200` JSON settlement result from the facilitator (success flag, transaction reference, network, payer, or an error reason).
- `400` `{"error": "..."}` malformed body.

## Recommended flow

1. Resource server answers `402 Payment Required` with `paymentRequirements`.
2. Client signs the authorization and retries with an `X-PAYMENT` header.
3. Resource server calls `/verify`; on success delivers the resource and calls `/settle`.

## Related

- `GET https://facilitator.ultravioletadao.xyz/supported` for the live list of networks and tokens.
- `GET https://facilitator.ultravioletadao.xyz/settle` returns a short description of the expected body.
- OpenAPI 3.1: https://facilitator.ultravioletadao.xyz/api-docs/openapi.json
- Source: https://github.com/UltravioletaDAO/x402-rs

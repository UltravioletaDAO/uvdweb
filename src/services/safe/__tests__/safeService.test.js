import { proposeSafeTransaction } from '../safeService';

const SAFE = '0x52110a2Cc8B6bBf846101265edAAe34E753f3389';
// Tal como la entrega MetaMask (eth_requestAccounts): toda en minúsculas
const SENDER_LOWER = '0x857fe6150401bfb4641fe0d2b2621cc3b05543cd';
const SENDER_CHECKSUM = '0x857fe6150401bFB4641Fe0D2B2621cc3B05543Cd';

const TX_DATA = {
  to: '0x9641d764fc13c8B624c04430C7356C1C7C8102e2',
  value: '0',
  data: '0x8d80ff0a',
  operation: 1,
  safeTxGas: '0',
  baseGas: '0',
  gasPrice: '0',
  gasToken: '0x0000000000000000000000000000000000000000',
  refundReceiver: '0x0000000000000000000000000000000000000000',
  nonce: 339,
};

afterEach(() => {
  delete global.fetch;
});

test('el sender viaja con checksum EIP-55 aunque la wallet llegue en minúsculas', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({}) });

  await proposeSafeTransaction({
    safeAddress: SAFE,
    safeTransactionData: TX_DATA,
    safeTxHash: '0xabc',
    senderAddress: SENDER_LOWER,
    senderSignature: '0xsig',
    origin: '{"name":"Ruleta UVD"}',
  });

  expect(global.fetch).toHaveBeenCalledTimes(1);
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe(`https://api.safe.global/tx-service/avax/api/v2/safes/${SAFE}/multisig-transactions/`);
  expect(options.method).toBe('POST');
  const body = JSON.parse(options.body);
  expect(body.sender).toBe(SENDER_CHECKSUM);
  expect(body.contractTransactionHash).toBe('0xabc');
  expect(body.signature).toBe('0xsig');
  expect(body.nonce).toBe(339);
  expect(body.to).toBe(TX_DATA.to);
});

test('una respuesta no OK del servicio se convierte en error con el detalle', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 422,
    json: async () => ({ sender: ['Address is not checksumed'] }),
  });

  await expect(
    proposeSafeTransaction({
      safeAddress: SAFE,
      safeTransactionData: TX_DATA,
      safeTxHash: '0xabc',
      senderAddress: SENDER_LOWER,
      senderSignature: '0xsig',
    })
  ).rejects.toThrow('Safe API error 422');
});

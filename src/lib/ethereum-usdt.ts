const USDT_ETHEREUM = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const RPC_URL = process.env.ETHEREUM_RPC_URL;

async function rpc(method: string, params: unknown[]) {
  if (!RPC_URL) throw new Error("ETHEREUM_RPC_URL is not configured.");
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Ethereum RPC request failed.");
  const payload = await response.json() as { result?: unknown; error?: { message?: string } };
  if (payload.error) throw new Error(payload.error.message || "Ethereum RPC error.");
  return payload.result as any;
}

export function isValidEthereumAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function getUsdtWallet() {
  const wallet = process.env.ERC20_USDT_RECEIVE_ADDRESS?.trim() || "";
  return isValidEthereumAddress(wallet) ? wallet : "";
}

export async function verifyUsdtTransfer(input: { txHash: string; expectedAmountBaseUnits: bigint }) {
  if (!/^0x[a-fA-F0-9]{64}$/.test(input.txHash)) throw new Error("Enter a valid Ethereum transaction hash.");
  const wallet = getUsdtWallet();
  if (!wallet) throw new Error("USDT receiving wallet is not configured yet.");
  const chainId = await rpc("eth_chainId", []) as string;
  if (chainId !== "0x1") throw new Error("Configured Ethereum RPC endpoint is not connected to Ethereum Mainnet.");
  const receipt = await rpc("eth_getTransactionReceipt", [input.txHash]);
  if (!receipt) throw new Error("Transaction not found or not mined yet.");
  if (receipt.transactionHash?.toLowerCase() !== input.txHash.toLowerCase()) throw new Error("RPC returned a mismatched transaction receipt.");
  if (receipt.status !== "0x1") throw new Error("The blockchain transaction failed.");
  const latestBlockHex = await rpc("eth_blockNumber", []) as string;
  const confirmations = BigInt(latestBlockHex) - BigInt(receipt.blockNumber) + BigInt(1);
  const requiredConfirmations = BigInt(process.env.ERC20_REQUIRED_CONFIRMATIONS || "12");
  if (confirmations < requiredConfirmations) throw new Error(`Transaction needs ${requiredConfirmations} confirmations; currently ${confirmations}.`);

  let received = BigInt(0);
  let sender = "";
  for (const log of (receipt.logs || []) as Array<{ address: string; topics: string[]; data: string; transactionHash?: string }>) {
    if (log.address?.toLowerCase() !== USDT_ETHEREUM || log.topics?.[0]?.toLowerCase() !== TRANSFER_TOPIC || log.topics.length < 3) continue;
    const to = `0x${log.topics[2].slice(-40)}`.toLowerCase();
    if (to !== wallet.toLowerCase()) continue;
    received += BigInt(log.data || "0x0");
    sender = `0x${log.topics[1].slice(-40)}`;
  }
  if (received < input.expectedAmountBaseUnits) throw new Error("Verified USDT transfer amount is below the required price.");
  return { wallet, amountBaseUnits: received.toString(), sender, confirmations: Number(confirmations), blockNumber: Number(BigInt(receipt.blockNumber)) };
}

import { ethers } from 'ethers';

// ── Config ────────────────────────────────────────────────────────────────────
// RPC_URL: the gateway (works for JSON-RPC on both local and production)
// EXPLORER_API: the sequencer's explorer REST endpoints (local only on :8546)
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://rpc-testnet.brixs.space';
export const EXPLORER_API = import.meta.env.VITE_EXPLORER_API || 'https://rpc-testnet.brixs.space';
export const CHAIN_ID = 51515;
export const CHAIN_NAME = 'Brixs Chain Testnet';
export const NATIVE_TOKEN = 'BRIXS';

export const provider = new ethers.JsonRpcProvider(RPC_URL);

// ── Formatters ────────────────────────────────────────────────────────────────
export const formatTimeAgo = (timestamp: number) => {
  if (!timestamp) return '—';
  const ts = timestamp > 1e12 ? Math.floor(timestamp / 1000) : timestamp;
  const seconds = Math.floor(Date.now() / 1000) - ts;
  if (seconds < 60) return `${Math.max(0, seconds)} secs ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;
  return `${Math.floor(hours / 24)} days ago`;
};

export const shortHash = (hash: string, chars = 8) =>
  hash ? `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}` : '—';

export const formatBrixs = (wei: string | bigint) => {
  try {
    const val = parseFloat(ethers.formatEther(wei.toString()));
    return val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  } catch { return '0.0000'; }
};

// ── Explorer REST API (sequencer on :8546, local only) ─────────────────────
async function explorerFetch(path: string) {
  const res = await fetch(`${EXPLORER_API}${path}`);
  if (!res.ok) throw new Error(`Explorer API error: ${res.status}`);
  return res.json();
}

export const getExplorerStats  = () => explorerFetch('/explorer/stats');
export const getExplorerBlocks = (page = 1, limit = 25) => explorerFetch(`/explorer/blocks?page=${page}&limit=${limit}`);
export const getExplorerTxs    = (page = 1, limit = 25) => explorerFetch(`/explorer/txs?page=${page}&limit=${limit}`);
export const getExplorerTx     = (hash: string)         => explorerFetch(`/explorer/tx/${hash}`);
export const getExplorerBlock  = (id: string)           => explorerFetch(`/explorer/block/${id}`);
export const getExplorerAddress = (addr: string)        => explorerFetch(`/explorer/address/${addr}`);
export const getExplorerPending = ()                    => explorerFetch('/explorer/pending');

// ── Ethers/RPC — these work on BOTH local and production ──────────────────
export const getLatestBlockInfo = async () => {
  try {
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    let baseFee = 0;
    if (block?.baseFeePerGas) baseFee = parseFloat(ethers.formatUnits(block.baseFeePerGas, 'gwei'));
    return { blockNumber, baseFee: baseFee.toFixed(2), timestamp: block?.timestamp };
  } catch { return null; }
};

export const getAddressInfo = async (address: string) => {
  try {
    const balanceWei = await provider.getBalance(address);
    const txCount = await provider.getTransactionCount(address);
    return { address, balance: ethers.formatEther(balanceWei), txCount };
  } catch { return null; }
};

export const getTransactionDetails = async (txHash: string) => {
  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) return null;
    const receipt = await provider.getTransactionReceipt(txHash).catch(() => null);
    let blockTimestamp: number | null = null;
    if (tx.blockNumber) {
      const block = await provider.getBlock(tx.blockNumber).catch(() => null);
      blockTimestamp = block?.timestamp ?? null;
    }
    return {
      hash: tx.hash,
      status: receipt ? receipt.status : null,
      blockNumber: tx.blockNumber,
      timestamp: blockTimestamp,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : '1',
      gasUsed: receipt ? receipt.gasUsed.toString(16) : null,
      nonce: tx.nonce,
      data: tx.data,
    };
  } catch { return null; }
};

// ── Faucet — posts to the gateway's /faucet endpoint ─────────────────────
export const requestFaucet = async (address: string) => {
  const res = await fetch(`${RPC_URL}/faucet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  return res.json();
};

// ── Broadcast raw tx ──────────────────────────────────────────────────────
export const broadcastTx = async (rawTx: string) => {
  try {
    const txHash = await provider.send('eth_sendRawTransaction', [rawTx]);
    return { success: true, txHash };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

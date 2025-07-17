
import { EdgeClient } from '@honeycomb-protocol/edge-client';
import { Keypair } from '@solana/web3.js';

const HONEYCOMB_RPC_URL = process.env.NEXT_PUBLIC_HONEYCOMB_RPC_URL || 'https://api.mainnet-beta.solana.com';

const client = new EdgeClient(HONEYCOMB_RPC_URL);

// This keypair should be stored securely and not exposed on the client-side.
// For the purpose of this example, we are generating a new keypair.
// In a real-world application, you would use a securely stored keypair.
const feePayer = new Keypair();

export { client, feePayer };

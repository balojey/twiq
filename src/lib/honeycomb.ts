
import { createEdgeClient } from '@honeycomb-protocol/edge-client';

const HONEYCOMB_EDGE_CLIENT_URL = process.env.VITE_HONEYCOMB_EDGE_CLIENT_URL || "https://edge.test.honeycombprotocol.com";

export const client = createEdgeClient(HONEYCOMB_EDGE_CLIENT_URL, true);

import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("911VdUg43JGvomS2eCqKHJcUZ6J9SCjb371w6Xst7YMD");
export const BRIDGE_SEED = "bridge_vault_v1";
export const connection = new Connection(clusterApiUrl("devnet"));

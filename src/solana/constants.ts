import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("7N9UCyKUqac5JuEjn4inZcBFhi87FXDRy3rP1mNhTrdB");
export const BRIDGE_SEED = "bridge_vault_v2";
export const connection = new Connection(clusterApiUrl("devnet"));

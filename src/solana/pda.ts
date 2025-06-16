import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, BRIDGE_SEED } from "./constants";

export async function getBridgePda(): Promise<PublicKey> {
  // Check if the program ID is valid base58 and on curve
  if (!PublicKey.isOnCurve(PROGRAM_ID.toBuffer())) {
    console.error("❌ Program ID is not on curve! This is unusual for a program ID.");
  } else {
    console.log("✔️ Program ID is valid and on curve.");
  }
  
  // Check if the seed is valid
  const seedStr = BRIDGE_SEED;
  const seed = Buffer.from(seedStr);
  if (seed.length > 32) {
    console.error("❌ Seed is too long. Must be ≤ 32 bytes.");
  } else {
    console.log(`✔️ Seed "${seedStr}" is valid (${seed.length} bytes).`);
  }

  try {
    // 0. Logging the parameters to be used
    console.log("Generating PDA with:", {
      SEED: BRIDGE_SEED,
      SEED_BYTES: Buffer.from(BRIDGE_SEED),
      PROGRAM_ID: PROGRAM_ID.toBase58()
    });

    // 1. Generate PDA with bump seed
    const [pda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(BRIDGE_SEED)],
      PROGRAM_ID
    );

    // 2. Validate the PDA - PDAs should be OFF the curve, not ON the curve!
    if (PublicKey.isOnCurve(pda.toBuffer())) {
      throw new Error(`Generated invalid PDA: ${pda.toBase58()} - PDA should be OFF the curve!`);
    }

    // 3. Log the data
    console.log("✔️ Generated valid PDA:", {
      address: pda.toBase58(),
      bump,
      seed: BRIDGE_SEED,
      programId: PROGRAM_ID.toBase58(),
      isOffCurve: !PublicKey.isOnCurve(pda.toBuffer()) // This should be true for valid PDAs
    });

    return pda;
  } catch (error) {
    console.error("PDA Generation Failed:", {
      seed: BRIDGE_SEED,
      programId: PROGRAM_ID.toBase58(),
      error
    });
    throw new Error("Failed to generate valid bridge PDA");
  }
}
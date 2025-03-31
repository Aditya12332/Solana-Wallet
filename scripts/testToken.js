// scripts/testToken.js

import { Connection, Keypair, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { createMint, mintTo, getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';

(async () => {
  // Connect to devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Generate a new fee payer keypair (for testing)
  const feePayer = Keypair.generate();
  console.log('Fee Payer PublicKey:', feePayer.publicKey.toBase58());

  // Request airdrop for feePayer
  const airdropSignature = await connection.requestAirdrop(feePayer.publicKey, 2e9);
  await connection.confirmTransaction(airdropSignature);
  console.log('Airdrop complete.');

  // Create a new token mint
  const mint = await createMint(
    connection,
    feePayer, // fee payer
    feePayer.publicKey, // mint authority
    null,      // freeze authority (optional)
    0          // decimals
  );
  console.log('New Token Mint:', mint.toBase58());

  // Get or create an associated token account for feePayer
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    feePayer,
    mint,
    feePayer.publicKey
  );
  console.log('Token Account:', tokenAccount.address.toBase58());

  // Mint 1 token to the associated token account
  const mintSignature = await mintTo(
    connection,
    feePayer,
    mint,
    tokenAccount.address,
    feePayer.publicKey,
    1
  );
  console.log('Mint Signature:', mintSignature);
})();


/*Fee Payer PublicKey: 21rSuk2QjArP1ztzz639KV8MMSSbcLT7n6zmxiNWC9Cg
Airdrop complete.
New Token Mint: 3bRbzMW7KRg5NLFzMyLppExDhvpwyq26HaXExXevsnVM*/
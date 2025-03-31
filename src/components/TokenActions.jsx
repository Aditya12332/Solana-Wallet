import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferInstruction,
} from '@solana/spl-token';

const TokenActions = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [status, setStatus] = useState('');
  const amountToMint = 1;   // For decimals=0
  const amountToSend = 1;   // For transfer

  // Create Token (For demonstration; may not work with browser wallets like Phantom)
  const createToken = async () => {
    if (!publicKey) return setStatus("Wallet not connected.");
    setStatus("Creating token...");
    try {
      const newMint = await createMint(
        connection,
        publicKey, // fee payer (will fail with Phantom because it needs a full keypair)
        publicKey, // mint authority (Phantom only exposes public key)
        null,
        0
      );
      setStatus(`Token created! Mint Address: ${newMint.toBase58()}`);
    } catch (error) {
      console.error("Create token error:", error);
      setStatus("Error creating token. (This function may not work with Phantom.)");
    }
  };

  // Mint Token Function
  const mintToken = async () => {
    if (!publicKey) return setStatus("Wallet not connected.");
    setStatus("Minting token...");
    try {
      const mintAddressInput = window.prompt("Enter the pre-deployed mint address:");
      if (!mintAddressInput) return setStatus("Mint address is required.");
      const mintPubKey = new PublicKey(mintAddressInput);

      // Derive the associated token account (ATA) for your wallet
      const ata = await getAssociatedTokenAddress(mintPubKey, publicKey);
      console.log("Derived ATA:", ata.toBase58());

      let transaction = new Transaction();
      const ataInfo = await connection.getAccountInfo(ata);
      if (ataInfo === null) {
        const createAtaIx = createAssociatedTokenAccountInstruction(
          publicKey,
          ata,
          publicKey,
          mintPubKey
        );
        transaction.add(createAtaIx);
        const ataTxSig = await sendTransaction(transaction, connection);
        console.log("Created ATA, signature:", ataTxSig);
        await connection.confirmTransaction(ataTxSig);
      }

      // Mint tokens to the ATA
      const mintIx = createMintToInstruction(
        mintPubKey,
        ata,
        publicKey,
        amountToMint
      );
      transaction = new Transaction().add(mintIx);
      const mintTxSig = await sendTransaction(transaction, connection);
      console.log("Mint Tx Signature:", mintTxSig);
      setStatus(`Token minted! Signature: ${mintTxSig}`);
    } catch (error) {
      console.error("Minting error:", error);
      setStatus("Error minting token.");
    }
  };

  // Send Token Function
  const sendToken = async () => {
    if (!publicKey) return setStatus("Wallet not connected.");
    setStatus("Sending token...");
    try {
      const mintAddressInput = window.prompt("Enter the mint address:");
      if (!mintAddressInput) return setStatus("Mint address is required.");
      const recipientAddressInput = window.prompt("Enter recipient wallet address:");
      if (!recipientAddressInput) return setStatus("Recipient address is required.");

      const mintPubKey = new PublicKey(mintAddressInput);
      const recipientPubKey = new PublicKey(recipientAddressInput);

      const senderATA = await getAssociatedTokenAddress(mintPubKey, publicKey);
      const recipientATA = await getAssociatedTokenAddress(mintPubKey, recipientPubKey);

      let transaction = new Transaction();
      const recipientAtaInfo = await connection.getAccountInfo(recipientATA);
      if (recipientAtaInfo === null) {
        const createRecipientAtaIx = createAssociatedTokenAccountInstruction(
          publicKey,
          recipientATA,
          recipientPubKey,
          mintPubKey
        );
        transaction.add(createRecipientAtaIx);
      }

      const transferIx = createTransferInstruction(
        senderATA,
        recipientATA,
        publicKey,
        amountToSend
      );
      transaction.add(transferIx);
      const transferTxSig = await sendTransaction(transaction, connection);
      console.log("Transfer Tx Signature:", transferTxSig);
      setStatus(`Token sent! Signature: ${transferTxSig}`);
    } catch (error) {
      console.error("Transfer error:", error);
      setStatus("Error sending token.");
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-2xl font-bold">Token Actions</h2>
      <div className="flex flex-col gap-4">
        <button onClick={createToken} className="primary">
          Create Token
        </button>
        <button onClick={mintToken} className="primary">
          Mint Token
        </button>
        <button onClick={sendToken} className="primary">
          Send Token
        </button>
      </div>
      {status && <p className="mt-4 text-lg">{status}</p>}
    </div>
  );
};

export default TokenActions;

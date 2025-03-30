import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const TokenActions = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [status, setStatus] = useState('');

  const createToken = async () => {
    if (!publicKey) return setStatus("Wallet not connected.");
    setStatus("Creating token...");
    try {
      // Replace with your actual token creation logic
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Use your program address or appropriate destination
          lamports: 0,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      setStatus(`Token created! Signature: ${signature}`);
    } catch (error) {
      console.error(error);
      setStatus("Error creating token.");
    }
  };

  const mintToken = async () => {
    if (!publicKey) return setStatus("Wallet not connected.");
    setStatus("Minting token...");
    try {
      // Replace with your actual mint logic
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Use mint authority or appropriate address
          lamports: 0,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      setStatus(`Token minted! Signature: ${signature}`);
    } catch (error) {
      console.error(error);
      setStatus("Error minting token.");
    }
  };

  const sendToken = async () => {
    if (!publicKey) return setStatus("Wallet not connected.");
    setStatus("Sending token...");
    try {
      const destination = window.prompt("Enter destination wallet address:");
      if (!destination) return setStatus("Transaction cancelled.");

      const destPubKey = new PublicKey(destination);
      // Replace with your actual token transfer logic
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: destPubKey,
          lamports: 0,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      setStatus(`Token sent! Signature: ${signature}`);
    } catch (error) {
      console.error(error);
      setStatus("Error sending token.");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Token Actions</h2>
      <div className="flex flex-col space-y-4">
        <button
          onClick={createToken}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Create Token
        </button>
        <button
          onClick={mintToken}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Mint Token
        </button>
        <button
          onClick={sendToken}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Send Token
        </button>
      </div>
      {status && <p className="mt-4 text-lg">{status}</p>}
    </div>
  );
};

export default TokenActions;

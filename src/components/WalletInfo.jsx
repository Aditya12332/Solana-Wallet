import React, { useMemo, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { clusterApiUrl, Connection } from '@solana/web3.js';

function WalletInfo() {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(null);
  const network = 'devnet';

  const connection = useMemo(() => new Connection(clusterApiUrl(network)), [network]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / 1e9);
      }
    };
    fetchBalance();
  }, [publicKey, connection]);

  const copyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toBase58());
        alert('Address copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  return publicKey ? (
    <div className="mt-4 text-center">
      <p className="text-lg">
        Wallet Address: <span className="font-mono text-indigo-600">{publicKey.toBase58()}</span>
      </p>
      <p className="text-lg font-bold mt-2">
        SOL Balance: {balance !== null ? `${balance} SOL` : 'Loading...'}
      </p>
      <button onClick={copyAddress} className="primary mt-2">
        Copy Address
      </button>
    </div>
  ) : (
    <p className="mt-4 text-gray-500">Connect your wallet to see details.</p>
  );
}

export default WalletInfo;

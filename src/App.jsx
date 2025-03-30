import React, { useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';

// Default styles for wallet adapter UI
import '@solana/wallet-adapter-react-ui/styles.css';

// Component to display wallet details and copy address
function WalletInfo() {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(null);
  const network = 'devnet';
  
  // Memoize connection instance so it doesn't reinitialize on every render.
  const connection = useMemo(() => new Connection(clusterApiUrl(network)), [network]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / 1e9); // convert lamports to SOL
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
        Wallet Address: <span className="font-mono text-blue-600">{publicKey.toBase58()}</span>
      </p>
      <p className="text-lg font-bold mt-2">
        SOL Balance: {balance !== null ? `${balance} SOL` : 'Loading...'}
      </p>
      <button
        onClick={copyAddress}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Copy Address
      </button>
    </div>
  ) : (
    <p className="mt-4 text-gray-500">Connect your wallet to see details.</p>
  );
}

function App() {
  // Specify the network (devnet)
  const network = 'devnet';
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Configure supported wallet adapters
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-4">Solana Wallet Integration</h1>
            {/* Connect/disconnect wallet button */}
            <WalletMultiButton />
            {/* Display wallet details & copy address functionality */}
            <WalletInfo />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const TransactionHistory = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    setLoading(true);
    const fetchTransactions = async () => {
      try {
        // Fetch up to 10 recent confirmed transactions for the wallet
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
        setTransactions(signatures);
      } catch (error) {
        console.error("Failed to fetch transaction history", error);
      }
      setLoading(false);
    };
    fetchTransactions();
  }, [publicKey, connection]);

  if (!publicKey) {
    return <p className="mt-4 text-gray-500">Connect your wallet to view transaction history.</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      {loading ? (
        <p>Loading transaction history...</p>
      ) : transactions.length === 0 ? (
        <p>No recent transactions found.</p>
      ) : (
        <ul className="list-disc pl-6">
          {transactions.map((tx) => (
            <li key={tx.signature}>
              <a 
                className="text-indigo-600 hover:underline" 
                href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {tx.signature.slice(0, 8)}... (Status: {tx.confirmationStatus})
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionHistory;

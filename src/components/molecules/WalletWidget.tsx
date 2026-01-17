import { Coins, TrendingUp, History } from 'lucide-react';
import { useWallet } from '../../contexts/Wallet';
import { useState } from 'react';

export const WalletWidget = () => {
  const { balance, transactions, loading } = useWallet();
  const [showHistory, setShowHistory] = useState(false);

  if (loading || !balance) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
        <Coins size={16} className="text-yellow-600 dark:text-yellow-500" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 rounded-full transition-colors"
      >
        <Coins size={16} className="text-yellow-600 dark:text-yellow-500" />
        <span className="text-sm font-bold text-yellow-900 dark:text-yellow-300">
          {balance.totalPoints.toLocaleString()}
        </span>
      </button>

      {showHistory && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowHistory(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowHistory(false);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close wallet history"
          />
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Wallet Balance</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-600 dark:text-green-500" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Earned</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {balance.lifetimeEarned.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <History size={16} className="text-red-600 dark:text-red-500" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Spent</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {balance.lifetimeSpent.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Recent Transactions
              </h4>
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                    No transactions yet
                  </p>
                ) : (
                  transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ml-2 flex-shrink-0 ${
                          transaction.amount > 0
                            ? 'text-green-600 dark:text-green-500'
                            : 'text-red-600 dark:text-red-500'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

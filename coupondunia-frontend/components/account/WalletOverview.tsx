'use client'
import { useState, useEffect } from 'react'
import { Landmark, ArrowUpRight, DollarSign, Wallet, Send, RefreshCw, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/Button'

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
  status: 'Confirmed' | 'Pending' | 'Processing'
}

interface WalletState {
  total: number
  available: number
  pending: number
  transactions: Transaction[]
}

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', date: '2026-06-12', description: 'Swiggy Food Order Cashback', amount: 30.0, type: 'credit', status: 'Confirmed' },
  { id: 'tx-2', date: '2026-06-10', description: 'Myntra Fashion Order Cashback', amount: 50.0, type: 'credit', status: 'Confirmed' },
  { id: 'tx-3', date: '2026-06-08', description: 'AJIO Shoes Deal Cashback', amount: 60.0, type: 'credit', status: 'Pending' },
  { id: 'tx-4', date: '2026-06-05', description: 'Flipkart Electronics Sale Cashback', amount: 100.0, type: 'credit', status: 'Confirmed' },
]

export function WalletOverview() {
  const { user } = useAuthStore()
  const [wallet, setWallet] = useState<WalletState>({ total: 240, available: 180, pending: 60, transactions: DEFAULT_TRANSACTIONS })
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'bank' | 'paytm' | 'amazon'>('upi')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('180')
  const [upiId, setUpiId] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [bankIfsc, setBankIfsc] = useState('')
  const [bankHolder, setBankHolder] = useState('')
  const [paytmNumber, setPaytmNumber] = useState('')
  const [amazonEmail, setAmazonEmail] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (!user) return
    const stored = localStorage.getItem(`wallet:${user.id}`)
    if (stored) {
      try {
        setWallet(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
  }, [user])

  const saveWallet = (newWallet: WalletState) => {
    setWallet(newWallet)
    if (user) {
      localStorage.setItem(`wallet:${user.id}`, JSON.stringify(newWallet))
    }
  }

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(withdrawAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (amountNum > wallet.available) {
      toast.error('Withdrawal amount exceeds available balance')
      return
    }

    // Process withdrawal
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Withdrawal Request (${withdrawMethod.toUpperCase()})`,
      amount: amountNum,
      type: 'debit',
      status: 'Processing',
    }

    const updatedWallet: WalletState = {
      total: wallet.total - amountNum,
      available: wallet.available - amountNum,
      pending: wallet.pending,
      transactions: [newTx, ...wallet.transactions],
    }

    saveWallet(updatedWallet)
    setWithdrawSuccess(true)
    toast.success('Withdrawal request submitted successfully!')
  }

  const closeWithdrawModal = () => {
    setWithdrawOpen(false)
    setWithdrawSuccess(false)
    // reset inputs
    setWithdrawAmount('180')
    setUpiId('')
    setBankAccount('')
    setBankIfsc('')
    setBankHolder('')
    setPaytmNumber('')
    setAmazonEmail('')
  }

  return (
    <div className="space-y-6">
      {/* Wallet Card Grid */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 shadow-md border border-neutral-700/50 flex flex-col justify-between min-h-[200px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-neutral-800/80 flex items-center justify-center border border-neutral-700/50">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-neutral-300">Cashback Wallet</span>
          </div>
          <span className="text-xs font-black text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
            Real Cashback
          </span>
        </div>

        <div className="my-5">
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Available Balance</p>
          <h2 className="text-3xl font-black mt-1 tracking-tight text-white flex items-baseline">
            ₹{wallet.available.toFixed(2)}
          </h2>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-800">
            <div>
              <p className="text-[10px] text-neutral-400 font-bold">TOTAL EARNED</p>
              <p className="text-sm font-extrabold text-neutral-200">₹{wallet.total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-bold">PENDING</p>
              <p className="text-sm font-extrabold text-yellow-400">₹{wallet.pending.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setWithdrawOpen(true)}
          disabled={wallet.available <= 0}
          className="w-full bg-primary hover:bg-[#C62F2F] text-white font-extrabold py-3 rounded-xl cursor-pointer"
        >
          Withdraw Cashback
        </Button>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-900 text-sm">Recent Transactions</h3>
          <RefreshCw className="w-3.5 h-3.5 text-gray-400 hover:text-primary transition-colors cursor-pointer" />
        </div>

        <div className="divide-y divide-gray-50 max-h-[240px] overflow-y-auto pr-1">
          {wallet.transactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-800 truncate">{tx.description}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{tx.date}</p>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0 text-right">
                <div>
                  <p className={`font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </p>
                  <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded-md mt-0.5 ${
                    tx.status === 'Confirmed' 
                      ? 'bg-green-50 text-green-600 border border-green-100' 
                      : tx.status === 'Pending' 
                        ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' 
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {withdrawOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={closeWithdrawModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
            >
              &times;
            </button>

            {!withdrawSuccess ? (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900">Request Withdrawal</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Available for withdrawal: <strong className="text-primary">₹{wallet.available.toFixed(2)}</strong>
                  </p>
                </div>

                {/* Method selector tabs */}
                <div className="grid grid-cols-4 gap-1.5 bg-gray-50 p-1 rounded-xl">
                  {(['upi', 'bank', 'paytm', 'amazon'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setWithdrawMethod(method)}
                      className={`py-2 text-[10px] font-black rounded-lg transition-all cursor-pointer text-center uppercase tracking-wider ${
                        withdrawMethod === method
                          ? 'bg-white text-primary shadow-sm border border-gray-150'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {/* Method fields */}
                {withdrawMethod === 'upi' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">UPI ID</label>
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okaxis"
                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                {withdrawMethod === 'bank' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        required
                        value={bankHolder}
                        onChange={(e) => setBankHolder(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Account Number</label>
                        <input
                          type="text"
                          required
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          placeholder="918237128912"
                          className="w-full px-3 py-2 border border-gray-255 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">IFSC Code</label>
                        <input
                          type="text"
                          required
                          value={bankIfsc}
                          onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                          placeholder="HDFC0000241"
                          className="w-full px-3 py-2 border border-gray-255 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {withdrawMethod === 'paytm' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Paytm Mobile Number</label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={paytmNumber}
                        onChange={(e) => setPaytmNumber(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                {withdrawMethod === 'amazon' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Amazon Account Email</label>
                      <input
                        type="email"
                        required
                        value={amazonEmail}
                        onChange={(e) => setAmazonEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Amount input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={wallet.available}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-xs font-extrabold tracking-wide uppercase cursor-pointer"
                >
                  Confirm Withdrawal
                </Button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-150">
                  <CheckCircle2 className="w-10 h-10 text-green-500 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Request Received!</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Your withdrawal request for <strong className="text-gray-900">₹{parseFloat(withdrawAmount).toFixed(2)}</strong> has been placed successfully.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Funds will be transferred to your specified {withdrawMethod.toUpperCase()} details within 24-48 business hours.
                  </p>
                </div>
                <Button
                  onClick={closeWithdrawModal}
                  variant="secondary"
                  className="px-6 py-2 text-xs font-bold cursor-pointer"
                >
                  Close Window
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

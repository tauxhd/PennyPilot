'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Loading from '@/components/Loading'
import {
  UtensilsCrossed,
  Bus,
  BookOpen,
  Tv,
  ShoppingCart,
  Wallet,
  TrendingUp,
  PiggyBank,
  Pencil,
  X,
} from 'lucide-react'

const CATEGORIES = ['Food', 'Transport', 'Study', 'Entertainment', 'Others']

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Food: { bg: '#1c1917', text: '#fbbf24' },
  Transport: { bg: '#0c1a2e', text: '#60a5fa' },
  Study: { bg: '#14532d', text: '#4ade80' },
  Entertainment: { bg: '#451a03', text: '#fb923c' },
  Others: { bg: '#162030', text: '#94a3b8' },
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Food: <UtensilsCrossed size={20} className="text-amber-400" />,
  Transport: <Bus size={20} className="text-blue-400" />,
  Study: <BookOpen size={20} className="text-green-400" />,
  Entertainment: <Tv size={20} className="text-orange-400" />,
  Others: <ShoppingCart size={20} className="text-slate-400" />,
}

type Budget = {
  id: string
  category: string
  monthly_limit: number
  month: number
  year: number
}

type Expense = {
  category: string
  amount: number
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)
  const [form, setForm] = useState({ category: 'Food', monthly_limit: '' })

  const month = new Date().getMonth() + 1
  const year = new Date().getFullYear()

  async function fetchData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: budgetsData } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user?.id)
      .eq('month', month)
      .eq('year', year)

    const { data: expensesData } = await supabase
      .from('expenses')
      .select('category, amount')
      .eq('user_id', user?.id)
      .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
      .lte('date', `${year}-${String(month).padStart(2, '0')}-31`)

    setBudgets(budgetsData || [])
    setExpenses(expensesData || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (editBudget) {
      await supabase.from('budgets').update({
        monthly_limit: parseFloat(form.monthly_limit),
      }).eq('id', editBudget.id)
    } else {
      await supabase.from('budgets').upsert({
        user_id: user?.id,
        category: form.category,
        monthly_limit: parseFloat(form.monthly_limit),
        month,
        year,
      }, { onConflict: 'user_id,category,month,year' })
    }

    setShowModal(false)
    setEditBudget(null)
    setForm({ category: 'Food', monthly_limit: '' })
    fetchData()
  }

  function handleEdit(budget: Budget) {
    setEditBudget(budget)
    setForm({ category: budget.category, monthly_limit: String(budget.monthly_limit) })
    setShowModal(true)
  }

  function getSpent(category: string) {
    return expenses
      .filter(e => e.category === category)
      .reduce((s, e) => s + Number(e.amount), 0)
  }

  function getStatus(pct: number) {
    if (pct >= 90) return { label: 'Almost Exceeded', bg: '#450a0a', text: '#f87171', bar: '#ef4444' }
    if (pct >= 65) return { label: 'Near Limit', bg: '#451a03', text: '#fbbf24', bar: '#f59e0b' }
    return { label: 'On Track', bg: '#14532d', text: '#4ade80', bar: '#22c55e' }
  }

  const totalBudget = budgets.reduce((s, b) => s + Number(b.monthly_limit), 0)
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const remaining = totalBudget - totalSpent

  if (loading) return <Loading />

  return (
    <div className="bg-[#0f172a] min-h-screen px-4 md:px-10 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-white text-xl md:text-2xl font-medium">Budget</h1>
          <p className="text-slate-400 text-sm mt-1">Set and manage your monthly spending limits</p>
        </div>
        <button
          onClick={() => { setEditBudget(null); setForm({ category: 'Food', monthly_limit: '' }); setShowModal(true) }}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 md:px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors"
        >
          + <span className="hidden sm:inline">Set Budget</span>
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#1d3a6e] flex items-center justify-center">
              <Wallet size={16} className="text-blue-400" />
            </div>
            <span className="text-slate-400 text-xs">Total Budget</span>
          </div>
          <div className="text-white text-xl md:text-2xl font-medium">RM {totalBudget.toFixed(2)}</div>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#450a0a] flex items-center justify-center">
              <TrendingUp size={16} className="text-red-400" />
            </div>
            <span className="text-slate-400 text-xs">Total Spent</span>
          </div>
          <div className="text-red-400 text-xl md:text-2xl font-medium">RM {totalSpent.toFixed(2)}</div>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#14532d] flex items-center justify-center">
              <PiggyBank size={16} className="text-green-400" />
            </div>
            <span className="text-slate-400 text-xs">Remaining</span>
          </div>
          <div className={`text-xl md:text-2xl font-medium ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            RM {remaining.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
      {budgets.length === 0 ? (
        <div className="text-center text-slate-500 py-20">
          No budgets set yet — click "Set Budget" to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => {
            const spent = getSpent(budget.category)
            const pct = Math.min(Math.round((spent / budget.monthly_limit) * 100), 100)
            const status = getStatus(pct)
            const colors = CATEGORY_COLORS[budget.category]

            return (
              <div key={budget.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: colors.bg }}>
                      {CATEGORY_ICONS[budget.category]}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{budget.category}</div>
                      <div className="text-slate-400 text-xs">
                        RM {spent.toFixed(2)} of RM {Number(budget.monthly_limit).toFixed(2)} spent
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-medium shrink-0" style={{ color: status.bar }}>
                    {pct}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#0f172a] rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: status.bar }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background: status.bg, color: status.text }}>
                    {status.label}
                  </span>
                  <button
                    onClick={() => handleEdit(budget)}
                    className="flex items-center gap-1.5 text-xs border border-[#334155] text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Pencil size={11} />
                    <span className="hidden sm:inline">Edit limit</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-base font-medium">
                {editBudget ? `Edit ${editBudget.category} budget` : 'Set budget limit'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editBudget && (
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-white text-sm outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-slate-400 text-xs block mb-1.5">Monthly limit (RM)</label>
                <div className="flex items-center gap-2 bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3">
                  <span className="text-slate-500 text-sm">RM</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.monthly_limit}
                    onChange={e => setForm({ ...form, monthly_limit: e.target.value })}
                    placeholder="0.00"
                    required
                    className="bg-transparent text-white text-sm outline-none w-full"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-[#334155] text-slate-400 rounded-lg py-3 text-sm hover:bg-[#0f172a] transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3 text-sm font-medium transition-colors">
                  {editBudget ? 'Save changes' : 'Set budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
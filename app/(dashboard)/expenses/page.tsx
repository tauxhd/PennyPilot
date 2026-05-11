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
  Search,
  Pencil,
  Trash2,
  X,
  Coins,
  ClipboardList,
  Calendar,
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
  Food: <UtensilsCrossed size={14} className="text-amber-400" />,
  Transport: <Bus size={14} className="text-blue-400" />,
  Study: <BookOpen size={14} className="text-green-400" />,
  Entertainment: <Tv size={14} className="text-orange-400" />,
  Others: <ShoppingCart size={14} className="text-slate-400" />,
}

type Expense = {
  id: string
  amount: number
  category: string
  description: string
  note: string
  date: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [order, setOrder] = useState('latest')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year] = useState(new Date().getFullYear())
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)

  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  })

  const PER_PAGE = 7

  async function fetchExpenses() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
      .lte('date', `${year}-${String(month).padStart(2, '0')}-31`)
      .order('date', { ascending: false })

    setExpenses(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchExpenses()
  }, [month])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (editExpense) {
      await supabase.from('expenses').update({
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description,
        note: form.note,
        date: form.date,
      }).eq('id', editExpense.id)
    } else {
      await supabase.from('expenses').insert({
        user_id: user?.id,
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description,
        note: form.note,
        date: form.date,
      })
    }

    setShowModal(false)
    setEditExpense(null)
    setForm({ amount: '', category: 'Food', description: '', note: '', date: new Date().toISOString().split('T')[0] })
    fetchExpenses()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('expenses').delete().eq('id', id)
    fetchExpenses()
  }

  function handleEdit(expense: Expense) {
    setEditExpense(expense)
    setForm({
      amount: String(expense.amount),
      category: expense.category,
      description: expense.description,
      note: expense.note || '',
      date: expense.date,
    })
    setShowModal(true)
  }

  let filtered = expenses
    .filter(e => category === 'All' || e.category === category)
    .filter(e => e.description.toLowerCase().includes(search.toLowerCase()))

  if (order === 'latest') filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  if (order === 'oldest') filtered = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  if (order === 'highest') filtered = [...filtered].sort((a, b) => b.amount - a.amount)
  if (order === 'lowest') filtered = [...filtered].sort((a, b) => a.amount - b.amount)

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const avgPerDay = totalSpent / new Date().getDate()

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  if (loading) return <Loading />

  return (
    <div className="bg-[#0f172a] min-h-screen px-4 md:px-10 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-white text-xl md:text-2xl font-medium">Expenses</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track your expenses</p>
        </div>
        <button
          onClick={() => {
            setEditExpense(null)
            setForm({ amount: '', category: 'Food', description: '', note: '', date: new Date().toISOString().split('T')[0] })
            setShowModal(true)
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 md:px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors"
        >
          + <span className="hidden sm:inline">Add Expense</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        {/* Category pills */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-blue-400 text-xs mr-1">Categories</span>
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1) }}
              className={`px-3 md:px-4 py-1.5 rounded-full text-xs transition-colors ${
                category === cat ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dropdowns + search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
          <div>
            <label className="text-blue-400 text-xs block mb-1.5">Date</label>
            <select
              value={month}
              onChange={e => { setMonth(Number(e.target.value)); setPage(1) }}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white text-sm outline-none"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m} {year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-blue-400 text-xs block mb-1.5">Order</label>
            <select
              value={order}
              onChange={e => setOrder(e.target.value)}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white text-sm outline-none"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest amount</option>
              <option value="lowest">Lowest amount</option>
            </select>
          </div>
          <div>
            <label className="text-blue-400 text-xs block mb-1.5">Search</label>
            <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5">
              <Search size={14} className="text-slate-500 shrink-0" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search expenses..."
                className="bg-transparent text-white text-sm outline-none w-full placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
        {[
          { label: 'Total spent this month', value: `RM ${totalSpent.toFixed(2)}`, icon: <Coins size={16} className="text-blue-400" />, iconBg: '#1d3a6e' },
          { label: 'Total Transactions', value: String(expenses.length), icon: <ClipboardList size={16} className="text-violet-400" />, iconBg: '#3b0764' },
          { label: 'Average per Day', value: `RM ${avgPerDay.toFixed(2)}`, icon: <Calendar size={16} className="text-orange-400" />, iconBg: '#451a03' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: stat.iconBg }}>
                {stat.icon}
              </div>
              <span className="text-slate-400 text-xs">{stat.label}</span>
            </div>
            <div className="text-white text-xl md:text-2xl font-medium">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Table — scrollable on mobile */}
      <div className="mb-5 rounded-xl overflow-hidden">
        <table className="w-full min-w-150">
          <thead>
            <tr className="bg-[#1e293b] border-b border-[#334155]">
                <th className="hidden md:table-cell text-left text-slate-500 text-xs font-medium uppercase tracking-wide px-5 py-3">Date</th>
                <th className="text-left text-slate-500 text-xs font-medium uppercase tracking-wide px-5 py-3">Description</th>
                <th className="hidden md:table-cell text-left text-slate-500 text-xs font-medium uppercase tracking-wide px-5 py-3">Category</th>
                <th className="text-left text-slate-500 text-xs font-medium uppercase tracking-wide px-5 py-3">Amount</th>
                <th className="text-right text-slate-500 text-xs font-medium uppercase tracking-wide px-3 md:px-5 py-3">Action</th>
            </tr>
            </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-slate-500 py-10 bg-[#1e293b]">No expenses found</td></tr>
            ) : paginated.map((expense, i) => (
              <tr key={expense.id} className={`border-b border-[#0f172a] ${i % 2 === 1 ? 'bg-[#111827]' : 'bg-[#1e293b]'}`}>
                <td className="hidden md:table-cell px-5 py-4 text-slate-400 text-sm whitespace-nowrap">
                    {new Date(expense.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-4 max-w-45 md:max-w-none">
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: CATEGORY_COLORS[expense.category]?.bg }}>
                        {CATEGORY_ICONS[expense.category]}
                    </div>
                    <div className="min-w-0">
                        <div className="text-white text-sm font-medium truncate">{expense.description}</div>
                        {expense.note && <div className="text-slate-500 text-xs truncate">{expense.note}</div>}
                    </div>
                    </div>
                </td>
                <td className="hidden md:table-cell px-5 py-4">
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap"
                    style={{ background: CATEGORY_COLORS[expense.category]?.bg, color: CATEGORY_COLORS[expense.category]?.text }}>
                    {expense.category}
                    </span>
                </td>
                <td className="px-5 py-4 text-red-400 text-sm font-medium whitespace-nowrap">
                    -RM {Number(expense.amount).toFixed(2)}
                </td>
                <td className="px-3 md:px-5 py-4">
                <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(expense)}
                    className="w-8 h-8 rounded-lg border border-blue-500 text-blue-400 flex items-center justify-center hover:bg-blue-500/10 transition-colors shrink-0">
                    <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(expense.id)}
                    className="w-8 h-8 rounded-lg border border-red-500 text-red-400 flex items-center justify-center hover:bg-red-500/10 transition-colors shrink-0">
                    <Trash2 size={13} />
                    </button>
                </div>
                </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <span className="text-slate-500 text-sm">Showing {paginated.length} of {filtered.length} expenses</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))}
            className="w-8 h-8 rounded-lg border border-[#334155] text-slate-400 text-sm flex items-center justify-center hover:bg-[#1e293b]">
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${
                page === i + 1 ? 'bg-blue-500 text-white' : 'border border-[#334155] text-slate-400 hover:bg-[#1e293b]'
              }`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="w-8 h-8 rounded-lg border border-[#334155] text-slate-400 text-sm flex items-center justify-center hover:bg-[#1e293b]">
            ›
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-base font-medium">
                {editExpense ? 'Edit expense' : 'Add new expense'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">Amount (RM)</label>
                <div className="flex items-center gap-2 bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3">
                  <span className="text-slate-500 text-sm">RM</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    className="bg-transparent text-white text-sm outline-none w-full"
                  />
                </div>
              </div>

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

              <div>
                <label className="text-slate-400 text-xs block mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Lunch at McDonald's"
                  required
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-white text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">Note (optional)</label>
                  <input
                    value={form.note}
                    onChange={e => setForm({ ...form, note: e.target.value })}
                    placeholder="Any extra notes"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-white text-sm outline-none"
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
                  {editExpense ? 'Save changes' : 'Save expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
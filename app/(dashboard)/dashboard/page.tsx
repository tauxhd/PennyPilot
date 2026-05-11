'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Loading from '@/components/Loading'
import {
  TrendingUp,
  PiggyBank,
  ShoppingBag,
  Calendar,
  Sparkles,
  UtensilsCrossed,
  Bus,
  BookOpen,
  Tv,
  ShoppingCart,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const CATEGORIES = ['Food', 'Transport', 'Study', 'Entertainment', 'Others']

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Study: '#a78bfa',
  Entertainment: '#f472b6',
  Others: '#64748b',
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Food: <UtensilsCrossed size={14} className="text-amber-400" />,
  Transport: <Bus size={14} className="text-blue-400" />,
  Study: <BookOpen size={14} className="text-violet-400" />,
  Entertainment: <Tv size={14} className="text-pink-400" />,
  Others: <ShoppingCart size={14} className="text-slate-400" />,
}

const CATEGORY_ICON_BG: Record<string, string> = {
  Food: '#1c1917',
  Transport: '#0c1a2e',
  Study: '#1a1033',
  Entertainment: '#1c0f1f',
  Others: '#162030',
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()

      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
        .order('date', { ascending: false })

      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('month', month)
        .eq('year', year)

      const { data: insightsData } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user?.id)
        .eq('month', month)
        .eq('year', year)
        .order('created_at', { ascending: false })
        .limit(1)

      setExpenses(expensesData || [])
      setBudgets(budgetsData || [])

      if (insightsData && insightsData.length > 0) {
        const lines = insightsData[0].insight_text
          .split('\n')
          .filter((l: string) => l.trim())
        setInsights(lines)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0)
  const remaining = totalBudget - totalSpent

  const biggestCategory = CATEGORIES.reduce((max, cat) => {
    const total = expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0)
    const maxTotal = expenses.filter(e => e.category === max).reduce((s, e) => s + Number(e.amount), 0)
    return total > maxTotal ? cat : max
  }, CATEGORIES[0])

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const daysLeft = daysInMonth - new Date().getDate()

  const dailyData = Array.from({ length: new Date().getDate() }, (_, i) => {
    const day = i + 1
    const dayExpenses = expenses
      .filter(e => new Date(e.date).getDate() === day)
      .reduce((s, e) => s + Number(e.amount), 0)
    return { day: String(day), amount: dayExpenses }
  })

  const pieData = CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0)
  })).filter(d => d.value > 0)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) return <Loading />

  return (
    <div className="bg-[#0f172a] min-h-screen px-4 md:px-10 py-8">

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-white text-xl md:text-2xl font-medium">{greeting}, {firstName} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">
          Here's your spending summary for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md bg-[#1d3a6e] flex items-center justify-center">
              <TrendingUp size={14} className="text-blue-400" />
            </div>
            <span className="text-slate-400 text-xs">Monthly Spending</span>
          </div>
          <div className="text-white text-xl md:text-2xl font-medium">RM {totalSpent.toFixed(2)}</div>
          <div className="text-red-400 text-xs mt-1">↑ this month</div>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md bg-[#14532d] flex items-center justify-center">
              <PiggyBank size={14} className="text-green-400" />
            </div>
            <span className="text-slate-400 text-xs">Budget Remaining</span>
          </div>
          <div className={`text-xl md:text-2xl font-medium ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            RM {remaining.toFixed(2)}
          </div>
          <div className="text-slate-400 text-xs mt-1">of RM {totalBudget.toFixed(2)} limit</div>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md bg-[#451a03] flex items-center justify-center">
              <ShoppingBag size={14} className="text-amber-400" />
            </div>
            <span className="text-slate-400 text-xs">Biggest Category</span>
          </div>
          <div className="text-white text-xl md:text-2xl font-medium">{biggestCategory}</div>
          <div className="text-slate-400 text-xs mt-1">
            RM {expenses.filter(e => e.category === biggestCategory).reduce((s, e) => s + Number(e.amount), 0).toFixed(2)} this month
          </div>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md bg-[#2e1065] flex items-center justify-center">
              <Calendar size={14} className="text-violet-400" />
            </div>
            <span className="text-slate-400 text-xs">Days Left</span>
          </div>
          <div className="text-white text-xl md:text-2xl font-medium">{daysLeft} days</div>
          <div className="text-slate-400 text-xs mt-1">
            RM {daysLeft > 0 ? (remaining / daysLeft).toFixed(2) : '0.00'}/day remaining
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 md:mb-8">
        <div className="lg:col-span-2 bg-[#1e293b] border border-[#334155] rounded-xl p-5">
          <div className="text-white text-sm font-medium mb-4">Spending this month — daily</div>
          {dailyData.some(d => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyData}>
                <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: any) => [`RM ${Number(value).toFixed(2)}`, 'Spent']}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm">
              No expenses this month yet
            </div>
          )}
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
          <div className="text-white text-sm font-medium mb-4">Spending by category</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={CATEGORY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* AI Insights + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-blue-400" />
              <span className="text-white text-sm font-medium">AI Spending Coach</span>
            </div>
            <span className="bg-blue-900 text-blue-300 text-xs px-3 py-1 rounded-full">AI</span>
          </div>
          {insights.length > 0 ? (
            <div className="space-y-2">
              {insights.slice(0, 3).map((insight, i) => (
                <div key={i} className="bg-[#0f172a] rounded-lg px-3 py-3 border-l-2 border-blue-500 text-slate-300 text-xs leading-relaxed">
                  {insight}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 text-sm text-center py-6">
              Go to AI Coach to generate insights
            </div>
          )}
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-sm font-medium">Recent Expenses</span>
            <a href="/expenses" className="text-blue-400 text-xs hover:text-blue-300">View all →</a>
          </div>
          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: CATEGORY_ICON_BG[expense.category] }}>
                      {CATEGORY_ICONS[expense.category]}
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">{expense.description}</div>
                      <div className="text-slate-500 text-xs">
                        {new Date(expense.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-red-400 text-xs font-medium shrink-0">
                    - RM {Number(expense.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 text-sm text-center py-6">
              No expenses yet — add your first one!
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
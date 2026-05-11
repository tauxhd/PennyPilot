'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Loading from '@/components/Loading'
import {
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Info,
  ChefHat,
  Tv,
  RefreshCw,
} from 'lucide-react'

const INSIGHT_COLORS = ['#ef4444', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6']
const INSIGHT_BG = ['#450a0a', '#450a0a', '#451a03', '#14532d', '#1d3a6e']
const INSIGHT_TAGS = ['High Risk', 'High Risk', 'Watch Out', 'On Track', 'Suggestion']
const INSIGHT_TAG_COLORS = [
  { bg: '#450a0a', text: '#f87171' },
  { bg: '#450a0a', text: '#f87171' },
  { bg: '#451a03', text: '#fbbf24' },
  { bg: '#14532d', text: '#4ade80' },
  { bg: '#1d3a6e', text: '#60a5fa' },
]
const INSIGHT_ICONS = [
  <AlertTriangle size={14} className="text-red-400" />,
  <AlertTriangle size={14} className="text-red-400" />,
  <AlertTriangle size={14} className="text-amber-400" />,
  <CheckCircle size={14} className="text-green-400" />,
  <Info size={14} className="text-blue-400" />,
]

export default function AICoachPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [lastGenerated, setLastGenerated] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const month = new Date().getMonth() + 1
  const year = new Date().getFullYear()
  const daysLeft = new Date(year, month, 0).getDate() - new Date().getDate()

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)

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
        setLastGenerated(new Date(insightsData[0].created_at).toLocaleString('en-MY', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }))
      }

      setFetching(false)
    }

    fetchData()
  }, [])

  async function generateInsights() {
    if (expenses.length === 0) {
      alert('Add some expenses first before generating insights!')
      return
    }

    setLoading(true)

    const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0)
    const totalBudget = budgets.reduce((s, b) => s + Number(b.monthly_limit), 0)

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses, budgets, totalSpent, totalBudget, daysLeft }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const lines = data.insights.split('\n').filter((l: string) => l.trim())
      setInsights(lines)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from('ai_insights').insert({
        user_id: user?.id,
        insight_text: data.insights,
        month,
        year,
      })

      setLastGenerated(new Date().toLocaleString('en-MY', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }))
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate insights. Please try again.')
    }

    setLoading(false)
  }

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const totalBudget = budgets.reduce((s, b) => s + Number(b.monthly_limit), 0)
  const biggestCategory = ['Food', 'Transport', 'Study', 'Entertainment', 'Others'].reduce((max, cat) => {
    const total = expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0)
    const maxTotal = expenses.filter(e => e.category === max).reduce((s, e) => s + Number(e.amount), 0)
    return total > maxTotal ? cat : max
  }, 'Food')

  if (fetching) return <Loading />

  return (
    <div className="bg-[#0f172a] min-h-screen px-4 md:px-10 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-xl md:text-2xl font-medium">AI Coach</h1>
        <p className="text-slate-400 text-sm mt-1">Your personal AI-powered spending advisor</p>
      </div>

      {/* Summary Card */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 md:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 flex-1">
            <div>
              <div className="text-slate-400 text-xs mb-1">
                Analyzing {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={15} className="text-blue-400 flex-shrink-0" />
                <div className="text-white text-lg md:text-xl font-medium">RM {totalSpent.toFixed(2)}</div>
              </div>
              <div className="text-slate-400 text-xs">Total spent</div>
            </div>

            <div>
              <div className="text-slate-400 text-xs mb-1">Top category</div>
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag size={15} className="text-amber-400 flex-shrink-0" />
                <div className="text-white text-lg md:text-xl font-medium">{biggestCategory}</div>
              </div>
              <div className="text-slate-400 text-xs">
                RM {expenses.filter(e => e.category === biggestCategory).reduce((s, e) => s + Number(e.amount), 0).toFixed(2)} this month
              </div>
            </div>

            <div>
              <div className="text-slate-400 text-xs mb-1">Budget status</div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={15} className="text-amber-400 flex-shrink-0" />
                <div className="text-amber-400 text-lg md:text-xl font-medium">
                  {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% used
                </div>
              </div>
              <div className="text-slate-400 text-xs">RM {(totalBudget - totalSpent).toFixed(2)} remaining</div>
            </div>

            <div>
              <div className="text-slate-400 text-xs mb-1">Days left</div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={15} className="text-violet-400 flex-shrink-0" />
                <div className="text-white text-lg md:text-xl font-medium">{daysLeft} days</div>
              </div>
              <div className="text-slate-400 text-xs">
                RM {daysLeft > 0 && (totalBudget - totalSpent) > 0
                  ? ((totalBudget - totalSpent) / daysLeft).toFixed(2)
                  : '0.00'}/day available
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generateInsights}
            disabled={loading}
            className="w-full lg:w-auto bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors flex-shrink-0"
          >
            {loading
              ? <><RefreshCw size={15} className="animate-spin" /> Generating...</>
              : <><Sparkles size={15} /> Generate Insights</>
            }
          </button>
        </div>
      </div>

      {/* Insights Card */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-blue-400" />
            <span className="text-white text-sm font-medium">AI Spending Coach</span>
          </div>
          <span className="bg-blue-900 text-blue-300 text-xs px-3 py-1 rounded-full">AI</span>
        </div>
        {lastGenerated && (
          <p className="text-slate-500 text-xs mb-5">Last generated: {lastGenerated}</p>
        )}

        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 px-3 md:px-4 py-3 rounded-lg"
                style={{ background: '#0f172a', borderLeft: `3px solid ${INSIGHT_COLORS[i] || '#3b82f6'}` }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: INSIGHT_BG[i] || '#1d3a6e' }}>
                  {INSIGHT_ICONS[i] || <Info size={14} className="text-blue-400" />}
                </div>
                <div className="flex-1 text-slate-300 text-xs md:text-sm leading-relaxed min-w-0">
                  {insight}
                </div>
                <span className="text-xs px-2 py-1 rounded-full flex-shrink-0 font-medium hidden sm:inline-block"
                  style={{
                    background: INSIGHT_TAG_COLORS[i]?.bg || '#1d3a6e',
                    color: INSIGHT_TAG_COLORS[i]?.text || '#60a5fa'
                  }}>
                  {INSIGHT_TAGS[i] || 'Info'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 text-sm py-10">
            Click "Generate Insights" to get your personalized spending analysis
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div>
        <h2 className="text-white text-base font-medium mb-4">Quick Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <ChefHat size={20} className="text-amber-400" />,
              iconBg: '#1c1917',
              title: 'Cook at home more',
              tip: 'Try cooking at home 2–3 times a week. You could save up to RM 150 on food this month.'
            },
            {
              icon: <Tv size={20} className="text-pink-400" />,
              iconBg: '#1c0f1f',
              title: 'Pause one subscription',
              tip: 'You have multiple active subscriptions. Pausing one this month could free up RM 17–40 instantly.'
            },
            {
              icon: <Calendar size={20} className="text-blue-400" />,
              iconBg: '#1d3a6e',
              title: 'Plan your weekly budget',
              tip: "Every Sunday, review last week's spending and set a daily limit for the week ahead."
            },
          ].map((tip, i) => (
            <div key={i} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: tip.iconBg }}>
                {tip.icon}
              </div>
              <div className="text-white text-sm font-medium mb-2">{tip.title}</div>
              <div className="text-slate-400 text-xs leading-relaxed">{tip.tip}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
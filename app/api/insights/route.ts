import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    const { expenses, budgets, totalSpent, totalBudget, daysLeft } = await request.json()

    const expenseSummary = expenses.map((e: any) =>
      `${e.category}: RM ${e.amount} — ${e.description} on ${e.date}`
    ).join('\n')

    const budgetSummary = budgets.map((b: any) => {
      const spent = expenses
        .filter((e: any) => e.category === b.category)
        .reduce((s: number, e: any) => s + Number(e.amount), 0)
      return `${b.category}: RM ${spent.toFixed(2)} spent of RM ${b.monthly_limit} limit`
    }).join('\n')

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are a friendly AI spending coach for a Malaysian university student. Analyze their spending and give exactly 5 short, specific insights.

Spending data:
${expenseSummary}

Budget status:
${budgetSummary}

Total spent: RM ${totalSpent}
Total budget: RM ${totalBudget}
Days left in month: ${daysLeft}

Rules:
- Give exactly 5 insights, one per line
- Each insight starts with an emoji
- Keep each insight under 20 words
- Be specific with numbers and RM amounts
- Mix warnings and positive feedback
- No bullet points, no numbering, just the emoji and text
- Use Malaysian context (mention Grab, LRT, mamak etc when relevant)`
        }
      ]
    })

    const text = completion.choices[0]?.message?.content || ''
    return NextResponse.json({ insights: text })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
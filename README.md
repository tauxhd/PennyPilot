# PennyPilot 💸
### AI-Powered Student Budget Tracker

PennyPilot is a smart budgeting web app built for Malaysian university students. Track your expenses, set monthly budgets, and get personalized AI spending insights — all in one clean, modern dashboard.

Built as part of the **Shortcut Asia Internship Challenge 2026**.

🔗 **Live Demo:** [penny-pilot-red.vercel.app](https://penny-pilot-red.vercel.app/login)
🎨 **Figma Design:** [View on Figma Community](https://www.figma.com/community/file/1635580965771900970/pennypilot-ai-assisted-expenses-manager)
👤 **GitHub:** [github.com/tauxhd](https://github.com/tauxhd)

---

## Features

**Expense Tracking**
- Add, edit, and delete expenses with categories
- Filter by category, month, and search by description
- Pagination and sorting (latest, oldest, highest, lowest)

**Budget Management**
- Set monthly spending limits per category
- Visual progress bars with status indicators (On Track, Near Limit, Almost Exceeded)
- Real-time budget vs spending overview

**AI Spending Coach**
- Powered by Groq (Llama 3.3 70B)
- Generates 5 personalized spending insights based on your actual data
- Malaysian context-aware (Grab, LRT, mamak references)
- Insights saved and displayed across dashboard and AI Coach page

**Authentication & Profiles**
- Email/password signup and login via Supabase Auth
- Profile photo upload with Supabase Storage
- Protected routes with middleware

**Design**
- Dark fintech theme inspired by Revolut and Mercury
- Fully responsive — works on mobile, tablet, and desktop
- Scroll-aware navbar with logo transition animation
- Lucide icons throughout

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Charts | Recharts |
| AI | Groq API (Llama 3.3 70B) |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Overview with charts, AI insights, recent transactions |
| Expenses | `/expenses` | Full expense management with filters and modal |
| Budget | `/budgets` | Category budgets with progress tracking |
| AI Coach | `/ai-coach` | AI-generated spending insights |
| Profile | `/profile` | Account settings and photo upload |

---

## Getting Started

**1. Clone the repository**
```bash
git clone https://github.com/tauxhd/pennypilot.git
cd pennypilot
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

**4. Set up Supabase**

Run this SQL in your Supabase SQL Editor:
```sql
create extension if not exists "uuid-ossp";

create table expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount decimal(10,2) not null,
  category text not null check (category in ('Food', 'Transport', 'Study', 'Entertainment', 'Others')),
  description text not null,
  note text,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null check (category in ('Food', 'Transport', 'Study', 'Entertainment', 'Others')),
  monthly_limit decimal(10,2) not null,
  month integer not null,
  year integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category, month, year)
);

create table ai_insights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  insight_text text not null,
  month integer not null,
  year integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table expenses enable row level security;
alter table budgets enable row level security;
alter table ai_insights enable row level security;

create policy "Users can view own expenses" on expenses for select using (auth.uid() = user_id);
create policy "Users can insert own expenses" on expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses" on expenses for update using (auth.uid() = user_id);
create policy "Users can delete own expenses" on expenses for delete using (auth.uid() = user_id);

create policy "Users can view own budgets" on budgets for select using (auth.uid() = user_id);
create policy "Users can insert own budgets" on budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on budgets for update using (auth.uid() = user_id);
create policy "Users can delete own budgets" on budgets for delete using (auth.uid() = user_id);

create policy "Users can view own insights" on ai_insights for select using (auth.uid() = user_id);
create policy "Users can insert own insights" on ai_insights for insert with check (auth.uid() = user_id);
```

Also create a **Storage bucket** named `avatars` with public access enabled.

**5. Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
pennypilot/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── expenses/
│   │   │   └── page.tsx
│   │   ├── budgets/
│   │   │   └── page.tsx
│   │   ├── ai-coach/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── api/
│   │   └── insights/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── Loading.tsx
├── lib/
│   ├── supabase.ts
│   └── supabase-server.ts
├── public/
│   └── images/
│       ├── logo-2-col.png
│       └── logo-2-whi.png
├── middleware.ts
└── .env.local
```

---

## Design

🎨 Figma design available on [Figma Community](https://www.figma.com/community/file/1635580965771900970/pennypilot-ai-assisted-expenses-manager)

**Color palette:**

| Role | Hex |
|------|-----|
| Background | `#0f172a` |
| Surface | `#1e293b` |
| Border | `#334155` |
| Primary Blue | `#3b82f6` |
| Success | `#22c55e` |
| Warning | `#f59e0b` |
| Danger | `#ef4444` |
| Text Primary | `#f8fafc` |
| Text Secondary | `#94a3b8` |

---

## Screenshots

| Dashboard | Expenses |
|-----------|----------|
| ![Dashboard](public/images/screenshots/dashboard.png) | ![Expenses](public/images/screenshots/expenses.png) |

| Budget | AI Coach |
|--------|----------|
| ![Budget](public/images/screenshots/budget.png) | ![AI Coach](public/images/screenshots/ai-coach.png) |

---

## Author

**Tauedea Arehui Gabi**
- GitHub: [@tauxhd](https://github.com/tauxhd)

Built for the **Shortcut Asia Internship Challenge 2026**

---

## License

This project is open source and available under the [MIT License](LICENSE).

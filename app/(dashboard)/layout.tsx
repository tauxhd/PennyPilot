import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const fullName: string = user.user_metadata?.full_name || user.email || ''
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <Navbar
        userInitials={initials}
        userEmail={user.email}
        userName={user.user_metadata?.full_name || user.email}
        userAvatarUrl={user.user_metadata?.avatar_url}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
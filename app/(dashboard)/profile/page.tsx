'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, Mail, User, LogOut, Save } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)
      setFullName(user.user_metadata?.full_name || '')
      setEmail(user.email || '')
      setAvatarUrl(user.user_metadata?.avatar_url || '')
      setLoading(false)
    }
    fetchUser()
  }, [])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB')
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const supabase = createClient()
    let newAvatarUrl = avatarUrl

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true })

      if (uploadError) {
        setError('Failed to upload image: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      newAvatarUrl = publicUrl
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        avatar_url: newAvatarUrl,
      }
    })

    if (updateError) {
      setError('Failed to update profile: ' + updateError.message)
      setSaving(false)
      return
    }

    setAvatarUrl(newAvatarUrl)
    setSuccess('Profile updated successfully!')
    setSaving(false)
    router.refresh()
  }

  const displayAvatar = avatarPreview || avatarUrl
  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-[#1e293b]"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
      </div>
    </div>
  )

  return (
    <div className="bg-[#0f172a] min-h-screen px-10 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-medium">Profile Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account details and preferences</p>
      </div>

      {/* Centered content */}
      <div className="max-w-xl mx-auto flex flex-col gap-5">

        {/* Avatar Card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
          <h2 className="text-white text-sm font-medium mb-6">Profile Photo</h2>

          <div className="flex flex-col items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-medium overflow-hidden">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
              >
                <Camera size={14} />
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#0f172a] border border-[#334155] text-white text-sm px-5 py-2 rounded-lg hover:bg-[#334155] transition-colors"
              >
                Upload new photo
              </button>
              <p className="text-slate-500 text-xs mt-2">JPG, PNG or GIF. Max 2MB.</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
          <h2 className="text-white text-sm font-medium mb-6">Personal Information</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs block mb-1.5">Full Name</label>
              <div className="flex items-center gap-2 bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 focus-within:border-blue-500 transition-colors">
                <User size={14} className="text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-transparent text-white text-sm outline-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1.5">Email</label>
              <div className="flex items-center gap-2 bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 opacity-50">
                <Mail size={14} className="text-slate-500 shrink-0" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="bg-transparent text-slate-400 text-sm outline-none w-full cursor-not-allowed"
                />
              </div>
              <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#1e293b] border border-red-500/20 rounded-xl p-6">
          <h2 className="text-red-400 text-sm font-medium mb-2">Danger Zone</h2>
          <p className="text-slate-400 text-xs mb-4">
            Sign out of your account and clear all session data.
          </p>
          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              router.push('/login')
            }}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            <LogOut size={14} /> Sign out of all sessions
          </button>
        </div>

      </div>
    </div>
  )
}
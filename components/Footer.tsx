import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-[#1e293b] border-t border-[#334155] px-4 md:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <Image
          src="/images/logo-1-whi.png"
          alt="PennyPilot"
          width={100}
          height={25}
          style={{ width: 'auto', height: '22px' }}
          className="object-contain opacity-70"
        />
        <span className="text-slate-500 text-xs hidden sm:inline">
          AI-powered budgeting for students.
        </span>
      </div>
      <p className="text-slate-500 text-xs text-center sm:text-right">
        © 2026 PennyPilot — Built by Tauedea Arehui Gabi
      </p>
    </footer>
  )
}
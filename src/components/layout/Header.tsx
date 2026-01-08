import React, { useState } from 'react'

const Header: React.FC = () => {
  const [language, setLanguage] = useState<'EN' | 'VN'>('EN')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#f0f4f2] dark:border-[#2a3c30] bg-surface-light dark:bg-surface-dark px-6 py-3 shadow-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-[#111813] dark:text-white">
            hoctapvui
          </h2>
        </div>

        <nav className="hidden gap-8 md:flex">
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Home
          </a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#">
            About
          </a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-[#f0f4f2] dark:bg-[#102216] p-1 border border-[#e5e7eb] dark:border-[#2a3c30]">
            <button
              onClick={() => setLanguage('EN')}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                language === 'EN'
                  ? 'bg-white dark:bg-[#1a2c20] text-[#111813] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#111813] dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('VN')}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                language === 'VN'
                  ? 'bg-white dark:bg-[#1a2c20] text-[#111813] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#111813] dark:hover:text-white'
              }`}
            >
              VN
            </button>
          </div>
          <button className="md:hidden text-[#111813] dark:text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

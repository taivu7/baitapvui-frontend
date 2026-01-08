import React, { useState } from 'react'

const DashboardHeader: React.FC = () => {
  const [language, setLanguage] = useState<'EN' | 'VN'>('EN')

  return (
    <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-[#f0f4f2] dark:border-gray-800 flex items-center justify-between px-6 lg:px-10 shrink-0 z-10">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-lg font-bold tracking-tight hidden sm:block">Teacher Dashboard</h2>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary">
              search
            </span>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2 border-none rounded-lg bg-[#f0f4f2] dark:bg-white/5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="Search classes, assignments, or students..."
            type="text"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="hidden md:flex items-center bg-[#f0f4f2] dark:bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setLanguage('EN')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              language === 'EN'
                ? 'bg-white dark:bg-surface-dark shadow-sm text-[#111813] dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#111813] dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('VN')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              language === 'VN'
                ? 'bg-white dark:bg-surface-dark shadow-sm text-[#111813] dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#111813] dark:hover:text-white'
            }`}
          >
            VN
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[#f0f4f2] dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2c22]"></span>
        </button>

        {/* Messages */}
        <button className="p-2 rounded-lg hover:bg-[#f0f4f2] dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors">
          <span className="material-symbols-outlined">chat_bubble</span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        {/* Profile */}
        <button className="flex items-center gap-2 rounded-full hover:ring-2 ring-primary ring-offset-2 dark:ring-offset-surface-dark transition-all">
          <div className="bg-primary/20 rounded-full size-9 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader

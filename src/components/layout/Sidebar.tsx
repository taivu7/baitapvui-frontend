import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { name: 'Home', icon: 'home', path: '/teacher/dashboard', iconFilled: true },
    { name: 'My Classes', icon: 'group', path: '/teacher/classes', iconFilled: false },
    { name: 'Assignments', icon: 'menu_book', path: '/teacher/assignments', iconFilled: false },
    { name: 'Question Bank', icon: 'folder_open', path: '/teacher/question-bank', iconFilled: false },
    { name: 'Settings', icon: 'settings', path: '/teacher/settings', iconFilled: false },
  ]

  return (
    <aside className="w-64 bg-surface-light dark:bg-surface-dark border-r border-[#f0f4f2] dark:border-gray-800 flex-col justify-between hidden md:flex z-20">
      <div className="flex flex-col gap-4 p-4 h-full">
        {/* Logo */}
        <div className="flex gap-3 items-center px-2 py-4">
          <div className="bg-primary/20 rounded-full size-10 shadow-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">school</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">hoctapvui</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-[#0d3b1e] dark:text-primary dark:bg-primary/10'
                    : 'hover:bg-[#f0f4f2] dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 group'
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    isActive && item.iconFilled ? 'icon-filled' : ''
                  } ${isActive ? 'text-[#0d3b1e] dark:text-primary' : 'group-hover:text-primary'} transition-colors`}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Help Section */}
        <div className="mt-auto">
          <div className="p-4 bg-[#f0f4f2] dark:bg-white/5 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white dark:bg-white/10 p-2 rounded-lg text-primary">
                <span className="material-symbols-outlined">help</span>
              </div>
              <div className="text-sm font-medium">Need Help?</div>
            </div>
            <button className="w-full text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-primary text-left">
              Visit Support Center
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

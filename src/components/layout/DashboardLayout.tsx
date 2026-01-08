import React from 'react'
import Sidebar from './Sidebar'
import DashboardHeader from './DashboardHeader'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111813] dark:text-gray-100 flex h-screen overflow-hidden font-display">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout

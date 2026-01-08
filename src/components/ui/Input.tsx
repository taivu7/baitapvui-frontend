import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-[#111813] dark:text-white ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {icon}
              </span>
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-lg border ${
              error ? 'border-red-500' : 'border-[#e5e7eb] dark:border-[#2a3c30]'
            } bg-white dark:bg-[#102216] py-3 ${
              icon ? 'pl-10' : 'pl-4'
            } pr-4 text-sm text-[#111813] dark:text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm outline-none ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-500 ml-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

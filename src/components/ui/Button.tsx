import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  children: React.ReactNode
  icon?: string
  iconPosition?: 'left' | 'right'
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseClasses = 'flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-sm font-bold transition-all'

  const variantClasses = {
    primary: 'bg-primary text-[#111813] shadow-[0_4px_14px_0_rgba(19,236,91,0.39)] hover:bg-primary/90 active:scale-[0.98]',
    secondary: 'bg-white dark:bg-[#102216] text-[#111813] dark:text-white border border-[#e5e7eb] dark:border-[#2a3c30] hover:bg-gray-50 dark:hover:bg-[#1a2c20]',
    outline: 'border border-[#e5e7eb] dark:border-[#2a3c30] bg-white dark:bg-[#102216] text-[#111813] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1a2c20]'
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
      )}
    </button>
  )
}

export default Button

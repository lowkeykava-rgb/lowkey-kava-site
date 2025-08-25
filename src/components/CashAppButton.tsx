'use client'

interface CashAppButtonProps {
  amount: number
  cashtag: string
  memo?: string
  className?: string
}

export function CashAppButton({ amount, cashtag, memo, className = '' }: CashAppButtonProps) {
  const handleCashAppClick = () => {
    // Cash App deep link format
    const cashAppUrl = `https://cash.app/$${cashtag.replace('$', '')}/${amount}`
    
    // Add memo if provided
    const urlWithMemo = memo ? `${cashAppUrl}?note=${encodeURIComponent(memo)}` : cashAppUrl
    
    // Try to open Cash App, fallback to web if not installed
    window.open(urlWithMemo, '_blank')
  }

  return (
    <button
      onClick={handleCashAppClick}
      className={`bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${className}`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span>Pay with Cash App</span>
    </button>
  )
}

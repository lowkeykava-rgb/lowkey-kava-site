'use client'

interface CashAppQRProps {
  cashtag: string
  amount: number
  memo?: string
  className?: string
}

export function CashAppQR({ cashtag, amount, memo, className = '' }: CashAppQRProps) {
  // Generate Cash App QR code URL
  const cashAppUrl = `https://cash.app/$${cashtag.replace('$', '')}/${amount}`
  const urlWithMemo = memo ? `${cashAppUrl}?note=${encodeURIComponent(memo)}` : cashAppUrl
  
  // Use a QR code service to generate the QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(urlWithMemo)}`

  return (
    <div className={`text-center ${className}`}>
      <p className="text-sm text-gray-400 mb-2">Or scan this QR code:</p>
      <div className="bg-white p-4 rounded-lg inline-block">
        <img 
          src={qrCodeUrl}
          alt="Cash App QR Code" 
          className="w-32 h-32"
          onError={(e) => {
            console.error('Failed to load QR code')
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">Scan with Cash App</p>
    </div>
  )
}

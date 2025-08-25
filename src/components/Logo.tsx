interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

export function Logo({ size = 'md', showTagline = true }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'text-center',
      lowkey: 'text-2xl',
      kava: 'text-xl',
      tagline: 'text-sm'
    },
    md: {
      container: 'text-center',
      lowkey: 'text-4xl',
      kava: 'text-3xl',
      tagline: 'text-lg'
    },
    lg: {
      container: 'text-center',
      lowkey: 'text-6xl',
      kava: 'text-5xl',
      tagline: 'text-xl'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className={classes.container}>
      <div className="text-white" style={{ fontFamily: 'var(--font-dancing-script)' }}>
        {/* First line: "Lowkey" */}
        <div className={`${classes.lowkey} font-bold leading-tight`}>
          Lowkey
        </div>
        
        {/* Second line: "Kava" - positioned slightly below and to the right */}
        <div className={`${classes.kava} font-bold leading-tight -mt-2 ml-4`}>
          Kava
        </div>
        
        {/* Third line: "Keep it lowkey" - only show if showTagline is true */}
        {showTagline && (
          <div className={`${classes.tagline} font-medium leading-tight mt-2`}>
            Keep it lowkey
          </div>
        )}
      </div>
    </div>
  )
}

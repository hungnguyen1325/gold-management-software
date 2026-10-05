import React, { useEffect, useState } from 'react'
import {
  Subtract16Regular,
  Square16Regular,
  SquareMultiple16Regular,
  Dismiss16Regular
} from '@fluentui/react-icons'

interface WindowButtonControlsProps {
  className?: string
}

export const WindowButtonControls: React.FC<WindowButtonControlsProps> = ({ className = '' }) => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.api?.windowControls?.isMaximized().then((maximized) => {
      setIsMaximized(maximized)
    })
    const cleanup = window.api?.windowControls?.onMaximizedState((state) => {
      setIsMaximized(state)
    })
    return (): void => {
      cleanup?.()
    }
  }, [])

  const handleMinimize = (): void => {
    window.api?.windowControls?.minimize()
  }

  const handleMaximizeToggle = (): void => {
    window.api?.windowControls?.maximizeToggle()
  }

  const handleClose = (): void => {
    window.api?.windowControls?.close()
  }

  return (
    <div className={`no-drag-region flex h-full items-stretch ${className}`}>
      <button
        type="button"
        onClick={handleMinimize}
        title="Thu nhỏ"
        aria-label="Minimize"
        className="flex h-full w-12 cursor-default items-center justify-center text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white active:bg-white/20"
      >
        <Subtract16Regular className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={handleMaximizeToggle}
        title={isMaximized ? 'Khôi phục' : 'Phóng to'}
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        className="flex h-full w-12 cursor-default items-center justify-center text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white active:bg-white/20"
      >
        {isMaximized ? (
          <SquareMultiple16Regular className="h-4 w-4" />
        ) : (
          <Square16Regular className="h-4 w-4" />
        )}
      </button>

      <button
        type="button"
        onClick={handleClose}
        title="Đóng"
        aria-label="Close"
        className="flex h-full w-12 cursor-default items-center justify-center text-white/80 transition-colors duration-150 hover:bg-[#c42b1c] hover:text-white active:bg-[#a82315]"
      >
        <Dismiss16Regular className="h-4 w-4" />
      </button>
    </div>
  )
}

export default WindowButtonControls

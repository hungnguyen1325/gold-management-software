import React from 'react'
import {
  CheckmarkCircleRegular,
  DismissCircleRegular,
  WarningRegular,
  InfoRegular,
  DismissRegular
} from '@fluentui/react-icons'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message?: string
}

export interface ToastProps {
  toast?: ToastMessage | null
  message?: ToastMessage | null
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ toast, message, onClose }) => {
  const activeToast = toast || message
  if (!activeToast) return null

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckmarkCircleRegular className="text-xl text-emerald-600" />,
    error: <DismissCircleRegular className="text-xl text-rose-600" />,
    warning: <WarningRegular className="text-xl text-amber-600" />,
    info: <InfoRegular className="text-xl text-blue-600" />
  }

  const borderStyles: Record<ToastType, string> = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    error: 'border-rose-200 bg-rose-50/90 text-rose-900',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-900',
    info: 'border-blue-200 bg-blue-50/90 text-blue-900'
  }

  return (
    <div className="fixed top-5 right-5 z-60 max-w-sm animate-in slide-in-from-top-3 fade-in duration-200">
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-xs ${borderStyles[activeToast.type]}`}
      >
        <div className="shrink-0 mt-0.5">{icons[activeToast.type]}</div>
        <div className="flex-1">
          <h4 className="text-xs font-bold">{activeToast.title}</h4>
          {activeToast.message && <p className="mt-1 text-xs opacity-90">{activeToast.message}</p>}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity"
        >
          <DismissRegular className="text-sm" />
        </button>
      </div>
    </div>
  )
}

export default Toast

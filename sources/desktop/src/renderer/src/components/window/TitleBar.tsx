import React, { useState, useEffect, useRef } from 'react'
import WindowButtonControls from './WindowButtonControls'

export interface MenuItemAction {
  label: string
  shortcut?: string
  divider?: boolean
  danger?: boolean
  tab?: string
  onClick?: () => void
}

export interface TitleBarProps {
  onNavigate?: (tab: string) => void
  onLogout?: () => void
}

const TITLE_BAR_MENUS: Record<string, MenuItemAction[]> = {
  'Hệ thống': [
    { label: 'Cấu hình thông số hệ thống', shortcut: 'Ctrl+,', tab: 'settings' },
    { label: 'Quản lý thông tin tiệm vàng' },
    { label: 'divider-1', divider: true },
    { label: 'Sao lưu dữ liệu', shortcut: 'Ctrl+S' },
    { label: 'Phục hồi dữ liệu' },
    { label: 'divider-2', divider: true },
    { label: 'Khóa màn hình', shortcut: 'Ctrl+L' },
    { label: 'Đăng xuất tài khoản' },
    {
      label: 'Thoát phần mềm',
      shortcut: 'Alt+F4',
      danger: true,
      onClick: () => window.api?.windowControls?.close()
    }
  ],
  'Danh mục': [
    { label: 'Bảng giá vàng niêm yết', tab: 'gold_price' },
    { label: 'Danh mục loại vàng & Tuổi vàng' },
    { label: 'Danh mục nhóm hàng trang sức' },
    { label: 'Bảng giá tiền công & Đá quý' },
    { label: 'divider-dm-1', divider: true },
    { label: 'Danh mục khách hàng', tab: 'customers' },
    { label: 'Danh mục nhà cung cấp & Chành sỉ' },
    { label: 'Danh mục thợ kim hoàn' },
    { label: 'divider-dm-2', divider: true },
    { label: 'Danh mục tài khoản ngân hàng' }
  ],
  'Nhân sự': [
    { label: 'Danh sách nhân viên' },
    { label: 'Phân ca làm việc & Chấm công' },
    { label: 'Bảng tính lương nhân viên' },
    { label: 'divider-ns-1', divider: true },
    { label: 'Thiết lập hoa hồng doanh số' }
  ],
  'Quản trị': [
    { label: 'Quản lý tài khoản người dùng' },
    { label: 'Phân quyền vai trò (Roles & Permissions)' },
    { label: 'divider-qt-1', divider: true },
    { label: 'Nhật ký thao tác hệ thống (Audit Log)' },
    { label: 'Thiết lập bảo mật & Mật khẩu' }
  ],
  'Trợ giúp': [
    { label: 'Hướng dẫn sử dụng', shortcut: 'F1' },
    { label: 'Danh mục phím tắt hệ thống' },
    { label: 'divider-tg-1', divider: true },
    { label: 'Kiểm tra bản cập nhật' },
    { label: 'Thông tin bản quyền phần mềm' }
  ]
}

const MENU_KEYS = Object.keys(TITLE_BAR_MENUS)

export default function TitleBar({ onNavigate, onLogout }: TitleBarProps): React.JSX.Element {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setActiveMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleItemClick = (item: MenuItemAction): void => {
    setActiveMenu(null)
    if (item.label === 'Đăng xuất tài khoản' && onLogout) {
      onLogout()
      return
    }
    if (item.onClick) {
      item.onClick()
    } else if (item.tab && onNavigate) {
      onNavigate(item.tab)
    }
  }

  return (
    <div className="drag-region flex h-9 w-full select-none items-center bg-bg-titlebar pl-3 text-white">
      <div ref={menuContainerRef} className="no-drag-region flex items-center gap-0.5">
        {MENU_KEYS.map((menuTitle) => {
          const isOpen = activeMenu === menuTitle
          const items = TITLE_BAR_MENUS[menuTitle]

          return (
            <div key={menuTitle} className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(isOpen ? null : menuTitle)}
                onMouseEnter={() => {
                  if (activeMenu !== null) {
                    setActiveMenu(menuTitle)
                  }
                }}
                className={`rounded px-2 py-1 text-xs font-normal whitespace-nowrap shrink-0 transition-colors ${
                  isOpen
                    ? 'bg-white/25 text-white font-medium'
                    : 'text-white/85 hover:bg-white/15 hover:text-white'
                }`}
              >
                {menuTitle}
              </button>

              {/* Dropdown Menu Panel */}
              {isOpen && items && (
                <div className="absolute top-full left-0 z-50 mt-1 min-w-[220px] rounded-lg border border-slate-200 bg-white py-1 text-slate-800 shadow-xl">
                  {items.map((item, idx) => {
                    if (item.divider) {
                      return <div key={`div-${idx}`} className="my-1 border-t border-slate-100" />
                    }

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={`group flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition-colors ${
                          item.danger
                            ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                            : 'text-slate-700 hover:bg-blue-50 hover:text-[#006aff]'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {item.shortcut && (
                          <span
                            className={`ml-4 font-mono text-[10px] text-slate-400 ${
                              item.danger
                                ? 'group-hover:text-rose-600'
                                : 'group-hover:text-[#006aff]'
                            }`}
                          >
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Window Controls & Logout */}
      <div className="ml-auto flex items-center gap-1.5">
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Đăng xuất tài khoản"
            className="no-drag-region mr-1 rounded px-2 py-0.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-rose-600 hover:text-white"
          >
            Đăng xuất
          </button>
        )}
        <WindowButtonControls />
      </div>
    </div>
  )
}

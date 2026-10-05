import React, { useState, useEffect, useRef } from 'react'
import {
  Grid20Regular,
  Receipt20Regular,
  Diamond20Regular,
  ChartMultiple20Regular,
  ChevronDown16Regular,
  ArrowRepeatAll20Regular,
  Sparkle20Regular,
  Handshake20Regular,
  Tag20Regular,
  ClipboardCheckmark20Regular,
  Wallet20Regular,
  BoxMultiple20Regular,
  MoneyHand20Regular,
  DataTrending20Regular
} from '@fluentui/react-icons'

export type NavItemKey =
  | 'dashboard'
  | 'gold_price'
  | 'pos_sale'
  | 'pos_exchange'
  | 'pos_wholesale'
  | 'pos_invoices'
  | 'order_craft'
  | 'repair_polish'
  | 'pawn'
  | 'craft_partners'
  | 'inventory_gold'
  | 'inventory_import'
  | 'barcode_tag'
  | 'stock_audit'
  | 'cash_receipt'
  | 'cash_payment'
  | 'cashbook'
  | 'debt'
  | 'reports'
  | 'reports_inventory'

export interface DropdownItem {
  key: NavItemKey
  label: string
  icon: React.ReactNode
}

export interface MenuGroup {
  id: string
  label: string
  icon: React.ReactNode
  directKey?: NavItemKey
  items?: DropdownItem[]
}

export interface NavigationProps {
  activeKey?: NavItemKey
  activeTab?: NavItemKey
  onChange?: (key: NavItemKey) => void
  onSelectTab?: (key: NavItemKey) => void
  className?: string
}

const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    icon: <Grid20Regular className="h-4 w-4 shrink-0" />,
    directKey: 'dashboard'
  },
  {
    id: 'gold_price',
    label: 'Bảng Giá Vàng',
    icon: <Diamond20Regular className="h-4 w-4 shrink-0 text-amber-500" />,
    directKey: 'gold_price'
  },
  {
    id: 'sales',
    label: 'Bán hàng',
    icon: <Receipt20Regular className="h-4 w-4 shrink-0" />,
    items: [
      {
        key: 'pos_sale',
        label: 'Bán lẻ vàng & Nữ trang',
        icon: <Receipt20Regular className="h-4 w-4 text-blue-600" />
      },
      {
        key: 'pos_exchange',
        label: 'Thu đổi & Mua vàng cũ',
        icon: <ArrowRepeatAll20Regular className="h-4 w-4 text-emerald-600" />
      },
      {
        key: 'pos_wholesale',
        label: 'Bán sỉ vàng miếng & nhẫn',
        icon: <BoxMultiple20Regular className="h-4 w-4 text-amber-600" />
      },
      {
        key: 'pos_invoices',
        label: 'Quản lý hóa đơn bán hàng',
        icon: <ClipboardCheckmark20Regular className="h-4 w-4 text-indigo-600" />
      }
    ]
  },
  {
    id: 'craft_repair',
    label: 'Sửa chữa gia công',
    icon: <Sparkle20Regular className="h-4 w-4 shrink-0" />,
    items: [
      {
        key: 'order_craft',
        label: 'Nhận đặt hàng gia công mẫu',
        icon: <Sparkle20Regular className="h-4 w-4 text-purple-600" />
      },
      {
        key: 'repair_polish',
        label: 'Nhận sửa chữa & Xi mạ',
        icon: <Diamond20Regular className="h-4 w-4 text-cyan-600" />
      },
      {
        key: 'pawn',
        label: 'Cầm đồ vàng & Thế chấp',
        icon: <Handshake20Regular className="h-4 w-4 text-rose-600" />
      },
      {
        key: 'craft_partners',
        label: 'Giao nhận thợ kim hoàn',
        icon: <MoneyHand20Regular className="h-4 w-4 text-amber-600" />
      }
    ]
  },
  {
    id: 'inventory',
    label: 'Kho hàng',
    icon: <BoxMultiple20Regular className="h-4 w-4 shrink-0" />,
    items: [
      {
        key: 'inventory_gold',
        label: 'Tồn kho vàng & Nữ trang',
        icon: <BoxMultiple20Regular className="h-4 w-4 text-amber-600" />
      },
      {
        key: 'inventory_import',
        label: 'Nhập kho vàng & Đá quý',
        icon: <ArrowRepeatAll20Regular className="h-4 w-4 text-blue-600" />
      },
      {
        key: 'barcode_tag',
        label: 'In tem & Mã vạch',
        icon: <Tag20Regular className="h-4 w-4 text-cyan-600" />
      },
      {
        key: 'stock_audit',
        label: 'Kiểm kê kho & Đối soát',
        icon: <ClipboardCheckmark20Regular className="h-4 w-4 text-emerald-600" />
      }
    ]
  },
  {
    id: 'finance',
    label: 'Thu chi',
    icon: <Wallet20Regular className="h-4 w-4 shrink-0" />,
    items: [
      {
        key: 'cash_receipt',
        label: 'Lập phiếu thu tiền mặt',
        icon: <Wallet20Regular className="h-4 w-4 text-emerald-600" />
      },
      {
        key: 'cash_payment',
        label: 'Lập phiếu chi tiền mặt',
        icon: <Wallet20Regular className="h-4 w-4 text-rose-600" />
      },
      {
        key: 'cashbook',
        label: 'Sổ quỹ tiền mặt & Ngân hàng',
        icon: <Wallet20Regular className="h-4 w-4 text-blue-600" />
      },
      {
        key: 'debt',
        label: 'Quản lý công nợ khách & thợ',
        icon: <MoneyHand20Regular className="h-4 w-4 text-amber-600" />
      }
    ]
  },
  {
    id: 'reports_group',
    label: 'Báo cáo',
    icon: <ChartMultiple20Regular className="h-4 w-4 shrink-0" />,
    items: [
      {
        key: 'reports',
        label: 'Báo cáo doanh số & Lợi nhuận',
        icon: <ChartMultiple20Regular className="h-4 w-4 text-blue-600" />
      },
      {
        key: 'reports_inventory',
        label: 'Báo cáo xuất - nhập - tồn vàng',
        icon: <DataTrending20Regular className="h-4 w-4 text-indigo-600" />
      }
    ]
  }
]

export const Navigation: React.FC<NavigationProps> = ({
  activeKey,
  activeTab: legacyActiveTab,
  onChange,
  onSelectTab: legacyOnSelectTab,
  className = ''
}) => {
  const currentTab: NavItemKey = activeKey ?? legacyActiveTab ?? 'dashboard'
  const handleSelect = (key: NavItemKey): void => {
    onChange?.(key)
    legacyOnSelectTab?.(key)
  }

  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const navContainerRef = useRef<HTMLElement>(null)

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setOpenGroup(null)
      }
    }
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setOpenGroup(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <nav
      ref={navContainerRef}
      className={`no-drag-region relative z-40 flex h-11 w-full shrink-0 select-none items-center justify-between border-b border-slate-200/90 bg-white px-2.5 sm:px-3 shadow-xs ${className}`}
    >
      {/* Horizontal Nav Groups */}
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
        {MENU_GROUPS.map((group) => {
          const isDirectActive = group.directKey === currentTab
          const hasActiveChild = group.items?.some((item) => item.key === currentTab)
          const isActive = isDirectActive || hasActiveChild
          const isOpen = openGroup === group.id

          if (group.directKey) {
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  handleSelect(group.directKey!)
                  setOpenGroup(null)
                }}
                className={`group flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2 sm:px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive
                    ? 'border-blue-100 bg-blue-50 text-[#006aff]'
                    : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`transition-colors shrink-0 ${
                    isActive ? 'text-[#006aff]' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                >
                  {group.icon}
                </span>
                {group.id === 'gold_price' ? (
                  <span className="whitespace-nowrap">
                    <span className="hidden xl:inline">Bảng </span>Giá Vàng
                  </span>
                ) : (
                  <span className="whitespace-nowrap">{group.label}</span>
                )}
              </button>
            )
          }

          return (
            <div key={group.id} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? null : group.id)}
                className={`group flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive || isOpen
                    ? 'border-blue-100 bg-blue-50 text-[#006aff]'
                    : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`transition-colors shrink-0 ${
                    isActive || isOpen
                      ? 'text-[#006aff]'
                      : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                >
                  {group.icon}
                </span>
                {group.id === 'craft_repair' ? (
                  <span className="whitespace-nowrap">
                    <span className="hidden xl:inline">Sửa chữa </span>Gia công
                  </span>
                ) : (
                  <span className="whitespace-nowrap">{group.label}</span>
                )}
                <ChevronDown16Regular
                  className={`h-3 w-3 text-slate-400 transition-colors shrink-0 ${
                    isOpen ? 'rotate-180 text-[#006aff]' : 'group-hover:text-slate-600'
                  }`}
                />
              </button>

              {/* Group Dropdown Menu Panel */}
              {isOpen && group.items && (
                <div
                  className={`absolute top-full z-50 mt-1 w-60 rounded-xl border border-slate-200 bg-white p-1 shadow-lg ${
                    group.id === 'reports_group' || group.id === 'finance' ? 'right-0' : 'left-0'
                  }`}
                >
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isItemActive = currentTab === item.key

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            handleSelect(item.key)
                            setOpenGroup(null)
                          }}
                          className={`group flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-xs font-normal whitespace-nowrap transition-colors duration-150 ${
                            isItemActive
                              ? 'border-blue-100 bg-blue-50/90 text-[#006aff]'
                              : 'border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center transition-colors ${
                              isItemActive
                                ? 'text-[#006aff]'
                                : 'text-slate-500 group-hover:text-slate-800'
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

export default Navigation

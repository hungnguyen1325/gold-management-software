import React, { useState, useMemo } from 'react'
import {
  SearchRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  DocumentBulletListRegular
} from '@fluentui/react-icons'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T, index: number) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor?: (item: T, index?: number) => string | number
  searchPlaceholder?: string
  searchFields?: (keyof T)[]
  pageSize?: number
  actions?: React.ReactNode
  emptyMessage?: string
  isLoading?: boolean
  loading?: boolean
  onRowClick?: (item: T) => void
}

export function DataTable<T extends Record<string, any> = any>({
  columns,
  data,
  keyExtractor,
  searchPlaceholder = 'Tìm kiếm nhanh...',
  searchFields,
  pageSize = 10,
  actions,
  emptyMessage = 'Không tìm thấy dữ liệu phù hợp',
  isLoading = false,
  loading = false,
  onRowClick
}: DataTableProps<T>): React.JSX.Element {
  const activeLoading = isLoading || loading
  const activeKeyExtractor =
    keyExtractor ||
    ((item: any, idx?: number) => item?.id ?? item?.voucherCode ?? item?.key ?? idx ?? Math.random())
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data

    const lower = searchTerm.toLowerCase().trim()
    return data.filter((item) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field]
          return val !== undefined && val !== null && String(val).toLowerCase().includes(lower)
        })
      }
      return Object.values(item).some(
        (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(lower)
      )
    })
  }, [data, searchTerm, searchFields])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search & Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[260px] max-w-sm flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <SearchRegular className="text-base" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-100 shadow-2xs"
          />
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold select-none">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-4 py-3 tracking-wider uppercase text-2xs ${
                      alignmentClass[col.align || 'left']
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activeLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-6 w-6 text-amber-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <DocumentBulletListRegular className="text-3xl text-slate-300" />
                      <p className="font-medium text-slate-500">{emptyMessage}</p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="mt-1 text-xs text-amber-600 hover:underline cursor-pointer"
                        >
                          Xóa bộ lọc tìm kiếm
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={activeKeyExtractor(item, index)}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition-colors hover:bg-amber-50/40 ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${alignmentClass[col.align || 'left']}`}
                      >
                        {col.render
                          ? col.render(item, (currentPage - 1) * pageSize + index)
                          : item[col.key] !== undefined && item[col.key] !== null
                            ? String(item[col.key])
                            : '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!isLoading && filteredData.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-500">
            <div>
              Hiển thị{' '}
              <span className="font-semibold text-slate-700">
                {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)}
              </span>{' '}
              đến{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(currentPage * pageSize, filteredData.length)}
              </span>{' '}
              trong tổng số <span className="font-semibold text-slate-700">{filteredData.length}</span>{' '}
              bản ghi
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronLeftRegular className="text-xs" />
              </button>

              <span className="px-2 text-xs font-medium text-slate-700">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronRightRegular className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataTable

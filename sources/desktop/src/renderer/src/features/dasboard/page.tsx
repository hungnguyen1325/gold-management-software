import React, { useEffect, useState } from 'react'
import {
  MoneyRegular,
  VaultRegular,
  WarningRegular,
  ArrowClockwiseRegular,
  BoxRegular,
  ReceiptMoneyRegular
} from '@fluentui/react-icons'
import { StatCard, Button, Badge, DataTable, Column } from '../../components/common'
import api from '../../services/api'

interface DashboardProps {
  onNavigate?: (key: string) => void
}

export default function Dashboard({ onNavigate }: DashboardProps): React.JSX.Element {
  const [stats, setStats] = useState<any>(null)
  const [goldPrices, setGoldPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true)
      const [dashData, prices] = await Promise.all([
        api.getDashboardStats(),
        api.getGoldPrices()
      ])
      setStats(dashData)
      setGoldPrices(prices)
    } catch (err) {
      console.error('Lỗi tải dữ liệu dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSyncPrice = async (): Promise<void> => {
    try {
      setSyncing(true)
      const updatedPrices = await api.syncGoldPrices()
      setGoldPrices(updatedPrices)
    } catch (err) {
      console.error('Lỗi đồng bộ giá vàng:', err)
    } finally {
      setSyncing(false)
    }
  }

  const formatCurrency = (val: number | string): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0)
  }

  const recentSalesColumns: Column<any>[] = [
    {
      key: 'invoiceCode',
      header: 'Mã Hóa Đơn',
      render: (item) => <span className="font-mono font-semibold text-amber-700">{item.invoiceCode}</span>
    },
    {
      key: 'customerName',
      header: 'Khách Hàng',
      render: (item) => <span>{item.customerName || 'Khách vãng lai'}</span>
    },
    {
      key: 'totalAmount',
      header: 'Tổng Tiền',
      align: 'right',
      render: (item) => (
        <span className="font-semibold text-slate-900">{formatCurrency(item.totalAmount)}</span>
      )
    },
    {
      key: 'paymentMethod',
      header: 'Phương Thức',
      align: 'center',
      render: (item) => (
        <Badge variant={item.paymentMethod === 'CASH' ? 'success' : 'info'} size="sm">
          {item.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      align: 'center',
      render: (item) => (
        <Badge variant="success" dot size="sm">
          {item.status === 'COMPLETED' ? 'Hoàn tất' : item.status}
        </Badge>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Tổng Quan Hoạt Động Doanh Nghiệp
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Chi nhánh: <span className="font-semibold text-slate-700">Cầu Giấy - Hà Nội</span> | Hệ thống Quản lý Vàng Trang Sức GMS
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onNavigate && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('pos_sale')}
              >
                + Bán Hàng POS
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('pos_exchange')}
              >
                Thu Mua Vàng Cũ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('inventory_gold')}
              >
                Kho Hàng
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            isLoading={syncing}
            leftIcon={<ArrowClockwiseRegular />}
            onClick={handleSyncPrice}
          >
            Đồng bộ giá
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchData}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Doanh Thu Bán Hàng"
          value={formatCurrency(stats?.totalRevenue || 0)}
          subtitle={`${stats?.totalOrders || 0} giao dịch hoàn tất`}
          icon={<MoneyRegular className="text-xl" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Số Dư Quỹ Hiện Tại"
          value={formatCurrency(stats?.currentCashBalance || 20000000)}
          subtitle="Ca làm việc đang mở"
          icon={<VaultRegular className="text-xl" />}
          iconBgColor="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Lượng Vàng Tồn Kho"
          value={`${Number(stats?.totalPureGoldInventory || 0).toFixed(2)} chỉ`}
          subtitle={`${stats?.totalJewelryPieces || 0} món trang sức lưu kho`}
          icon={<BoxRegular className="text-xl" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Cảnh Báo Sắp Hết"
          value={`${stats?.lowStockCount || 0} mẫu`}
          subtitle="Tồn kho đạt ngưỡng <= 3"
          icon={<WarningRegular className="text-xl" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Main Content Layout: Live Gold Prices & Recent Sales */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Live Gold Price Board */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Bảng Giá Vàng Hiện Hành
              </h2>
            </div>
            <span className="text-2xs text-slate-400">Đơn vị: đ/chỉ</span>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {goldPrices.map((gp) => {
              const spread = Number(gp.sellPrice) - Number(gp.buyPrice)
              return (
                <div key={gp.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{gp.goldType}</p>
                    <p className="text-2xs text-slate-400">
                      Hàm lượng: {gp.purityPercent}% | Chênh lệch: {formatCurrency(spread)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-rose-600">
                      Bán: {formatCurrency(gp.sellPrice)}
                    </p>
                    <p className="text-2xs font-medium text-emerald-600">
                      Mua: {formatCurrency(gp.buyPrice)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Recent Sales & Operations */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ReceiptMoneyRegular className="text-lg text-amber-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Giao Dịch Bán Hàng Gần Nhất
                </h2>
              </div>
              <span className="text-xs text-slate-400">Cập nhật thời gian thực</span>
            </div>

            <DataTable
              columns={recentSalesColumns}
              data={stats?.recentSales || []}
              keyExtractor={(item) => item.id}
              emptyMessage="Chưa có giao dịch bán hàng nào trong phiên"
              isLoading={loading}
              pageSize={5}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

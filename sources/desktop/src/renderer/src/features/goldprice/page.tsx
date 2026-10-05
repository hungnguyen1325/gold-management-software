import React, { useEffect, useState } from 'react'
import {
  ArrowClockwiseRegular,
  EditRegular,
  CheckmarkRegular
} from '@fluentui/react-icons'
import { Button, Modal, Input, Badge, Toast, ToastMessage } from '../../components/common'
import api from '../../services/api'

export default function GoldPricePage(): React.JSX.Element {
  const [goldPrices, setGoldPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<any | null>(null)
  const [editBuyPrice, setEditBuyPrice] = useState('')
  const [editSellPrice, setEditSellPrice] = useState('')
  const [editPurity, setEditPurity] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchPrices = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await api.getGoldPrices()
      setGoldPrices(data)
    } catch (err: any) {
      setToast({ id: 'err', type: 'error', title: 'Lỗi tải giá vàng', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [])

  const handleSync = async (): Promise<void> => {
    try {
      setSyncing(true)
      const data = await api.syncGoldPrices()
      setGoldPrices(data)
      setToast({ id: 'sync', type: 'success', title: 'Đồng bộ thành công', message: 'Bảng giá thị trường đã được cập nhật mới nhất' })
    } catch (err: any) {
      setToast({ id: 'sync-err', type: 'error', title: 'Lỗi đồng bộ', message: err.message })
    } finally {
      setSyncing(false)
    }
  }

  const openEditModal = (gp: any): void => {
    setSelectedPrice(gp)
    setEditBuyPrice(String(gp.buyPrice))
    setEditSellPrice(String(gp.sellPrice))
    setEditPurity(String(gp.purityPercent || ''))
    setErrorMsg('')
    setModalOpen(true)
  }

  const handleSavePrice = async (): Promise<void> => {
    const buy = Number(editBuyPrice)
    const sell = Number(editSellPrice)
    const purity = Number(editPurity)

    if (isNaN(buy) || buy <= 0) {
      setErrorMsg('Giá mua vào phải là số hợp lệ và lớn hơn 0')
      return
    }
    if (isNaN(sell) || sell <= 0) {
      setErrorMsg('Giá bán ra phải là số hợp lệ và lớn hơn 0')
      return
    }
    if (sell < buy) {
      setErrorMsg('Lỗi quy tắc nghiệp vụ: Giá bán ra không được nhỏ hơn giá mua vào!')
      return
    }

    try {
      await api.updateGoldPrice(selectedPrice.id, {
        goldType: selectedPrice.goldType,
        buyPrice: buy,
        sellPrice: sell,
        purityPercent: isNaN(purity) ? undefined : purity
      })
      setModalOpen(false)
      fetchPrices()
      setToast({ id: 'save', type: 'success', title: 'Cập nhật thành công', message: `Bảng giá ${selectedPrice.goldType} đã được lưu` })
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu bảng giá')
    }
  }

  const formatCurrency = (val: number | string): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0)
  }

  return (
    <div className="flex flex-col gap-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Quản Lý Bảng Giá Vàng
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Theo dõi, cập nhật và đồng bộ giá mua vào / bán ra theo thị trường làm chuẩn cho POS & Mua lại
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            isLoading={syncing}
            leftIcon={<ArrowClockwiseRegular />}
            onClick={handleSync}
          >
            Đồng bộ giá thị trường
          </Button>
          <Button variant="primary" size="sm" isLoading={loading} onClick={fetchPrices}>
            Tải lại
          </Button>
        </div>
      </div>

      {/* Gold Price Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goldPrices.map((gp) => {
          const spread = Number(gp.sellPrice) - Number(gp.buyPrice)
          return (
            <div
              key={gp.id}
              className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 rounded-full bg-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">{gp.goldType}</h3>
                </div>
                <Badge variant="gold" size="sm">
                  {gp.purityPercent}% Vàng ròng
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-emerald-50/70 p-3 border border-emerald-100">
                  <span className="text-2xs font-semibold uppercase text-emerald-800">
                    Giá Mua Vào (Bid)
                  </span>
                  <p className="mt-1 text-base font-bold text-emerald-700">
                    {formatCurrency(gp.buyPrice)}
                  </p>
                </div>

                <div className="rounded-lg bg-rose-50/70 p-3 border border-rose-100">
                  <span className="text-2xs font-semibold uppercase text-rose-800">
                    Giá Bán Ra (Ask)
                  </span>
                  <p className="mt-1 text-base font-bold text-rose-700">
                    {formatCurrency(gp.sellPrice)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span>Chênh lệch: <strong className="text-slate-700">{formatCurrency(spread)}</strong></span>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<EditRegular />}
                  onClick={() => openEditModal(gp)}
                >
                  Điều chỉnh
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Gold Price Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Cập nhật giá vàng ${selectedPrice?.goldType}`}
        subtitle="Quy tắc: Giá bán ra bắt buộc phải lớn hơn hoặc bằng giá mua vào"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" leftIcon={<CheckmarkRegular />} onClick={handleSavePrice}>
              Áp dụng bảng giá mới
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {errorMsg && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-200">
              {errorMsg}
            </div>
          )}

          <Input
            label="Giá Mua Vào (VNĐ / chỉ)"
            type="number"
            value={editBuyPrice}
            onChange={(e) => setEditBuyPrice(e.target.value)}
            placeholder="Ví dụ: 8450000"
            required
          />

          <Input
            label="Giá Bán Ra (VNĐ / chỉ)"
            type="number"
            value={editSellPrice}
            onChange={(e) => setEditSellPrice(e.target.value)}
            placeholder="Ví dụ: 8650000"
            required
          />

          <Input
            label="Hàm Lượng Vàng (%)"
            type="number"
            step="0.01"
            value={editPurity}
            onChange={(e) => setEditPurity(e.target.value)}
            placeholder="Ví dụ: 99.99"
          />
        </div>
      </Modal>
    </div>
  )
}

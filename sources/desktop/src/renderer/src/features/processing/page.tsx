import React, { useEffect, useState } from 'react'
import {
  ArrowRepeatAllRegular,
  MoneyHandRegular,
  WalletRegular,
  CheckmarkRegular,
  ReceiptRegular,
  ArrowDownloadRegular
} from '@fluentui/react-icons'
import {
  Button,
  Modal,
  Input,
  Select,
  Badge,
  DataTable,
  Column,
  StatCard,
  Toast,
  ToastMessage
} from '../../components/common'
import api from '../../services/api'

interface BuybackItem extends Record<string, any> {
  id?: number
  voucherCode?: string
  customerName: string
  customerPhone: string
  customerIdCard: string
  goldType: string
  grossWeight: number
  stoneWeight: number
  netWeight: number
  lossRatePercent: number
  pureWeight: number
  unitBuyPrice: number
  totalAmount: number
  paymentMethod: 'CASH' | 'TRANSFER'
  notes?: string
  createdAt?: string
}

export default function ProcessingPage(): React.JSX.Element {
  const [history, setHistory] = useState<BuybackItem[]>([])
  const [goldPrices, setGoldPrices] = useState<any[]>([])
  const [activeShift, setActiveShift] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [selectedReceipt, setSelectedReceipt] = useState<BuybackItem | null>(null)

  // Form states
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerIdCard, setCustomerIdCard] = useState('')
  const [goldType, setGoldType] = useState('24K (Nhẫn tròn trơn)')
  const [grossWeight, setGrossWeight] = useState('1.5')
  const [stoneWeight, setStoneWeight] = useState('0.1')
  const [lossRate, setLossRate] = useState('2.0') // % hao mòn
  const [unitBuyPrice, setUnitBuyPrice] = useState('8450000')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH')
  const [notes, setNotes] = useState('')

  // Load initial data
  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true)
      const [buybacksData, pricesData, shiftData] = await Promise.all([
        api.getBuybacks().catch(() => []),
        api.getGoldPrices().catch(() => []),
        api.getActiveShift().catch(() => null)
      ])
      setHistory(buybacksData || [])
      setGoldPrices(pricesData || [])
      setActiveShift(shiftData)

      // Set initial unit price based on default goldType
      const matched = pricesData?.find((p: any) => p.goldType.includes('24K'))
      if (matched) {
        setUnitBuyPrice(String(matched.buyPrice))
      }
    } catch (err: any) {
      setToast({
        id: 'err-load',
        type: 'error',
        title: 'Lỗi tải dữ liệu',
        message: err.message || 'Không thể tải thông tin thu đổi vàng cũ'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-update price when gold type changes
  const handleGoldTypeChange = (selected: string): void => {
    setGoldType(selected)
    const match = goldPrices.find((p) => p.goldType === selected)
    if (match) {
      setUnitBuyPrice(String(match.buyPrice))
    }
  }

  // Calculations
  const grossNum = parseFloat(grossWeight) || 0
  const stoneNum = parseFloat(stoneWeight) || 0
  const netWeightCalc = Math.max(0, grossNum - stoneNum)
  const lossNum = parseFloat(lossRate) || 0
  const pureWeightCalc = netWeightCalc * (1 - lossNum / 100)
  const unitPriceNum = parseFloat(unitBuyPrice) || 0
  const totalAmountCalc = Math.round(pureWeightCalc * unitPriceNum)

  // Current cash balance check
  const availableCash = activeShift ? Number(activeShift.currentCashBalance || 0) : 0
  const isCashInsufficient = paymentMethod === 'CASH' && totalAmountCalc > availableCash

  const handleCreateBuyback = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!customerName.trim()) {
      setToast({ id: 'err-val', type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng nhập tên khách hàng giao dịch' })
      return
    }
    if (grossNum <= 0) {
      setToast({ id: 'err-val2', type: 'warning', title: 'Khối lượng không hợp lệ', message: 'Trọng lượng vàng phải lớn hơn 0' })
      return
    }
    if (isCashInsufficient) {
      setToast({
        id: 'err-cash',
        type: 'error',
        title: 'Quỹ tiền mặt không đủ',
        message: `Số dư quỹ hiện tại (${availableCash.toLocaleString('vi-VN')} đ) không đủ để chi trả ${totalAmountCalc.toLocaleString('vi-VN')} đ. Vui lòng chọn Chuyển khoản hoặc nạp thêm tiền vào quỹ.`
      })
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerIdCard: customerIdCard.trim(),
        goldType,
        grossWeight: grossNum,
        stoneWeight: stoneNum,
        netWeight: Number(netWeightCalc.toFixed(4)),
        lossRatePercent: lossNum,
        pureWeight: Number(pureWeightCalc.toFixed(4)),
        unitBuyPrice: unitPriceNum,
        totalAmount: totalAmountCalc,
        paymentMethod,
        notes: notes.trim(),
        branchId: 1
      }

      const res = await api.createBuyback(payload)
      setToast({
        id: 'succ',
        type: 'success',
        title: 'Thu mua thành công',
        message: `Đã lập phiếu thu mua ${res.voucherCode || ''} và tự động hạch toán phiếu chi!`
      })

      // Reset form
      setGrossWeight('')
      setStoneWeight('0')
      setNotes('')
      setSelectedReceipt(res)
      fetchData()
    } catch (err: any) {
      setToast({
        id: 'err-create',
        type: 'error',
        title: 'Lỗi lập phiếu thu mua',
        message: err.message || 'Không thể hoàn tất giao dịch'
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Statistics
  const totalBuybackAmount = history.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0)
  const totalPureGoldBought = history.reduce((sum, item) => sum + (Number(item.pureWeight) || 0), 0)

  const columns: Column<BuybackItem>[] = [
    {
      key: 'voucherCode',
      header: 'Mã phiếu',
      width: '130px',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-blue-600">
          {item.voucherCode || `BM-${item.id}`}
        </span>
      )
    },
    {
      key: 'customerName',
      header: 'Khách hàng',
      render: (item) => (
        <div>
          <div className="font-medium text-slate-800">{item.customerName}</div>
          <div className="text-[11px] text-slate-400">
            {item.customerPhone ? item.customerPhone : 'Kèm CCCD: ' + (item.customerIdCard || '---')}
          </div>
        </div>
      )
    },
    {
      key: 'goldType',
      header: 'Loại vàng',
      render: (item) => <Badge variant="gold">{item.goldType}</Badge>
    },
    {
      key: 'netWeight',
      header: 'TL Thu thực tế',
      align: 'right',
      render: (item) => (
        <span className="font-mono font-medium text-slate-700">
          {Number(item.netWeight).toFixed(3)} chỉ
        </span>
      )
    },
    {
      key: 'unitBuyPrice',
      header: 'Đơn giá thu',
      align: 'right',
      render: (item) => (
        <span className="text-slate-600">
          {Number(item.unitBuyPrice).toLocaleString('vi-VN')} đ
        </span>
      )
    },
    {
      key: 'totalAmount',
      header: 'Thành tiền chi trả',
      align: 'right',
      render: (item) => (
        <span className="font-semibold text-rose-600">
          {Number(item.totalAmount).toLocaleString('vi-VN')} đ
        </span>
      )
    },
    {
      key: 'paymentMethod',
      header: 'Hình thức',
      align: 'center',
      render: (item) => (
        <Badge variant={item.paymentMethod === 'CASH' ? 'success' : 'info'}>
          {item.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      width: '140px',
      render: (item) => (
        <span className="text-xs text-slate-400">
          {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
        </span>
      )
    },
    {
      key: 'id',
      header: 'Thao tác',
      align: 'center',
      render: (item) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedReceipt(item)
          }}
        >
          In phiếu
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Thu Đổi & Mua Vàng Cũ (Buyback)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quy trình cân đo tuổi vàng, xác định tạp chất, định giá theo bảng giá niêm yết và hạch toán chi quỹ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={<ArrowRepeatAllRegular className="h-4 w-4" />}
            onClick={fetchData}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng tiền chi thu mua"
          value={`${totalBuybackAmount.toLocaleString('vi-VN')} đ`}
          trend={`${history.length} lượt giao dịch`}
          trendType="neutral"
          icon={<MoneyHandRegular className="h-5 w-5" />}
          colorVariant="rose"
        />
        <StatCard
          title="Vàng thực thu quy chuẩn"
          value={`${totalPureGoldBought.toFixed(3)} chỉ`}
          trend="Đã nhập kho vàng phân kim"
          trendType="up"
          icon={<ReceiptRegular className="h-5 w-5" />}
          colorVariant="gold"
        />
        <StatCard
          title="Quỹ tiền mặt hiện tại"
          value={`${availableCash.toLocaleString('vi-VN')} đ`}
          trend={availableCash > 10000000 ? 'Sẵn sàng chi trả' : 'Cần bổ sung quỹ'}
          trendType={availableCash > 10000000 ? 'up' : 'down'}
          icon={<WalletRegular className="h-5 w-5" />}
          colorVariant="blue"
        />
        <StatCard
          title="Đơn giá vàng 999.9 thu vào"
          value={`${(
            goldPrices.find((p) => p.goldType.includes('24K'))?.buyPrice || 8450000
          ).toLocaleString('vi-VN')} đ/chỉ`}
          trend="Theo thời giá thị trường"
          trendType="neutral"
          icon={<ArrowRepeatAllRegular className="h-5 w-5" />}
          colorVariant="amber"
        />
      </div>

      {/* Main Grid: Calculation Form + History Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Form: Calculator & Voucher creation */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-800">
              Lập Phiếu Thu Mua Vàng Cũ
            </h2>
            <Badge variant="warning">Kiểm định tại quầy</Badge>
          </div>

          <form onSubmit={handleCreateBuyback} className="space-y-4">
            {/* Customer Section */}
            <div className="space-y-3 rounded-lg bg-slate-50/70 p-3 border border-slate-200/60">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Thông tin khách hàng
              </div>
              <Input
                label="Họ tên người bán *"
                placeholder="Nguyễn Văn A"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Số điện thoại"
                  placeholder="0912 345 678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <Input
                  label="Số CCCD / CMND"
                  placeholder="00120000xxxx"
                  value={customerIdCard}
                  onChange={(e) => setCustomerIdCard(e.target.value)}
                />
              </div>
            </div>

            {/* Gold Assessment Section */}
            <div className="space-y-3 rounded-lg bg-amber-50/40 p-3 border border-amber-200/50">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Đo đạc & Giám định chất lượng
              </div>

              <Select
                label="Loại vàng thu nhận *"
                value={goldType}
                onChange={(e) => handleGoldTypeChange(e.target.value)}
                options={
                  goldPrices.length > 0
                    ? goldPrices.map((p) => ({ value: p.goldType, label: `${p.goldType} (Đơn giá: ${Number(p.buyPrice).toLocaleString('vi-VN')} đ)` }))
                    : [
                        { value: '24K (Nhẫn tròn trơn)', label: '24K (Nhẫn tròn trơn)' },
                        { value: '18K (Vàng 750)', label: '18K (Vàng 750 Ý)' },
                        { value: '14K (Vàng 585)', label: '14K (Vàng 585)' },
                        { value: '10K (Vàng 416)', label: '10K (Vàng 416)' }
                      ]
                }
              />

              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Tổng cân (Chỉ)"
                  type="number"
                  step="0.001"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  required
                />
                <Input
                  label="Trừ đá (Chỉ)"
                  type="number"
                  step="0.001"
                  value={stoneWeight}
                  onChange={(e) => setStoneWeight(e.target.value)}
                />
                <Input
                  label="Hao hụt (%)"
                  type="number"
                  step="0.1"
                  value={lossRate}
                  onChange={(e) => setLossRate(e.target.value)}
                />
              </div>

              <Input
                label="Đơn giá thu mua (VNĐ / Chỉ) *"
                type="number"
                value={unitBuyPrice}
                onChange={(e) => setUnitBuyPrice(e.target.value)}
                required
              />
            </div>

            {/* Payment Method & Cash Alert */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">Phương thức thanh toán tiền</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <WalletRegular className="h-4 w-4" />
                  Tiền mặt tại quỹ
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('TRANSFER')}
                  className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                    paymentMethod === 'TRANSFER'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowRepeatAllRegular className="h-4 w-4" />
                  Chuyển khoản NH
                </button>
              </div>

              {isCashInsufficient && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                  <span className="font-semibold">Cảnh báo thiếu quỹ:</span> Số dư tiền mặt hiện tại chỉ còn{' '}
                  <span className="font-bold">{availableCash.toLocaleString('vi-VN')} đ</span>, không đủ chi trả{' '}
                  <span className="font-bold">{totalAmountCalc.toLocaleString('vi-VN')} đ</span>. Hãy chuyển sang hình thức Chuyển khoản!
                </div>
              )}
            </div>

            <Input
              label="Ghi chú giao dịch"
              placeholder="VD: Dây chuyền đứt, nhẫn trầy xước..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* Total Summary Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Vàng thực sau trừ đá:</span>
                <span className="font-semibold text-slate-800">{netWeightCalc.toFixed(3)} chỉ</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Khối lượng tính tiền (trừ hao {lossNum}%):</span>
                <span className="font-semibold text-slate-800">{pureWeightCalc.toFixed(3)} chỉ</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-slate-800">Tổng thanh toán cho khách:</span>
                <span className="text-xl font-bold text-rose-600">
                  {totalAmountCalc.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              loading={submitting}
              icon={<CheckmarkRegular className="h-5 w-5" />}
            >
              Lập Phiếu Thu Mua & Chi Quỹ
            </Button>
          </form>
        </div>

        {/* Right Table: Buyback Invoices History */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Lịch Sử Thu Mua Vàng Cũ
                </h3>
                <p className="text-xs text-slate-400">
                  Tự động đồng bộ với phiếu chi trong Sổ quỹ tiền mặt
                </p>
              </div>
              <Badge variant="neutral">{history.length} phiếu</Badge>
            </div>

            <DataTable
              columns={columns}
              data={history}
              loading={loading}
              searchPlaceholder="Tìm mã phiếu, khách hàng, số điện thoại..."
              pageSize={8}
              onRowClick={(item) => setSelectedReceipt(item as BuybackItem)}
            />
          </div>
        </div>
      </div>

      {/* Modal: View & Print Buyback Voucher */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Biên Lai Thu Mua Vàng & Nữ Trang Cũ"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">Cam kết giao dịch kim khí quý hợp pháp</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                icon={<ArrowDownloadRegular className="h-4 w-4" />}
                onClick={() => {
                  window.print()
                }}
              >
                In Phiếu Thu Mua
              </Button>
            </div>
          </div>
        }
      >
        {selectedReceipt && (
          <div className="space-y-4 text-sm text-slate-700 p-2">
            <div className="border-b border-dashed border-slate-300 pb-3 text-center">
              <div className="text-lg font-bold text-slate-900">TIỆM VÀNG KIM HOÀNG GMS</div>
              <div className="text-xs text-slate-500">Giấy phép kinh doanh vàng số: 0108892348 - NHNN cấp</div>
              <div className="mt-2 text-sm font-semibold uppercase text-blue-700">
                PHIẾU THU MUA VÀNG & NỮ TRANG CŨ
              </div>
              <div className="text-xs font-mono text-slate-400">
                Mã phiếu: {selectedReceipt.voucherCode || `BM-${selectedReceipt.id}`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Khách hàng: </span>
                <span className="font-semibold text-slate-800">{selectedReceipt.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400">Số điện thoại: </span>
                <span className="font-semibold text-slate-800">{selectedReceipt.customerPhone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400">Số CCCD / CMND: </span>
                <span className="font-semibold text-slate-800">{selectedReceipt.customerIdCard || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400">Hình thức thanh toán: </span>
                <span className="font-semibold text-emerald-600">
                  {selectedReceipt.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản NH'}
                </span>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-2 border-b">Loại vàng</th>
                  <th className="p-2 border-b text-right">Tổng cân</th>
                  <th className="p-2 border-b text-right">Trừ đá</th>
                  <th className="p-2 border-b text-right">TL quy chuẩn</th>
                  <th className="p-2 border-b text-right">Đơn giá</th>
                  <th className="p-2 border-b text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b font-medium">{selectedReceipt.goldType}</td>
                  <td className="p-2 border-b text-right">{Number(selectedReceipt.grossWeight || 0).toFixed(3)}</td>
                  <td className="p-2 border-b text-right">{Number(selectedReceipt.stoneWeight || 0).toFixed(3)}</td>
                  <td className="p-2 border-b text-right font-semibold text-amber-700">
                    {Number(selectedReceipt.pureWeight || selectedReceipt.netWeight || 0).toFixed(3)} chỉ
                  </td>
                  <td className="p-2 border-b text-right">
                    {Number(selectedReceipt.unitBuyPrice || 0).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-2 border-b text-right font-bold text-rose-600">
                    {Number(selectedReceipt.totalAmount || 0).toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-800">Tổng tiền chi trả bằng chữ:</span>
              <span className="italic text-slate-600 text-xs">
                (Đã thanh toán đủ cho khách hàng)
              </span>
            </div>

            <div className="pt-4 grid grid-cols-2 text-center text-xs">
              <div>
                <div className="font-semibold text-slate-800">Khách hàng bàn giao</div>
                <div className="mt-1 text-[11px] text-slate-400">(Ký & ghi rõ họ tên)</div>
                <div className="h-12"></div>
                <div className="font-medium text-slate-600">{selectedReceipt.customerName}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-800">Nhân viên thu ngân & Giám định</div>
                <div className="mt-1 text-[11px] text-slate-400">(Ký & ghi rõ họ tên)</div>
                <div className="h-12"></div>
                <div className="font-medium text-slate-600">Thủ quỹ GMS</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

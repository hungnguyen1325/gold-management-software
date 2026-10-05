import React, { useEffect, useState } from 'react'
import {
  WalletRegular,
  ArrowCircleUpRegular,
  ArrowCircleDownRegular,
  ClockRegular,
  AddRegular,
  CheckmarkRegular,
  ArrowRepeatAllRegular,
  MoneyHandRegular
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

interface CashTransaction {
  id: number
  voucherCode: string
  transactionType: 'RECEIPT' | 'EXPENSE'
  category: string
  amount: number
  paymentMethod: 'CASH' | 'TRANSFER'
  payerOrReceiver: string
  notes?: string
  createdAt: string
  employeeName?: string
}

interface ShiftData {
  id: number
  branchId: number
  shiftName: string
  openedAt: string
  closedAt?: string
  openingCash: number
  closingCashExpected?: number
  closingCashActual?: number
  differenceAmount?: number
  cashReceipts: number
  cashExpenses: number
  transferReceipts: number
  status: 'OPEN' | 'CLOSED'
  notes?: string
}

export default function CashbookPage(): React.JSX.Element {
  const [activeShift, setActiveShift] = useState<ShiftData | null>(null)
  const [transactions, setTransactions] = useState<CashTransaction[]>([])
  const [allShifts, setAllShifts] = useState<ShiftData[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  // Modals
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false)
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form: Create Manual Voucher
  const [voucherType, setVoucherType] = useState<'RECEIPT' | 'EXPENSE'>('RECEIPT')
  const [voucherCategory, setVoucherCategory] = useState('Khác')
  const [voucherAmount, setVoucherAmount] = useState('')
  const [voucherMethod, setVoucherMethod] = useState<'CASH' | 'TRANSFER'>('CASH')
  const [payerReceiver, setPayerReceiver] = useState('')
  const [voucherNotes, setVoucherNotes] = useState('')

  // Form: Close Shift
  const [actualCashCounted, setActualCashCounted] = useState('')
  const [closeNotes, setCloseNotes] = useState('')

  // Form: Open Shift
  const [newShiftName, setNewShiftName] = useState('Ca Sáng')
  const [initialCashAmount, setInitialCashAmount] = useState('20000000')

  const fetchCashbook = async (): Promise<void> => {
    try {
      setLoading(true)
      const [shift, txs, shiftsList] = await Promise.all([
        api.getActiveShift().catch(() => null),
        api.getCashTransactions().catch(() => []),
        api.getAllShifts().catch(() => [])
      ])
      setActiveShift(shift)
      setTransactions(txs || [])
      setAllShifts(shiftsList || [])
    } catch (err: any) {
      setToast({
        id: 'err-cashbook',
        type: 'error',
        title: 'Lỗi tải sổ quỹ',
        message: err.message || 'Không thể đồng bộ dữ liệu dòng tiền'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCashbook()
  }, [])

  // Calculations for Active Shift
  const openingCash = activeShift ? Number(activeShift.openingCash || 0) : 0
  const cashIn = activeShift ? Number(activeShift.cashReceipts || 0) : 0
  const cashOut = activeShift ? Number(activeShift.cashExpenses || 0) : 0
  const expectedCashBalance = openingCash + cashIn - cashOut
  const transferTotal = activeShift ? Number(activeShift.transferReceipts || 0) : 0

  // Discrepancy calculation for close shift
  const actualCountedNum = parseFloat(actualCashCounted) || 0
  const difference = actualCountedNum - expectedCashBalance

  const handleCreateVoucher = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const amt = parseFloat(voucherAmount) || 0
    if (amt <= 0) {
      setToast({ id: 'err-amt', type: 'warning', title: 'Số tiền không hợp lệ', message: 'Vui lòng nhập số tiền lớn hơn 0' })
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        transactionType: voucherType,
        category: voucherCategory,
        amount: amt,
        paymentMethod: voucherMethod,
        payerOrReceiver: payerReceiver.trim() || (voucherType === 'RECEIPT' ? 'Khách nộp tiền' : 'Nhân viên chi'),
        notes: voucherNotes.trim(),
        branchId: 1,
        shiftId: activeShift?.id
      }
      await api.createCashTransaction(payload)
      setToast({
        id: 'succ-vouch',
        type: 'success',
        title: 'Lập phiếu thành công',
        message: `Đã ghi nhận phiếu ${voucherType === 'RECEIPT' ? 'thu' : 'chi'} ${amt.toLocaleString('vi-VN')} đ`
      })
      setIsVoucherModalOpen(false)
      setVoucherAmount('')
      setVoucherNotes('')
      setPayerReceiver('')
      fetchCashbook()
    } catch (err: any) {
      setToast({
        id: 'err-vouch',
        type: 'error',
        title: 'Lỗi ghi nhận phiếu',
        message: err.message || 'Không thể lưu phiếu thu/chi'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseShift = async (): Promise<void> => {
    if (!activeShift) return
    try {
      setSubmitting(true)
      await api.closeShift(activeShift.id, {
        closingCashActual: actualCountedNum,
        notes: closeNotes.trim()
      })
      setToast({
        id: 'succ-close',
        type: 'success',
        title: 'Kết ca thành công',
        message: 'Đã hoàn tất kiểm kê quỹ và khóa ca làm việc!'
      })
      setIsCloseShiftModalOpen(false)
      fetchCashbook()
    } catch (err: any) {
      setToast({
        id: 'err-close',
        type: 'error',
        title: 'Lỗi kết ca',
        message: err.message || 'Không thể khóa ca làm việc'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenShift = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await api.openShift({
        shiftName: newShiftName,
        openingCash: parseFloat(initialCashAmount) || 0,
        branchId: 1
      })
      setToast({
        id: 'succ-open',
        type: 'success',
        title: 'Mở ca thành công',
        message: `Đã kích hoạt ${newShiftName} với số dư đầu ca ${Number(initialCashAmount).toLocaleString('vi-VN')} đ`
      })
      setIsOpenShiftModalOpen(false)
      fetchCashbook()
    } catch (err: any) {
      setToast({
        id: 'err-open',
        type: 'error',
        title: 'Lỗi mở ca',
        message: err.message || 'Không thể mở ca làm việc'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<CashTransaction>[] = [
    {
      key: 'voucherCode',
      header: 'Số phiếu',
      width: '120px',
      render: (t) => (
        <span
          className={`font-mono text-xs font-bold ${
            t.transactionType === 'RECEIPT' ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {t.voucherCode || `PT-${t.id}`}
        </span>
      )
    },
    {
      key: 'transactionType',
      header: 'Loại nghiệp vụ',
      width: '110px',
      render: (t) => (
        <Badge variant={t.transactionType === 'RECEIPT' ? 'success' : 'danger'}>
          {t.transactionType === 'RECEIPT' ? 'Thu tiền (+)' : 'Chi tiền (-)'}
        </Badge>
      )
    },
    {
      key: 'category',
      header: 'Khoản mục & Lý do',
      render: (t) => (
        <div>
          <span className="font-medium text-slate-800">{t.category}</span>
          {t.notes && <div className="text-xs text-slate-400 truncate max-w-xs">{t.notes}</div>}
        </div>
      )
    },
    {
      key: 'payerOrReceiver',
      header: 'Đối tượng giao dịch',
      render: (t) => <span className="text-slate-700">{t.payerOrReceiver || 'N/A'}</span>
    },
    {
      key: 'amount',
      header: 'Số tiền (VNĐ)',
      align: 'right',
      render: (t) => (
        <span
          className={`font-semibold ${
            t.transactionType === 'RECEIPT' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {t.transactionType === 'RECEIPT' ? '+' : '-'}
          {Number(t.amount).toLocaleString('vi-VN')} đ
        </span>
      )
    },
    {
      key: 'paymentMethod',
      header: 'Hình thức',
      align: 'center',
      render: (t) => (
        <Badge variant={t.paymentMethod === 'CASH' ? 'info' : 'gold'}>
          {t.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      width: '150px',
      render: (t) => (
        <span className="text-xs text-slate-400">
          {t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
        </span>
      )
    }
  ]

  return (
    <div className="space-y-6 pb-12">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sổ Quỹ Tiền Mặt & Quản Lý Ca
            </h1>
            {activeShift ? (
              <Badge variant="success" dot>
                {activeShift.shiftName} (Đang mở)
              </Badge>
            ) : (
              <Badge variant="warning">Chưa có ca làm việc mở</Badge>
            )}
            {allShifts.length > 0 && (
              <Badge variant="neutral">Lịch sử: {allShifts.length} ca</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Giám sát dòng tiền thu chi tại quầy, đối soát doanh số bán lẻ, chi mua vàng cũ và bàn giao quỹ ca
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeShift ? (
            <>
              <Button
                variant="outline"
                icon={<ArrowCircleUpRegular className="h-4 w-4 text-emerald-600" />}
                onClick={() => {
                  setVoucherType('RECEIPT')
                  setVoucherCategory('Thu khác')
                  setIsVoucherModalOpen(true)
                }}
              >
                Lập Phiếu Thu
              </Button>
              <Button
                variant="outline"
                icon={<ArrowCircleDownRegular className="h-4 w-4 text-rose-600" />}
                onClick={() => {
                  setVoucherType('EXPENSE')
                  setVoucherCategory('Chi phí vận hành')
                  setIsVoucherModalOpen(true)
                }}
              >
                Lập Phiếu Chi
              </Button>
              <Button
                variant="danger"
                icon={<ClockRegular className="h-4 w-4" />}
                onClick={() => {
                  setActualCashCounted(String(expectedCashBalance))
                  setIsCloseShiftModalOpen(true)
                }}
              >
                Kết Ca & Bàn Giao
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              icon={<AddRegular className="h-4 w-4" />}
              onClick={() => setIsOpenShiftModalOpen(true)}
            >
              Mở Ca Làm Việc Mới
            </Button>
          )}

          <Button
            variant="ghost"
            icon={<ArrowRepeatAllRegular className="h-4 w-4" />}
            onClick={fetchCashbook}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Cash Flow Balance Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Tiền mặt đầu ca"
          value={`${openingCash.toLocaleString('vi-VN')} đ`}
          trend="Số dư bàn giao"
          trendType="neutral"
          icon={<WalletRegular className="h-5 w-5" />}
          colorVariant="blue"
        />
        <StatCard
          title="Tổng thu tiền mặt (+)"
          value={`${cashIn.toLocaleString('vi-VN')} đ`}
          trend="Bán hàng & Phiếu thu"
          trendType="up"
          icon={<ArrowCircleUpRegular className="h-5 w-5" />}
          colorVariant="emerald"
        />
        <StatCard
          title="Tổng chi tiền mặt (-)"
          value={`${cashOut.toLocaleString('vi-VN')} đ`}
          trend="Mua vàng cũ & Chi phí"
          trendType="down"
          icon={<ArrowCircleDownRegular className="h-5 w-5" />}
          colorVariant="rose"
        />
        <StatCard
          title="Tồn quỹ tiền mặt hệ thống"
          value={`${expectedCashBalance.toLocaleString('vi-VN')} đ`}
          trend="Sẵn sàng trong két"
          trendType="up"
          icon={<MoneyHandRegular className="h-5 w-5" />}
          colorVariant="amber"
        />
        <StatCard
          title="Doanh số Chuyển khoản"
          value={`${transferTotal.toLocaleString('vi-VN')} đ`}
          trend="Tiền về tài khoản NH"
          trendType="neutral"
          icon={<ArrowRepeatAllRegular className="h-5 w-5" />}
          colorVariant="purple"
        />
      </div>

      {/* Transactions Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Nhật Ký Giao Dịch Dòng Tiền (Cash Flow)
            </h3>
            <p className="text-xs text-slate-400">
              Tất cả phiếu thu POS, phiếu chi mua vàng cũ và phiếu thu chi thủ công
            </p>
          </div>
          <Badge variant="neutral">{transactions.length} giao dịch</Badge>
        </div>

        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
          searchPlaceholder="Tìm số phiếu, đối tượng, khoản mục..."
          pageSize={10}
        />
      </div>

      {/* Modal: Create Manual Voucher (Receipt / Expense) */}
      <Modal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        title={voucherType === 'RECEIPT' ? 'Lập Phiếu Thu Tiền' : 'Lập Phiếu Chi Tiền'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsVoucherModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant={voucherType === 'RECEIPT' ? 'success' : 'danger'}
              loading={submitting}
              onClick={handleCreateVoucher}
              icon={<CheckmarkRegular className="h-4 w-4" />}
            >
              Lưu Phiếu {voucherType === 'RECEIPT' ? 'Thu' : 'Chi'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateVoucher} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Khoản mục nghiệp vụ *"
              value={voucherCategory}
              onChange={(e) => setVoucherCategory(e.target.value)}
              options={
                voucherType === 'RECEIPT'
                  ? [
                      { value: 'Thu khác', label: 'Thu khác' },
                      { value: 'Nộp tiền quỹ bổ sung', label: 'Nộp tiền quỹ bổ sung' },
                      { value: 'Thu hồi công nợ khách', label: 'Thu hồi công nợ khách' },
                      { value: 'Thu tiền gia công xi mạ', label: 'Thu tiền gia công xi mạ' }
                    ]
                  : [
                      { value: 'Chi phí vận hành', label: 'Chi phí vận hành tiệm' },
                      { value: 'Chi trả tiền thợ gia công', label: 'Chi trả thợ gia công' },
                      { value: 'Nộp tiền về ngân hàng', label: 'Nộp tiền mặt vào NH' },
                      { value: 'Chi tiếp khách & đối ngoại', label: 'Chi tiếp khách' },
                      { value: 'Chi khác', label: 'Chi khác' }
                    ]
              }
            />
            <Select
              label="Phương thức *"
              value={voucherMethod}
              onChange={(e) => setVoucherMethod(e.target.value as any)}
              options={[
                { value: 'CASH', label: 'Tiền mặt tại két' },
                { value: 'TRANSFER', label: 'Chuyển khoản NH' }
              ]}
            />
          </div>

          <Input
            label="Số tiền giao dịch (VNĐ) *"
            type="number"
            placeholder="1000000"
            value={voucherAmount}
            onChange={(e) => setVoucherAmount(e.target.value)}
            required
          />

          <Input
            label={voucherType === 'RECEIPT' ? 'Họ tên người nộp tiền' : 'Họ tên người nhận tiền'}
            placeholder="Nguyễn Văn A"
            value={payerReceiver}
            onChange={(e) => setPayerReceiver(e.target.value)}
          />

          <Input
            label="Diễn giải chi tiết nội dung"
            placeholder="Ghi chú thêm mục đích chi tiêu hoặc nguồn thu..."
            value={voucherNotes}
            onChange={(e) => setVoucherNotes(e.target.value)}
          />
        </form>
      </Modal>

      {/* Modal: Close Shift & Handover */}
      <Modal
        isOpen={isCloseShiftModalOpen}
        onClose={() => setIsCloseShiftModalOpen(false)}
        title="Kết Ca Làm Việc & Bàn Giao Quỹ Tiền Mặt"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCloseShiftModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={submitting}
              onClick={handleCloseShift}
              icon={<CheckmarkRegular className="h-4 w-4" />}
            >
              Xác Nhận Đóng Ca
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Ca hiện tại:</span>
              <span className="font-semibold text-slate-800">{activeShift?.shiftName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tiền mặt đầu ca:</span>
              <span className="font-semibold text-slate-800">{openingCash.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tổng thu tiền mặt trong ca:</span>
              <span className="font-semibold text-emerald-600">+{cashIn.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tổng chi tiền mặt trong ca:</span>
              <span className="font-semibold text-rose-600">-{cashOut.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold">
              <span className="text-slate-900">Số dư hệ thống yêu cầu (Két tiền):</span>
              <span className="text-blue-700">{expectedCashBalance.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <Input
            label="Tiền mặt thực tế kiểm đếm trong két (VNĐ) *"
            type="number"
            value={actualCashCounted}
            onChange={(e) => setActualCashCounted(e.target.value)}
            required
          />

          <div
            className={`rounded-lg p-3 text-sm flex items-center justify-between font-semibold border ${
              difference === 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : difference > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <span>Chênh lệch quỹ:</span>
            <span>
              {difference === 0
                ? 'Khớp chính xác (0 đ)'
                : `${difference > 0 ? 'Thừa' : 'Thiếu'}: ${Math.abs(difference).toLocaleString('vi-VN')} đ`}
            </span>
          </div>

          <Input
            label="Ghi chú bàn giao ca sau"
            placeholder="VD: Đã bàn giao đủ 20 triệu tiền lẻ cho bạn Lan ca chiều..."
            value={closeNotes}
            onChange={(e) => setCloseNotes(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal: Open New Shift */}
      <Modal
        isOpen={isOpenShiftModalOpen}
        onClose={() => setIsOpenShiftModalOpen(false)}
        title="Mở Ca Làm Việc Mới"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpenShiftModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={handleOpenShift}
              icon={<CheckmarkRegular className="h-4 w-4" />}
            >
              Bắt Đầu Ca
            </Button>
          </div>
        }
      >
        <form onSubmit={handleOpenShift} className="space-y-4">
          <Input
            label="Tên ca làm việc *"
            placeholder="Ca Sáng / Ca Chiều / Ca Tối"
            value={newShiftName}
            onChange={(e) => setNewShiftName(e.target.value)}
            required
          />
          <Input
            label="Tiền mặt đầu ca nhận bàn giao (VNĐ) *"
            type="number"
            value={initialCashAmount}
            onChange={(e) => setInitialCashAmount(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  )
}

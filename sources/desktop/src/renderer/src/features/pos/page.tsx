import React, { useEffect, useState } from 'react'
import {
  AddRegular,
  ArrowLeftRegular,
  ReceiptMoneyRegular,
  SearchRegular,
  EyeRegular,
  PrintRegular,
  DeleteRegular,
  ArrowClockwiseRegular,
  MoneyRegular,
  PaymentRegular,
  PersonRegular,
  DocumentTextRegular,
  TagRegular
} from '@fluentui/react-icons'
import { Button, Badge, Modal, Toast, ToastMessage, StatCard } from '../../components/common'
import api from '../../services/api'

interface CartItem {
  product: any
  quantity: number
  unitPrice: number
  laborCost: number
  total: number
}

export default function PosPage(): React.JSX.Element {
  // Sales list state
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'CASH' | 'BANK_TRANSFER'>('ALL')

  // Screen View Mode: 'LIST' = Danh sách hóa đơn (mặc định), 'CREATE' = Trang lập hóa đơn mới
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE'>('LIST')
  const [products, setProducts] = useState<any[]>([])
  const [goldPrices, setGoldPrices] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [searchBarcode, setSearchBarcode] = useState('')
  const [customerName, setCustomerName] = useState('Khách vãng lai')
  const [customerPhone, setCustomerPhone] = useState('')
  const [discountAmount, setDiscountAmount] = useState('0')
  const [paidAmount, setPaidAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Invoice Detail / Print Modal state
  const [viewInvoice, setViewInvoice] = useState<any | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // Notification Toast
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const loadInvoices = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await api.getSales()
      setInvoices(data || [])
    } catch (err: any) {
      setToast({ id: 'err-invoices', type: 'error', title: 'Lỗi tải danh sách hóa đơn', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const loadCatalogData = async (): Promise<void> => {
    try {
      const [prods, prices] = await Promise.all([
        api.getProducts(),
        api.getGoldPrices()
      ])
      setProducts((prods || []).filter((p: any) => p.stockQuantity > 0))
      setGoldPrices(prices || [])
    } catch (err: any) {
      console.error('Failed to load products or prices for POS:', err)
    }
  }

  useEffect(() => {
    loadInvoices()
    loadCatalogData()
  }, [])

  const getGoldPriceRate = (goldType: string): number => {
    const gp = goldPrices.find((p) => p.goldType === goldType)
    return gp ? Number(gp.sellPrice) : 8500000
  }

  const openCreateInvoiceForm = (): void => {
    setCart([])
    setCustomerName('Khách vãng lai')
    setCustomerPhone('')
    setDiscountAmount('0')
    setPaidAmount('')
    setNotes('')
    setPaymentMethod('CASH')
    setSelectedProductId('')
    setSearchBarcode('')
    loadCatalogData()
    setViewMode('CREATE')
  }

  const addToCartByProduct = (product: any): void => {
    if (!product) return
    if (product.stockQuantity <= 0) {
      setToast({ id: 'out-stock', type: 'warning', title: 'Hết hàng', message: 'Sản phẩm đã hết hàng trong kho' })
      return
    }

    const rate = getGoldPriceRate(product.goldType)
    const goldVal = Number(product.pureGoldWeight) * rate
    const singlePrice = goldVal + Number(product.laborCost)

    const existingIndex = cart.findIndex((item) => item.product.id === product.id)
    if (existingIndex >= 0) {
      const current = cart[existingIndex]
      if (current.quantity + 1 > product.stockQuantity) {
        setToast({ id: 'max-stock', type: 'warning', title: 'Giới hạn tồn kho', message: `Kho chỉ còn ${product.stockQuantity} sản phẩm` })
        return
      }
      const updated = [...cart]
      updated[existingIndex] = {
        ...current,
        quantity: current.quantity + 1,
        total: (current.quantity + 1) * singlePrice
      }
      setCart(updated)
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          unitPrice: singlePrice,
          laborCost: Number(product.laborCost),
          total: singlePrice
        }
      ])
    }
  }

  const handleBarcodeSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!searchBarcode.trim()) return

    const match = products.find(
      (p) => p.tagCode.toLowerCase() === searchBarcode.trim().toLowerCase()
    )
    if (match) {
      addToCartByProduct(match)
      setSearchBarcode('')
    } else {
      setToast({ id: 'barcode-not-found', type: 'error', title: 'Không tìm thấy', message: `Không tìm thấy mã tem "${searchBarcode}" trong kho` })
    }
  }

  const updateQuantity = (index: number, delta: number): void => {
    const item = cart[index]
    const newQty = item.quantity + delta
    if (newQty <= 0) {
      removeFromCart(index)
      return
    }
    if (newQty > item.product.stockQuantity) {
      setToast({ id: 'qty-exceed', type: 'warning', title: 'Vượt tồn kho', message: `Chỉ còn ${item.product.stockQuantity} sản phẩm trong kho` })
      return
    }
    const updated = [...cart]
    updated[index] = {
      ...item,
      quantity: newQty,
      total: newQty * item.unitPrice
    }
    setCart(updated)
  }

  const removeFromCart = (index: number): void => {
    setCart(cart.filter((_, idx) => idx !== index))
  }

  // Calculations in Create View
  const subTotal = cart.reduce((sum, item) => sum + item.total, 0)
  const cartTotalWeight = cart.reduce(
    (sum, item) => sum + (Number(item.product?.totalWeight) || 0) * item.quantity,
    0
  )
  const cartStoneWeight = cart.reduce(
    (sum, item) => sum + (Number(item.product?.stoneWeight) || 0) * item.quantity,
    0
  )
  const cartPureGoldWeight = cart.reduce(
    (sum, item) => sum + (Number(item.product?.pureGoldWeight) || 0) * item.quantity,
    0
  )
  const discount = Math.min(subTotal, Number(discountAmount) || 0)
  const totalAmount = Math.max(0, subTotal - discount)
  const paid = paidAmount === '' ? totalAmount : Number(paidAmount) || 0
  const changeAmount = Math.max(0, paid - totalAmount)

  const handleCheckoutSubmit = async (): Promise<void> => {
    if (cart.length === 0) {
      setToast({ id: 'empty-cart', type: 'warning', title: 'Chưa có sản phẩm', message: 'Vui lòng thêm ít nhất 1 món vào hóa đơn' })
      return
    }
    if (paid < totalAmount) {
      setToast({ id: 'insufficient-paid', type: 'error', title: 'Thanh toán thiếu', message: 'Số tiền thanh toán phải bằng hoặc lớn hơn tổng tiền hóa đơn' })
      return
    }

    try {
      setIsSubmitting(true)
      const res = await api.createSale({
        customerName: customerName.trim() || 'Khách vãng lai',
        customerPhone: customerPhone.trim(),
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        discountAmount: discount,
        paidAmount: paid,
        paymentMethod,
        notes: notes.trim()
      })

      setToast({ id: 'checkout-ok', type: 'success', title: 'Xuất hóa đơn thành công', message: `Hóa đơn ${res.invoiceCode} đã được lập` })
      setViewMode('LIST')
      loadInvoices()
      // Open detail & print preview
      setViewInvoice(res)
      setDetailModalOpen(true)
    } catch (err: any) {
      setToast({ id: 'checkout-err', type: 'error', title: 'Lỗi lập hóa đơn', message: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (val: number | string): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0)
  }

  // Vietnamese jewelry weight standard: 1 lượng = 10 chỉ = 37.5g (1 chỉ = 3.75g = 10 phân = 100 ly)
  const formatGoldWeight = (chi: number | string | undefined | null): string => {
    if (chi === undefined || chi === null || isNaN(Number(chi))) return '0.0000 chỉ'
    const val = Number(chi)
    const grams = (val * 3.75).toFixed(2)
    return `${val.toFixed(4)} chỉ (${grams}g)`
  }

  const formatWeightChiOnly = (chi: number | string | undefined | null): string => {
    if (chi === undefined || chi === null || isNaN(Number(chi))) return '0.0000 chỉ'
    return `${Number(chi).toFixed(4)} chỉ`
  }

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      (inv.invoiceCode || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (inv.customerName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (inv.customerPhone || '').toLowerCase().includes(searchKeyword.toLowerCase())

    const matchMethod =
      paymentFilter === 'ALL' || inv.paymentMethod === paymentFilter

    return matchSearch && matchMethod
  })

  // Summary Metrics
  const totalRevenue = invoices.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0)
  const cashRevenue = invoices
    .filter((i) => i.paymentMethod === 'CASH')
    .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0)
  const bankRevenue = invoices
    .filter((i) => i.paymentMethod === 'BANK_TRANSFER')
    .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0)

  // =========================================================================
  // VIEW MODE: CREATE (TRANG LẬP HÓA ĐƠN MỚI - THAY THẾ TOÀN BỘ MAIN PAGE)
  // =========================================================================
  if (viewMode === 'CREATE') {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Top Header / Breadcrumb / Actions */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800"
              title="Quay lại danh sách hóa đơn"
            >
              <ArrowLeftRegular className="text-xl" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-800">
                  Lập Hóa Đơn Bán Hàng Mới
                </h1>
                <Badge variant="gold" size="sm">Giao dịch quầy thu ngân</Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Nhập thông tin khách hàng, quét mã tem kim hoàn và hoàn tất thanh toán xuất phiếu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => setViewMode('LIST')}
              disabled={isSubmitting}
            >
              Hủy Bỏ / Quay Lại
            </Button>
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={handleCheckoutSubmit}
              disabled={isSubmitting || cart.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400"
            >
              {isSubmitting ? (
                <>
                  <ArrowClockwiseRegular className="animate-spin text-base" />
                  <span>Đang xử lý xuất đơn...</span>
                </>
              ) : (
                <>
                  <ReceiptMoneyRegular className="text-lg" />
                  <span>Xác Nhận & Xuất Hóa Đơn ({formatCurrency(totalAmount)})</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Grid: Left (Products & Cart - 8 cols), Right (Calculations & Payment - 4 cols) */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
          {/* Left Column (8 cols) */}
          <div className="flex flex-col gap-6 xl:col-span-8 min-w-0">
            {/* Box 1: Thông tin khách hàng */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs overflow-hidden">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <PersonRegular className="text-base text-amber-600" />
                Thông Tin Khách Hàng Mua Hàng
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className="mb-1.5 block text-2xs font-semibold text-slate-600">
                    Tên Khách Hàng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Khách vãng lai"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div className="min-w-0">
                  <label className="mb-1.5 block text-2xs font-semibold text-slate-600">
                    Số Điện Thoại Liên Hệ
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Quét mã tem barcode & Chọn từ kho */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs overflow-hidden">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <TagRegular className="text-base text-amber-600" />
                Thêm Sản Phẩm Kim Hoàn Vào Đơn Hàng
              </h2>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-end">
                {/* Barcode scanner */}
                <div className="lg:col-span-5 min-w-0">
                  <label className="mb-1.5 block text-2xs font-semibold text-slate-600">
                    Quét Mã Tem / Barcode (Nhấn Enter để thêm)
                  </label>
                  <form onSubmit={handleBarcodeSubmit} className="flex gap-2 min-w-0">
                    <div className="relative flex-1 min-w-0">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <SearchRegular className="text-base" />
                      </span>
                      <input
                        type="text"
                        value={searchBarcode}
                        onChange={(e) => setSearchBarcode(e.target.value)}
                        placeholder="Nhập mã tem (VD: V24K-N01)..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-4 pl-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-100"
                      />
                    </div>
                    <Button variant="outline" size="md" type="submit" className="shrink-0 font-medium">
                      Quét mã
                    </Button>
                  </form>
                </div>

                {/* Dropdown select */}
                <div className="lg:col-span-7 min-w-0">
                  <label className="mb-1.5 block text-2xs font-semibold text-slate-600">
                    Hoặc Chọn Nhanh Từ Danh Mục Kho ({products.length} mặt hàng)
                  </label>
                  <div className="flex gap-2 min-w-0 items-center">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="flex-1 min-w-0 w-0 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-700 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-100 truncate"
                    >
                      <option value="">-- Chọn món trang sức trong kho --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.tagCode}] {p.name} ({p.goldType}) - TL: {Number(p.totalWeight).toFixed(4)} chỉ (Tồn: {p.stockQuantity})
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="primary"
                      size="md"
                      type="button"
                      onClick={() => {
                        const match = products.find((p) => p.id === Number(selectedProductId))
                        if (match) {
                          addToCartByProduct(match)
                          setSelectedProductId('')
                        }
                      }}
                      disabled={!selectedProductId}
                      className="shrink-0 bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 px-3.5 whitespace-nowrap shadow-xs"
                    >
                      <AddRegular className="text-base mr-1" />
                      Thêm món
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: Bảng danh sách món hàng trong đơn */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                <div className="flex items-center gap-2">
                  <ReceiptMoneyRegular className="text-base text-amber-600" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Danh Sách Món Đang Chọn ({cart.length} món)
                  </h2>
                </div>
                <span className="text-2xs text-slate-400 font-mono">
                  Tổng SL: {cart.reduce((s, i) => s + i.quantity, 0)} chiếc/món
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3 border border-amber-200">
                    <TagRegular className="text-2xl" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">Đơn hàng chưa có món nào</h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-400">
                    Vui lòng quét mã barcode hoặc chọn sản phẩm từ kho ở trên để thêm vào hóa đơn bán hàng.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-100/75 text-2xs font-bold uppercase tracking-wider text-slate-600">
                      <tr>
                        <th className="py-3 px-4 text-center">STT</th>
                        <th className="py-3 px-4">Tên Món / Mã Tem</th>
                        <th className="py-3 px-4 text-center">Loại Vàng</th>
                        <th className="py-3 px-4 text-center">Trọng Lượng (Chỉ)</th>
                        <th className="py-3 px-4 text-right">Đơn Giá Vàng</th>
                        <th className="py-3 px-4 text-right">Tiền Công</th>
                        <th className="py-3 px-4 text-center">Số Lượng</th>
                        <th className="py-3 px-4 text-right">Thành Tiền</th>
                        <th className="py-3 px-4 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cart.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-2xs">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800 text-xs">{item.product.name}</div>
                            <div className="text-2xs text-amber-700 font-mono mt-0.5">
                              Mã tem: {item.product.tagCode}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Badge variant="gold" size="sm">{item.product.goldType}</Badge>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="font-bold text-amber-800 font-mono text-xs">
                              {formatWeightChiOnly(item.product.pureGoldWeight)}
                            </div>
                            <div className="text-2xs text-slate-400">
                              Tổng: {formatWeightChiOnly(item.product.totalWeight)}
                              {Number(item.product.stoneWeight) > 0 && ` | Hột: ${formatWeightChiOnly(item.product.stoneWeight)}`}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-600 font-mono">
                            {formatCurrency(getGoldPriceRate(item.product.goldType))}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-600 font-mono">
                            {formatCurrency(item.laborCost)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(idx, -1)}
                                className="h-5 w-5 text-slate-500 hover:text-slate-900 font-black text-sm"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-bold text-slate-800 font-mono">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(idx, 1)}
                                className="h-5 w-5 text-slate-500 hover:text-slate-900 font-black text-sm"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono text-xs">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => removeFromCart(idx)}
                              title="Xóa món này khỏi đơn"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            >
                              <DeleteRegular className="text-base" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Calculations & Checkout */}
          <div className="flex flex-col gap-6 xl:col-span-4 min-w-0">
            {/* Box 1: Tổng Kết Trọng Lượng Kim Hoàn */}
            <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/80 to-amber-50/40 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <TagRegular className="text-base text-amber-600" />
                  Tổng Khối Lượng Kim Hoàn
                </span>
                <span className="font-mono font-bold text-xs text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                  {cart.reduce((s, i) => s + i.quantity, 0)} món
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tổng TL món (cả đá/hột):</span>
                  <strong className="font-mono text-slate-900">{formatGoldWeight(cartTotalWeight)}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Trọng lượng đá / hột:</span>
                  <span className="font-mono text-slate-700">{formatGoldWeight(cartStoneWeight)}</span>
                </div>
                <div className="flex justify-between text-amber-950 font-bold border-t border-amber-200/60 pt-2.5">
                  <span>Tổng TL vàng thực tế:</span>
                  <span className="font-mono text-amber-800 text-sm font-black">
                    {formatGoldWeight(cartPureGoldWeight)}
                  </span>
                </div>
              </div>
              <p className="text-2xs text-amber-800/80 italic pt-1 border-t border-dashed border-amber-200/70">
                * Quy chuẩn: 1 lượng = 10 chỉ = 37.50 gram (1 chỉ = 3.75g = 10 phân).
              </p>
            </div>

            {/* Box 2: Chi tiết thanh toán */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ReceiptMoneyRegular className="text-base text-amber-600" />
                Tổng Kết Thanh Toán
              </h2>

              {/* Subtotal */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Tiền hàng (Tạm tính):</span>
                <span className="font-semibold text-slate-800 font-mono">{formatCurrency(subTotal)}</span>
              </div>

              {/* Discount */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-500">Giảm giá tiền công / khuyến mãi:</span>
                  <span className="font-semibold text-emerald-600 font-mono">-{formatCurrency(discount)}</span>
                </div>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-right font-mono text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-100"
                />
              </div>

              {/* Grand Total Big Display */}
              <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 p-4 text-center text-slate-950 shadow-md shadow-amber-500/20">
                <span className="block text-2xs font-extrabold uppercase tracking-wider text-amber-950/80 mb-0.5">
                  Tổng Tiền Cần Thanh Toán
                </span>
                <span className="text-2xl font-black font-mono">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-2xs font-bold uppercase text-slate-600 mb-2">
                  Hình Thức Thanh Toán
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition-all ${
                      paymentMethod === 'CASH'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MoneyRegular className="text-lg" />
                    <span>Tiền Mặt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition-all ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-200 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PaymentRegular className="text-lg" />
                    <span>Chuyển Khoản QR</span>
                  </button>
                </div>
              </div>

              {/* Paid & Change */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700">Tiền Khách Đưa (VNĐ):</label>
                  <button
                    type="button"
                    onClick={() => setPaidAmount(String(totalAmount))}
                    className="text-2xs font-bold text-amber-700 hover:underline"
                  >
                    Khách đưa đủ
                  </button>
                </div>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder={String(totalAmount)}
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-right font-mono text-xs font-bold text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-100"
                />

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-500">Tiền thừa trả lại:</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-2xs font-semibold text-slate-500 mb-1">
                  Ghi Chú Đơn Hàng
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú thêm về yêu cầu của khách..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-100"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  type="button"
                  onClick={handleCheckoutSubmit}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full justify-center bg-gradient-to-r from-amber-500 to-yellow-500 font-bold text-slate-950 shadow-md shadow-amber-500/25 hover:from-amber-400 hover:to-yellow-400 text-sm py-3"
                >
                  {isSubmitting ? 'ĐANG XỬ LÝ XUẤT HÓA ĐƠN...' : 'XÁC NHẬN & XUẤT HÓA ĐƠN'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => setViewMode('LIST')}
                  disabled={isSubmitting}
                  className="w-full justify-center"
                >
                  Hủy Bỏ / Quay Lại Danh Sách
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW MODE: LIST (MÀN HÌNH CHÍNH QUẢN LÝ DANH SÁCH HÓA ĐƠN BÁN HÀNG)
  // =========================================================================
  return (
    <div className="flex flex-col gap-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header with Action Button */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <ReceiptMoneyRegular className="text-2xl text-amber-600" />
            Quản Lý Bán Hàng & Hóa Đơn
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Theo dõi danh sách hóa đơn bán lẻ, quản lý giao dịch thu tiền và phát hành hóa đơn mới.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateInvoiceForm}
          className="flex items-center gap-2 shadow-md shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-400"
        >
          <AddRegular className="text-lg" />
          <span>+ Lập Hóa Đơn Mới</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng Doanh Thu Bán Hàng"
          value={formatCurrency(totalRevenue)}
          subtitle="Tích lũy từ tất cả hóa đơn"
          icon={<MoneyRegular className="text-amber-600" />}
        />
        <StatCard
          title="Tổng Số Hóa Đơn"
          value={`${invoices.length} đơn`}
          subtitle="Giao dịch bán lẻ đã hoàn tất"
          icon={<DocumentTextRegular className="text-blue-600" />}
        />
        <StatCard
          title="Doanh Thu Tiền Mặt (Cash)"
          value={formatCurrency(cashRevenue)}
          subtitle="Thực thu vào két ca"
          icon={<MoneyRegular className="text-emerald-600" />}
        />
        <StatCard
          title="Doanh Thu Chuyển Khoản"
          value={formatCurrency(bankRevenue)}
          subtitle="Thanh toán qua QR / Ngân hàng"
          icon={<PaymentRegular className="text-indigo-600" />}
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <SearchRegular className="text-base" />
          </span>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo mã HĐ, tên khách hàng, số điện thoại..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 py-2 pr-4 pl-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium text-slate-500">Hình thức:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-amber-500 focus:outline-hidden"
            >
              <option value="ALL">Tất cả phương thức</option>
              <option value="CASH">Tiền mặt</option>
              <option value="BANK_TRANSFER">Chuyển khoản</option>
            </select>
          </div>

          <button
            onClick={loadInvoices}
            title="Làm mới dữ liệu"
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowClockwiseRegular className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Invoices DataTable */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-5 py-3.5 bg-slate-50/60 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Danh Sách Hóa Đơn Đã Xuất ({filteredInvoices.length} giao dịch)
          </h2>
          <span className="text-2xs text-slate-400">Dữ liệu thời gian thực từ máy chủ</span>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3 border border-amber-200">
              <ReceiptMoneyRegular className="text-3xl" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Chưa có hóa đơn bán hàng nào</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              {searchKeyword
                ? 'Không tìm thấy hóa đơn nào khớp với từ khóa tìm kiếm.'
                : 'Nhấn vào nút bên dưới để tạo và phát hành hóa đơn bán hàng mới đầu tiên.'}
            </p>
            {!searchKeyword && (
              <Button
                variant="primary"
                size="sm"
                onClick={openCreateInvoiceForm}
                className="mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold"
              >
                + Lập Hóa Đơn Mới
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-100/75 text-2xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">Mã Hóa Đơn</th>
                  <th className="py-3 px-4">Ngày Giờ</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4 text-center">Số Món</th>
                  <th className="py-3 px-4 text-right">Tổng Tiền</th>
                  <th className="py-3 px-4 text-center">Thanh Toán</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-amber-700">{inv.invoiceCode}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{inv.customerName || 'Khách vãng lai'}</div>
                      {inv.customerPhone && (
                        <div className="text-2xs text-slate-400 font-mono">{inv.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                      {inv.items?.length || 1} món
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-slate-900 text-xs">
                        {formatCurrency(inv.totalAmount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={inv.paymentMethod === 'CASH' ? 'success' : 'info'} size="sm">
                        {inv.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="success" size="sm">
                        {inv.status === 'COMPLETED' ? 'Đã Thanh Toán' : inv.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setViewInvoice(inv)
                            setDetailModalOpen(true)
                          }}
                          title="Xem chi tiết hóa đơn"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                        >
                          <EyeRegular className="text-sm" />
                        </button>
                        <button
                          onClick={() => {
                            setViewInvoice(inv)
                            setDetailModalOpen(true)
                          }}
                          title="In hóa đơn"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                        >
                          <PrintRegular className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 2: CHI TIẾT & IN HÓA ĐƠN BÁN HÀNG */}
      {/* ========================================================================= */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Chi Tiết Hóa Đơn Bán Hàng"
        subtitle={`Số hóa đơn: ${viewInvoice?.invoiceCode || ''}`}
        size="2xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold"
            >
              <PrintRegular className="text-base" />
              <span>In Hóa Đơn (Print)</span>
            </Button>
          </div>
        }
      >
        {viewInvoice && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs text-slate-800">
            {/* Header info */}
            <div className="text-center border-b border-slate-200 pb-4 mb-4">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                HÓA ĐƠN BÁN LẺ KIM HOÀN
              </h2>
              <p className="text-2xs text-slate-500 mt-0.5">TẬP ĐOÀN VÀNG BẠC ĐÁ QUÝ GMS - NHÓM 04</p>
              <p className="text-2xs text-slate-400">Địa chỉ: 138 Cầu Giấy, Hà Nội • Hotline: 024 3888 9999</p>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-400">Số HĐ: </span>
                <strong className="font-mono text-amber-800">{viewInvoice.invoiceCode}</strong>
              </div>
              <div>
                <span className="text-slate-400">Ngày lập: </span>
                <span>{formatDate(viewInvoice.createdAt)}</span>
              </div>
              <div>
                <span className="text-slate-400">Khách hàng: </span>
                <strong>{viewInvoice.customerName || 'Khách vãng lai'}</strong>
              </div>
              <div>
                <span className="text-slate-400">Số điện thoại: </span>
                <span className="font-mono">{viewInvoice.customerPhone || 'Không có'}</span>
              </div>
            </div>

            {/* Items table */}
            <table className="w-full text-xs mb-4 border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-2xs uppercase font-bold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 text-left">Sản phẩm</th>
                  <th className="py-2 px-3 text-center">SL</th>
                  <th className="py-2 px-3 text-right">Đơn giá</th>
                  <th className="py-2 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(viewInvoice.items || []).map((it: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-800">{it.productName || it.tagCode}</div>
                      <div className="text-2xs text-slate-400">{it.goldType} • Tem: {it.tagCode}</div>
                    </td>
                    <td className="py-2 px-3 text-center font-bold">{it.quantity}</td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {formatCurrency(it.itemTotal ? it.itemTotal / it.quantity : 0)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(it.itemTotal || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="space-y-1.5 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính tiền hàng:</span>
                <span>{formatCurrency(viewInvoice.subTotal || viewInvoice.totalAmount)}</span>
              </div>
              {Number(viewInvoice.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá tiền công:</span>
                  <span>-{formatCurrency(viewInvoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                <span>Tổng tiền thanh toán:</span>
                <span className="text-amber-700">{formatCurrency(viewInvoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>Hình thức thanh toán:</span>
                <span className="font-medium text-slate-800">
                  {viewInvoice.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tiền khách thanh toán:</span>
                <span>{formatCurrency(viewInvoice.paidAmount || viewInvoice.totalAmount)}</span>
              </div>
              {Number(viewInvoice.changeAmount) > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>Tiền thừa trả khách:</span>
                  <span>{formatCurrency(viewInvoice.changeAmount)}</span>
                </div>
              )}
            </div>

            <div className="text-center text-2xs text-slate-400 mt-6 border-t border-dashed border-slate-200 pt-3">
              Cảm ơn quý khách đã tin tưởng và giao dịch tại GMS Jewelry!
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

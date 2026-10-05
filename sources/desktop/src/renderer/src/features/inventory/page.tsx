import React, { useEffect, useState } from 'react'
import {
  AddRegular,
  ArrowDownloadRegular,
  BoxRegular,
  WarningRegular,
  CheckmarkRegular,
  DeleteRegular
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

export default function InventoryPage(): React.JSX.Element {
  const [products, setProducts] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Form state
  const [formTagCode, setFormTagCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('Nhẫn')
  const [formGoldType, setFormGoldType] = useState('24K')
  const [formTotalWeight, setFormTotalWeight] = useState('')
  const [formStoneWeight, setFormStoneWeight] = useState('0')
  const [formLaborCost, setFormLaborCost] = useState('150000')
  const [formLocation, setFormLocation] = useState('Tủ 01')
  const [formQuantity, setFormQuantity] = useState('5')

  const fetchInventory = async (): Promise<void> => {
    try {
      setLoading(true)
      const [prods, sum] = await Promise.all([
        api.getProducts(),
        api.getWarehouseSummary()
      ])
      setProducts(prods)
      setSummary(sum)
    } catch (err: any) {
      setToast({ id: 'err', type: 'error', title: 'Lỗi tải kho hàng', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleOpenAddModal = (): void => {
    const randomCode = 'TAG-' + Math.floor(100000 + Math.random() * 900000)
    setFormTagCode(randomCode)
    setFormName('')
    setFormCategory('Nhẫn')
    setFormGoldType('24K')
    setFormTotalWeight('')
    setFormStoneWeight('0')
    setFormLaborCost('150000')
    setFormLocation('Tủ 01')
    setFormQuantity('5')
    setErrorMsg('')
    setModalOpen(true)
  }

  const handleSaveProduct = async (): Promise<void> => {
    const totalW = Number(formTotalWeight)
    const stoneW = Number(formStoneWeight) || 0
    const labor = Number(formLaborCost) || 0
    const qty = Number(formQuantity)

    if (!formTagCode.trim()) {
      setErrorMsg('Vui lòng nhập mã tem định danh duy nhất')
      return
    }
    if (!formName.trim()) {
      setErrorMsg('Vui lòng nhập tên sản phẩm')
      return
    }
    if (isNaN(totalW) || totalW <= 0) {
      setErrorMsg('Trọng lượng tổng phải là số dương hợp lệ')
      return
    }
    if (stoneW > totalW) {
      setErrorMsg('Lỗi: Trọng lượng đá không được lớn hơn tổng trọng lượng sản phẩm!')
      return
    }
    if (isNaN(qty) || qty < 0) {
      setErrorMsg('Số lượng tồn không được nhỏ hơn 0')
      return
    }

    try {
      await api.createProduct({
        tagCode: formTagCode.trim(),
        name: formName.trim(),
        category: formCategory,
        goldType: formGoldType,
        totalWeight: totalW,
        stoneWeight: stoneW,
        laborCost: labor,
        locationCabinet: formLocation,
        stockQuantity: qty,
        lowStockThreshold: 3
      })
      setModalOpen(false)
      fetchInventory()
      setToast({ id: 'add', type: 'success', title: 'Nhập kho thành công', message: `Sản phẩm ${formName} (${formTagCode}) đã được lưu` })
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi nhập kho sản phẩm')
    }
  }

  const handleDelete = async (id: number, name: string): Promise<void> => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${name}?`)) return
    try {
      await api.deleteProduct(id)
      fetchInventory()
      setToast({ id: 'del', type: 'success', title: 'Đã xóa', message: 'Sản phẩm đã được xóa khỏi kho' })
    } catch (err: any) {
      setToast({ id: 'del-err', type: 'error', title: 'Lỗi', message: err.message })
    }
  }

  const handleExportExcel = (): void => {
    window.open('http://localhost:8080/api/products', '_blank')
    setToast({ id: 'exp', type: 'info', title: 'Xuất dữ liệu', message: 'Dữ liệu kho hàng đã được trích xuất' })
  }

  const formatCurrency = (val: number | string): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0)
  }

  const columns: Column<any>[] = [
    {
      key: 'tagCode',
      header: 'Mã Tem',
      render: (item) => <span className="font-mono font-bold text-amber-700">{item.tagCode}</span>
    },
    {
      key: 'name',
      header: 'Tên Sản Phẩm',
      render: (item) => (
        <div>
          <p className="font-semibold text-slate-800">{item.name}</p>
          <span className="text-2xs text-slate-400">{item.category}</span>
        </div>
      )
    },
    {
      key: 'goldType',
      header: 'Loại Vàng',
      render: (item) => <Badge variant="gold" size="sm">{item.goldType}</Badge>
    },
    {
      key: 'totalWeight',
      header: 'Tổng TL',
      align: 'right',
      render: (item) => <span>{Number(item.totalWeight).toFixed(3)} chỉ</span>
    },
    {
      key: 'pureGoldWeight',
      header: 'Vàng Ròng',
      align: 'right',
      render: (item) => <span className="font-semibold text-slate-900">{Number(item.pureGoldWeight).toFixed(3)} chỉ</span>
    },
    {
      key: 'laborCost',
      header: 'Tiền Công',
      align: 'right',
      render: (item) => <span>{formatCurrency(item.laborCost)}</span>
    },
    {
      key: 'locationCabinet',
      header: 'Vị Trí',
      render: (item) => <Badge variant="neutral" size="sm">{item.locationCabinet || 'Tủ 01'}</Badge>
    },
    {
      key: 'stockQuantity',
      header: 'Tồn Kho',
      align: 'center',
      render: (item) => (
        <span
          className={`font-bold ${
            item.stockQuantity <= 3 ? 'text-rose-600' : 'text-slate-800'
          }`}
        >
          {item.stockQuantity}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      align: 'center',
      render: (item) => {
        if (item.stockQuantity === 0) {
          return <Badge variant="danger" dot size="sm">Hết hàng</Badge>
        }
        if (item.stockQuantity <= 3) {
          return <Badge variant="warning" dot size="sm">Sắp hết</Badge>
        }
        return <Badge variant="success" dot size="sm">Còn hàng</Badge>
      }
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      align: 'center',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDelete(item.id, item.name)
          }}
          className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
          title="Xóa sản phẩm"
        >
          <DeleteRegular className="text-base" />
        </button>
      )
    }
  ]

  // Calculated pure gold preview
  const previewPure = Math.max(0, (Number(formTotalWeight) || 0) - (Number(formStoneWeight) || 0))

  return (
    <div className="flex flex-col gap-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Quản Lý Kho Hàng & Danh Mục Sản Phẩm
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Theo dõi số lượng tồn, trọng lượng vàng ròng, tiền công chế tác và vị trí trưng bày theo từng tủ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowDownloadRegular />}
            onClick={handleExportExcel}
          >
            Xuất Excel
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<AddRegular />}
            onClick={handleOpenAddModal}
          >
            Nhập kho mới
          </Button>
        </div>
      </div>

      {/* Warehouse Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng Lượng Vàng Kho"
          value={`${Number(summary?.totalPureGoldWeight || 0).toFixed(2)} chỉ`}
          subtitle="Trọng lượng vàng ròng thực tế"
          icon={<BoxRegular className="text-xl" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Tổng Số Món Nữ Trang"
          value={`${summary?.totalJewelryPieces || 0} món`}
          subtitle="Đang trưng bày & lưu két"
          icon={<BoxRegular className="text-xl" />}
          iconBgColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Số Lượng Mẫu Hàng"
          value={`${summary?.totalDesigns || 0} mẫu`}
          subtitle="Mẫu thiết kế trang sức"
          icon={<BoxRegular className="text-xl" />}
          iconBgColor="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Cảnh Báo Sắp Hết"
          value={`${summary?.lowStockCount || 0} mặt hàng`}
          subtitle="Ngưỡng cảnh báo <= 3 món"
          icon={<WarningRegular className="text-xl" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Product List Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <DataTable
          columns={columns}
          data={products}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Tìm kiếm theo mã tem, tên sản phẩm, loại vàng..."
          searchFields={['tagCode', 'name', 'goldType', 'locationCabinet']}
          emptyMessage="Không có hàng hóa nào trong kho"
          isLoading={loading}
          pageSize={10}
        />
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nhập kho sản phẩm mới"
        subtitle="Hệ thống tự động tính vàng ròng = Tổng trọng lượng - Trọng lượng đá"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" leftIcon={<CheckmarkRegular />} onClick={handleSaveProduct}>
              Xác nhận nhập kho
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {errorMsg && (
            <div className="col-span-full rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-200">
              {errorMsg}
            </div>
          )}

          <Input
            label="Mã Tem Định Danh (Tag Code)"
            value={formTagCode}
            onChange={(e) => setFormTagCode(e.target.value)}
            placeholder="Ví dụ: V24K-N03"
            required
          />

          <Input
            label="Tên Sản Phẩm"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Ví dụ: Kiềng hoa mai 24K"
            required
          />

          <Select
            label="Nhóm Hàng"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
            options={[
              { value: 'Nhẫn', label: 'Nhẫn cưới / Nhẫn nữ' },
              { value: 'Dây chuyền', label: 'Dây chuyền' },
              { value: 'Lắc tay', label: 'Lắc tay / Vòng tay' },
              { value: 'Bông tai', label: 'Bông tai / Khuyên tai' },
              { value: 'Kiềng', label: 'Kiềng cưới' },
              { value: 'Vàng miếng', label: 'Vàng miếng tích trữ' }
            ]}
          />

          <Select
            label="Loại Vàng"
            value={formGoldType}
            onChange={(e) => setFormGoldType(e.target.value)}
            options={[
              { value: '24K', label: '24K (99.99%)' },
              { value: '9999', label: '9999 SJC (99.99%)' },
              { value: '18K', label: '18K Ý (75.00%)' },
              { value: '14K', label: '14K (58.30%)' },
              { value: '10K', label: '10K (41.60%)' }
            ]}
          />

          <Input
            label="Tổng Trọng Lượng (chỉ)"
            type="number"
            step="0.001"
            value={formTotalWeight}
            onChange={(e) => setFormTotalWeight(e.target.value)}
            placeholder="Ví dụ: 2.500"
            required
          />

          <Input
            label="Trọng Lượng Đá (chỉ)"
            type="number"
            step="0.001"
            value={formStoneWeight}
            onChange={(e) => setFormStoneWeight(e.target.value)}
            placeholder="Ví dụ: 0.200"
          />

          <div className="col-span-full rounded-lg bg-amber-50/80 p-3 border border-amber-200 text-xs">
            <span className="font-semibold text-amber-900">Trọng lượng vàng ròng tính toán: </span>
            <strong className="text-amber-700 text-sm">{previewPure.toFixed(3)} chỉ</strong>
          </div>

          <Input
            label="Tiền Công Chế Tác (VNĐ)"
            type="number"
            value={formLaborCost}
            onChange={(e) => setFormLaborCost(e.target.value)}
            placeholder="Ví dụ: 250000"
            required
          />

          <Select
            label="Vị Trí Lưu Trữ"
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value)}
            options={[
              { value: 'Tủ 01', label: 'Tủ 01 - Nhẫn & Nữ trang nhỏ' },
              { value: 'Tủ 02', label: 'Tủ 02 - Dây chuyền & Lắc tay' },
              { value: 'Tủ 03', label: 'Tủ 03 - Trang sức cưới' },
              { value: 'Tủ 04', label: 'Tủ 04 - Kim cương & Đá quý' },
              { value: 'Két sắt', label: 'Két sắt bảo hiểm trung tâm' }
            ]}
          />

          <Input
            label="Số Lượng Nhập (món)"
            type="number"
            value={formQuantity}
            onChange={(e) => setFormQuantity(e.target.value)}
            placeholder="Ví dụ: 5"
            required
          />
        </div>
      </Modal>
    </div>
  )
}

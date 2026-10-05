import React, { useEffect, useState } from 'react'
import {
  BuildingRegular,
  LocationRegular,
  AddRegular,
  CheckmarkRegular,
  ArrowRepeatAllRegular
} from '@fluentui/react-icons'
import {
  Button,
  Modal,
  Input,
  Badge,
  DataTable,
  Column,
  Toast,
  ToastMessage
} from '../../components/common'
import api from '../../services/api'

export default function CompanySettingsPage(): React.JSX.Element {
  const [companies, setCompanies] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  // Branch modal
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [branchName, setBranchName] = useState('')
  const [branchCode, setBranchCode] = useState('')
  const [branchAddress, setBranchAddress] = useState('')
  const [branchPhone, setBranchPhone] = useState('')

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true)
      const [compList, branchList] = await Promise.all([
        api.getCompanies().catch(() => []),
        api.getBranches().catch(() => [])
      ])
      setCompanies(compList || [])
      setBranches(branchList || [])
    } catch (err: any) {
      setToast({
        id: 'err-comp',
        type: 'error',
        title: 'Lỗi nạp dữ liệu',
        message: err.message || 'Không thể tải thông tin doanh nghiệp'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateBranch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!branchName.trim() || !branchCode.trim()) {
      setToast({ id: 'val', type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng nhập tên và mã chi nhánh' })
      return
    }

    try {
      setSubmitting(true)
      await api.createBranch({
        companyId: companies[0]?.id || 1,
        branchName: branchName.trim(),
        branchCode: branchCode.trim().toUpperCase(),
        address: branchAddress.trim(),
        phone: branchPhone.trim(),
        status: 'ACTIVE'
      })
      setToast({
        id: 'succ-branch',
        type: 'success',
        title: 'Tạo chi nhánh thành công',
        message: `Đã kích hoạt chi nhánh ${branchName} trong hệ thống`
      })
      setIsBranchModalOpen(false)
      setBranchName('')
      setBranchCode('')
      setBranchAddress('')
      setBranchPhone('')
      fetchData()
    } catch (err: any) {
      setToast({
        id: 'err-create-branch',
        type: 'error',
        title: 'Lỗi tạo chi nhánh',
        message: err.message || 'Không thể lưu chi nhánh'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const branchColumns: Column<any>[] = [
    {
      key: 'branchCode',
      header: 'Mã CN',
      width: '100px',
      render: (b) => <span className="font-mono font-bold text-blue-600">{b.branchCode}</span>
    },
    {
      key: 'branchName',
      header: 'Tên chi nhánh',
      render: (b) => <span className="font-medium text-slate-800">{b.branchName}</span>
    },
    {
      key: 'address',
      header: 'Địa chỉ cơ sở',
      render: (b) => <span className="text-slate-600">{b.address || 'Chưa cập nhật'}</span>
    },
    {
      key: 'phone',
      header: 'Số hotline',
      render: (b) => <span className="text-slate-600">{b.phone || 'N/A'}</span>
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (b) => (
        <Badge variant={b.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {b.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
        </Badge>
      )
    }
  ]

  const mainCompany = companies[0] || {
    companyName: 'CÔNG TY TNHH VÀNG BẠC ĐÁ QUÝ KIM HOÀNG GMS',
    taxCode: '0108892348',
    address: 'Số 136 Xuân Thủy, Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    phone: '024 3838 8888',
    email: 'contact@kimhoang-gms.vn',
    legalRepresentative: 'Nguyễn Minh Hùng'
  }

  return (
    <div className="space-y-6 pb-12">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Thông Tin Tiệm Vàng & Quản Lý Chi Nhánh
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cấu hình hồ sơ doanh nghiệp kinh doanh kim khí quý, giấy phép NHNN và mạng lưới cơ sở
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={<AddRegular className="h-4 w-4" />}
            onClick={() => setIsBranchModalOpen(true)}
          >
            Thêm Chi Nhánh Mới
          </Button>
          <Button
            variant="ghost"
            icon={<ArrowRepeatAllRegular className="h-4 w-4" />}
            onClick={fetchData}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Company Profile Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BuildingRegular className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-800">
              Hồ Sơ Doanh Nghiệp Kim Hoàn
            </h2>
          </div>
          <Badge variant="success">Giấy phép hoạt động: Đã xác thực</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
            <div className="text-xs text-slate-400">Tên doanh nghiệp</div>
            <div className="mt-1 font-semibold text-slate-800">{mainCompany.companyName}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
            <div className="text-xs text-slate-400">Mã số thuế doanh nghiệp (MST)</div>
            <div className="mt-1 font-mono font-semibold text-blue-600">{mainCompany.taxCode}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
            <div className="text-xs text-slate-400">Người đại diện pháp luật</div>
            <div className="mt-1 font-semibold text-slate-800">{mainCompany.legalRepresentative || 'Nguyễn Minh Hùng'}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 lg:col-span-2">
            <div className="text-xs text-slate-400">Địa chỉ trụ sở chính</div>
            <div className="mt-1 text-slate-700">{mainCompany.address}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
            <div className="text-xs text-slate-400">Hotline / Email liên hệ</div>
            <div className="mt-1 text-slate-700">{mainCompany.phone} - {mainCompany.email}</div>
          </div>
        </div>
      </div>

      {/* Branches List Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LocationRegular className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-semibold text-slate-800">
              Danh Sách Chi Nhánh Điểm Bán Hàng
            </h3>
          </div>
          <Badge variant="neutral">{branches.length} chi nhánh</Badge>
        </div>

        <DataTable
          columns={branchColumns}
          data={branches}
          loading={loading}
          pageSize={5}
        />
      </div>

      {/* Modal Create Branch */}
      <Modal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title="Thêm Chi Nhánh Điểm Bán Mới"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsBranchModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={handleCreateBranch}
              icon={<CheckmarkRegular className="h-4 w-4" />}
            >
              Kích Hoạt Chi Nhánh
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateBranch} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Mã chi nhánh *"
              placeholder="VD: CN-CAUGIAY"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              required
            />
            <Input
              label="Tên chi nhánh *"
              placeholder="VD: Chi Nhánh Cầu Giấy"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              required
            />
          </div>
          <Input
            label="Địa chỉ chi nhánh"
            placeholder="Số nhà, đường phố, quận huyện..."
            value={branchAddress}
            onChange={(e) => setBranchAddress(e.target.value)}
          />
          <Input
            label="Số hotline chi nhánh"
            placeholder="024 3999 xxxx"
            value={branchPhone}
            onChange={(e) => setBranchPhone(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  )
}

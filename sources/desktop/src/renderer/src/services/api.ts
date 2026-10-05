const API_BASE = 'http://localhost:8080/api'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gms_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    })
  } catch (err: any) {
    throw new Error(err.message || 'Không thể kết nối đến máy chủ backend (Port 8080)')
  }

  if (response.status === 401) {
    localStorage.removeItem('gms_token')
    window.dispatchEvent(new CustomEvent('gms_auth_state_change', { detail: { token: null } }))
    throw new Error('Vui lòng đăng nhập để truy cập hệ thống (401 Unauthorized)')
  }

  const json = await response.json()
  if (!response.ok || (json.code && json.code !== 200)) {
    throw new Error(json.message || `Lỗi yêu cầu (${response.status})`)
  }

  return json.data as T
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  // Gold Prices
  getGoldPrices: () => request<any[]>('/gold-prices'),
  updateGoldPrice: (id: number, data: any) =>
    request<any>(`/gold-prices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  syncGoldPrices: () =>
    request<any[]>('/gold-prices/sync', {
      method: 'POST'
    }),

  // Products & Warehouse
  getProducts: (branchId?: number) =>
    request<any[]>(`/products${branchId ? `?branchId=${branchId}` : ''}`),
  getProductByTag: (tagCode: string) => request<any>(`/products/tag/${tagCode}`),
  getWarehouseSummary: (branchId?: number) =>
    request<any>(`/products/summary${branchId ? `?branchId=${branchId}` : ''}`),
  createProduct: (data: any) =>
    request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateProduct: (id: number, data: any) =>
    request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteProduct: (id: number) =>
    request<any>(`/products/${id}`, {
      method: 'DELETE'
    }),

  // POS Sales
  getSales: (branchId?: number) =>
    request<any[]>(`/sales${branchId ? `?branchId=${branchId}` : ''}`),
  createSale: (data: any) =>
    request<any>('/sales', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Buyback
  getBuybacks: (branchId?: number) =>
    request<any[]>(`/buybacks${branchId ? `?branchId=${branchId}` : ''}`),
  createBuyback: (data: any) =>
    request<any>('/buybacks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Cashbook
  getActiveShift: (branchId?: number) =>
    request<any>(`/cashbook/active-shift${branchId ? `?branchId=${branchId}` : ''}`),
  getAllShifts: () => request<any[]>('/cashbook/shifts'),
  openShift: (data: any) =>
    request<any>('/cashbook/shifts/open', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  closeShift: (shiftId: number, data: any) =>
    request<any>(`/cashbook/shifts/${shiftId}/close`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getCashTransactions: (shiftId?: number) =>
    request<any[]>(`/cashbook/transactions${shiftId ? `?shiftId=${shiftId}` : ''}`),
  createCashTransaction: (data: any) =>
    request<any>('/cashbook/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Reports
  getDashboardStats: (branchId?: number) =>
    request<any>(`/reports/dashboard${branchId ? `?branchId=${branchId}` : ''}`),

  // Companies & Branches
  getCompanies: () => request<any[]>('/companies'),
  createCompany: (data: any) =>
    request<any>('/companies', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getBranches: (companyId?: number) =>
    request<any[]>(`/branches${companyId ? `?companyId=${companyId}` : ''}`),
  createBranch: (data: any) =>
    request<any>('/branches', {
      method: 'POST',
      body: JSON.stringify(data)
    })
}

export default api

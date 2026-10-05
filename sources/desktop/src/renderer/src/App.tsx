import React, { useState, useEffect } from 'react'
import TitleBar from './components/window/TitleBar'
import Navigation, { NavItemKey } from './components/Navigation'
import LoginPage from './features/auth/LoginPage'
import Dashboard from './features/dasboard/page'
import GoldPricePage from './features/goldprice/page'
import InventoryPage from './features/inventory/page'
import PosPage from './features/pos/page'
import ProcessingPage from './features/processing/page'
import CashbookPage from './features/cashbook/page'
import ReportsPage from './features/reports/page'
import CompanySettingsPage from './features/company/page'

function App(): React.JSX.Element {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gms_token'))
  const [activeTab, setActiveTab] = useState<NavItemKey | string>('dashboard')

  useEffect(() => {
    const handleAuthChange = (): void => {
      setToken(localStorage.getItem('gms_token'))
    }

    window.addEventListener('gms_auth_state_change', handleAuthChange)
    return (): void => {
      window.removeEventListener('gms_auth_state_change', handleAuthChange)
    }
  }, [])

  const handleLogout = (): void => {
    localStorage.removeItem('gms_token')
    setToken(null)
  }

  // If not authenticated, render LoginPage strictly
  if (!token) {
    return <LoginPage onLoginSuccess={(newToken) => setToken(newToken)} />
  }

  const renderContent = (): React.JSX.Element => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(key: string) => setActiveTab(key as NavItemKey)} />
      case 'gold_price':
        return <GoldPricePage />
      case 'pos_sale':
      case 'pos_wholesale':
      case 'pos_invoices':
        return <PosPage />
      case 'pos_exchange':
      case 'order_craft':
      case 'repair_polish':
      case 'pawn':
      case 'craft_partners':
        return <ProcessingPage />
      case 'inventory_gold':
      case 'inventory_import':
      case 'barcode_tag':
      case 'stock_audit':
        return <InventoryPage />
      case 'cashbook':
      case 'cash_receipt':
      case 'cash_payment':
      case 'debt':
        return <CashbookPage />
      case 'reports':
      case 'reports_inventory':
        return <ReportsPage />
      case 'settings':
      case 'company':
      case 'branch':
      case 'customers':
        return <CompanySettingsPage />
      default:
        return <Dashboard onNavigate={(key: string) => setActiveTab(key as NavItemKey)} />
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg-primary text-text-primary">
      <TitleBar onNavigate={(tab) => setActiveTab(tab)} onLogout={handleLogout} />
      <Navigation
        activeKey={activeTab as NavItemKey}
        onChange={(key) => setActiveTab(key)}
      />
      <main className="flex-1 overflow-y-auto bg-slate-50/70 p-6">
        {renderContent()}
      </main>
    </div>
  )
}

export default App

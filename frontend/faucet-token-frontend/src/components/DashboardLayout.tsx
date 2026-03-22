import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import ClaimTokensPage from '../pages/ClaimTokenPage'
import PortfolioPage from '../pages/PortfolioPage'
import AdminSuitePage from '../pages/AdminSuitePage'

export default function DashboardLayout() {
  const [currentPage, setCurrentPage] = useState('claim')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const renderPage = () => {
    switch (currentPage) {
      case 'claim':
        return <ClaimTokensPage />
      case 'portfolio':
        return <PortfolioPage />
      case 'governance':
        return <AdminSuitePage />
      default:
        return <ClaimTokensPage />
    }
  }

  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} isExpanded={sidebarExpanded} onToggleExpanded={setSidebarExpanded} />
      
      <div className="flex-1 flex flex-col">
        <Navbar isDashboard currentPage={currentPage} onNavigate={setCurrentPage} />
        
        <main className="flex-1 overflow-auto pt-16 mt-10 px-4 sm:px-6 lg:px-8 py-6 bg-accent">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

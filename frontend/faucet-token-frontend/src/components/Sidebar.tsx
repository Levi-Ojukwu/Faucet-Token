import { useState } from 'react'
import { Zap, Wallet, Settings, ChevronDown } from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  icon: React.ElementType
  submenu: Array<{ id: string; label: string }> | null
}

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  isExpanded?: boolean
  onToggleExpanded?: (expanded: boolean) => void
}

export default function Sidebar({
  currentPage,
  onNavigate,
  isExpanded = true,
  onToggleExpanded,
}: SidebarProps) {
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null)

  const menuItems: MenuItem[] = [
    {
      id: 'claim',
      label: 'Claim Tokens',
      icon: Zap,
      submenu: null,
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: Wallet,
      submenu: null,
    },
    {
      id: 'governance',
      label: 'Admin Suite',
      icon: Settings,
      submenu: null,
    },
  ]

  const handleMenuClick = (id: string) => {
    onNavigate(id)
  }

  return (
    <aside className={`sidebar bg-white border-r border-gray-200 transition-all duration-300 ${!isExpanded ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <div className="flex-1">
          {isExpanded && (
            <div>
              <h3 className="font-bold text-primary">LeviToken</h3>
              <p className="text-xs text-gray-500">Organic Faucet</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon
          const isActive = currentPage === item.id

          return (
            <div key={item.id}>
              <button
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-gray-100 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                <IconComponent size={20} />
                {isExpanded && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.submenu && <ChevronDown size={16} />}
                  </>
                )}
              </button>

              {/* Submenu - Only show when expanded */}
              {isExpanded && item.submenu && expandedSubmenu === item.id && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.submenu.map((subitem) => (
                    <button
                      key={subitem.id}
                      onClick={() => handleMenuClick(subitem.id)}
                      className={`w-full text-left px-4 py-2 text-sm rounded transition ${
                        currentPage === subitem.id
                          ? 'text-primary font-medium bg-gray-50'
                          : 'text-gray-600 hover:text-primary'
                      }`}
                    >
                      {subitem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          <div className="bg-primary bg-opacity-10 rounded-lg p-4 text-center">
            <p className="text-xs text-primary font-semibold">ECOSYSTEM VISION</p>
            <p className="text-xs text-gray-600 mt-2">
              Built on solid architectural foundations.
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}

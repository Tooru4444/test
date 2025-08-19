'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, Calendar, CheckCircle, Users, HelpCircle, Menu, X, LogOut } from 'lucide-react'

interface NavigationProps {
  userRole: 'student' | 'staff'
  userName?: string
  userPhoto?: string
}

export default function Navigation({ userRole, userName, userPhoto }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userProfile')
    localStorage.removeItem('checkInEntries')
    router.push('/')
  }

  const menuItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Calendar, label: 'Schedule', href: '/schedule' },
    { icon: CheckCircle, label: 'Check-In', href: '/checkin' },
    { icon: Users, label: 'LFG', href: '/lfg' },
    { icon: HelpCircle, label: 'Help', href: '/help' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">REC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">REC-IT</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* User Info and Logout */}
          <div className="hidden md:flex items-center gap-4">
            {userPhoto && (
              <img src={userPhoto} alt="Profile" className="w-8 h-8 rounded-full object-cover border" />
            )}
            <div className="flex flex-col items-end">
              {userName && <span className="text-sm font-medium text-gray-900">{userName}</span>}
              <span className="text-xs text-gray-600">{userRole === 'staff' ? 'Staff' : 'Student'}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white py-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className="flex items-center gap-3 w-full px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center gap-2 px-4 py-2">
                  {userPhoto && (
                    <img src={userPhoto} alt="Profile" className="w-7 h-7 rounded-full object-cover border" />
                  )}
                  <div>
                    {userName && <div className="text-sm font-medium text-gray-900">{userName}</div>}
                    <div className="text-xs text-gray-600">Role: {userRole === 'staff' ? 'Staff' : 'Student'}</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="mx-4 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

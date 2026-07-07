import React, { useState, useEffect } from 'react'
import { createRootRoute, Outlet, Link, useLocation, useNavigate, Navigate } from '@tanstack/react-router'
import { useSelector, useDispatch } from 'react-redux'
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  Package,
  Tag,
  ClipboardList,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Megaphone,
  Mail,
  Menu,
  X,
  Sun,
  Moon,
  Palette,
  Shield,
  CheckCircle2,
  LogOut
} from 'lucide-react'
import { switchCurrentRole, logout } from '../store/slices/usersSlice'
import { cn } from '../utils/cn'
import zayloLogo from '../assets/zaylo-logo.png'

export const Route = createRootRoute({
  component: RootLayout
})

function RootLayout() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const currentUser = useSelector(state => state.users.currentUser)
  const isAuthenticated = useSelector(state => state.users.isAuthenticated)
  const dealers = useSelector(state => state.dealers.items)
  const bulkOrders = useSelector(state => state.bulkOrders.items)
  const orders = useSelector(state => state.orders.items)
  const contacts = useSelector(state => state.contacts.items)

  // Local UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('app-mode') || 'light')
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('app-theme') || 'emerald')

  // Derive notifications from actual data
  const derivedNotifications = [
    ...dealers.filter(d => d.status === 'Pending').map(d => ({
      id: `dlr-${d.id}`,
      type: 'Dealer Signup',
      message: `New dealer signup from ${d.name} (${d.businessName})`,
      time: d.date,
      link: '/dealers'
    })),
    ...bulkOrders.filter(b => b.status === 'Pending').map(b => ({
      id: `blk-${b.id}`,
      type: 'Bulk Quote',
      message: `Bulk quote request for ${b.quantity} from ${b.organization}`,
      time: b.date,
      link: '/bulk-orders'
    })),
    ...orders.filter(o => o.status === 'Pending').map(o => ({
      id: `ord-${o.id}`,
      type: 'New Order',
      message: `Order ${o.id} placed by ${o.customerName} ($${o.amount})`,
      time: o.date,
      link: '/orders'
    })),
    ...contacts.filter(c => c.status === 'New').map(c => ({
      id: `con-${c.id}`,
      type: 'General Inquiry',
      message: `Inquiry "${c.subject}" from ${c.name}`,
      time: c.date,
      link: '/contacts'
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time))

  // Apply Light/Dark mode and color skins
  useEffect(() => {
    const root = document.documentElement
    
    // Light/Dark
    if (themeMode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Theme skin
    if (themeColor === 'emerald') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', themeColor)
    }

    localStorage.setItem('app-mode', themeMode)
    localStorage.setItem('app-theme', themeColor)
  }, [themeMode, themeColor])

  // If path is /login, bypass sidebar/header layout
  if (location.pathname === '/login') {
    return <Outlet />
  }

  // Redirect to /login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Nav items list
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager'] },
    { to: '/products', label: 'Catalog / Products', icon: Package, roles: ['Admin', 'Manager'] },
    { to: '/categories', label: 'Categories', icon: Tag, roles: ['Admin', 'Manager'] },
    { to: '/orders', label: 'Orders', icon: ClipboardList, roles: ['Admin', 'Manager'] },
    { to: '/dealers', label: 'Dealer Applications', icon: Briefcase, roles: ['Admin', 'Manager'] },
    { to: '/bulk-orders', label: 'Bulk Orders', icon: FileText, roles: ['Admin', 'Manager'] },
    { to: '/contacts', label: 'General Contacts', icon: Mail, roles: ['Admin', 'Manager'] },
    { to: '/blogs', label: 'Blogs CMS', icon: FileText, roles: ['Admin', 'Manager'] },
    { to: '/gallery', label: 'Gallery CMS', icon: ImageIcon, roles: ['Admin', 'Manager'] },
    { to: '/banners', label: 'Promo Banners', icon: Megaphone, roles: ['Admin', 'Manager'] },
    { to: '/users', label: 'User Roles', icon: Users, roles: ['Admin'] },
    { to: '/settings', label: 'Global Settings', icon: Settings, roles: ['Admin'] },
  ]

  // Filter items by role
  const visibleNavItems = navItems.filter(item => item.roles.includes(currentUser.role))

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col shadow-sm relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <img src={zayloLogo} alt="Zaylo Brand Logo" className="h-9 w-auto object-contain drop-shadow" />
            <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase border-l border-border pl-2.5">Admin</span>
          </div>
        </div>

        {/* Sidebar Navigation Links - rounded-lg for cleaner design */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === '/' }}
                className="[&.active]:bg-primary-light [&.active]:text-primary [&.active]:font-bold flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer Role Tester & Sign Out */}
        <div className="p-4 border-t border-border bg-card flex flex-col gap-2.5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase px-1">
              <Shield size={12} className="text-primary" />
              <span>Role Configurator</span>
            </div>
            <select
              value={currentUser.role}
              onChange={(e) => dispatch(switchCurrentRole(e.target.value))}
              className="w-full text-xs font-semibold px-2 py-1.5 bg-muted border border-border rounded-lg outline-none focus:border-primary/50 text-foreground cursor-pointer"
            >
              <option value="Admin">Administrator (All access)</option>
              <option value="Manager">Manager (Restricted)</option>
            </select>
          </div>
          <button
            onClick={() => {
              dispatch(logout())
              navigate({ to: '/login' })
            }}
            className="flex items-center gap-3 w-full px-4 py-2 mt-1 text-sm font-semibold rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all cursor-pointer border-none"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile / Tablet Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu Box */}
          <aside className="relative flex flex-col w-64 max-w-xs bg-card border-r border-border h-full shadow-lg p-4 animate-in slide-in-from-left duration-250 z-50">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2.5">
                <img src={zayloLogo} alt="Zaylo Brand Logo" className="h-9 w-auto object-contain drop-shadow" />
                <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase border-l border-border pl-2.5">Admin</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    activeOptions={{ exact: item.to === '/' }}
                    className="[&.active]:bg-primary-light [&.active]:text-primary [&.active]:font-bold flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="pt-4 border-t border-border mt-auto flex flex-col gap-2.5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase px-1">
                  <Shield size={12} className="text-primary" />
                  <span>Role Configurator</span>
                </div>
                <select
                  value={currentUser.role}
                  onChange={(e) => dispatch(switchCurrentRole(e.target.value))}
                  className="w-full text-xs font-semibold px-2 py-1.5 bg-muted border border-border rounded-lg outline-none focus:border-primary/50 text-foreground cursor-pointer"
                >
                  <option value="Admin">Administrator (All access)</option>
                  <option value="Manager">Manager (Restricted)</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  dispatch(logout())
                  navigate({ to: '/login' })
                }}
                className="flex items-center gap-3 w-full px-4 py-2 mt-1 text-sm font-semibold rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all cursor-pointer border-none"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden bg-background">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 lg:px-8 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 font-extrabold uppercase rounded-full bg-primary-light text-primary tracking-wide">
                Role: {currentUser.role}
              </span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                title="Change appearance"
              >
                <Palette size={18} />
              </button>

              {themeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setThemeMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-lg p-3 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Appearance Modes</p>
                    <div className="flex gap-1.5 mb-3">
                      <button
                        onClick={() => setThemeMode('light')}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-lg border border-border transition-all cursor-pointer',
                          themeMode === 'light' ? 'bg-primary text-white border-primary' : 'hover:bg-muted'
                        )}
                      >
                        <Sun size={12} />
                        Light
                      </button>
                      <button
                        onClick={() => setThemeMode('dark')}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-lg border border-border transition-all cursor-pointer',
                          themeMode === 'dark' ? 'bg-primary text-white border-primary' : 'hover:bg-muted'
                        )}
                      >
                        <Moon size={12} />
                        Dark
                      </button>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Theme Color Skins</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: 'Emerald', value: 'emerald', bg: 'bg-[#1F9355]' },
                        { name: 'Blue', value: 'blue', bg: 'bg-[#2563eb]' },
                        { name: 'Purple', value: 'purple', bg: 'bg-[#9333ea]' },
                        { name: 'Orange', value: 'orange', bg: 'bg-[#f97316]' }
                      ].map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setThemeColor(t.value)}
                          className={cn(
                            'flex items-center gap-2 py-1 px-2 text-xs font-semibold rounded-lg border border-border transition-all cursor-pointer text-left',
                            themeColor === t.value ? 'bg-muted border-primary' : 'hover:bg-muted'
                          )}
                        >
                          <span className={cn('w-2.5 h-2.5 rounded-full', t.bg)} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Notifications Drawer Toggle */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 relative cursor-pointer"
                title="Notifications Log"
              >
                <Bell size={18} />
                {derivedNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center animate-pulse">
                    {derivedNotifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-card border border-border rounded-2xl shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col max-h-[400px]">
                    <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground font-display flex items-center gap-1.5">
                        <Bell size={16} className="text-primary" />
                        Pending Action Alerts
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary">
                        {derivedNotifications.length} New
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-border">
                      {derivedNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-muted-foreground">
                          <CheckCircle2 size={32} className="mx-auto mb-2 text-primary opacity-60" />
                          No pending notifications! Everything is up to date.
                        </div>
                      ) : (
                        derivedNotifications.map((notif) => (
                          <Link
                            key={notif.id}
                            to={notif.link}
                            onClick={() => setNotificationsOpen(false)}
                            className="p-3 text-left hover:bg-muted/30 transition-all flex flex-col gap-1 cursor-pointer block"
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-primary uppercase tracking-wide">{notif.type}</span>
                              <span className="text-muted-foreground font-normal">
                                {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-foreground font-semibold leading-relaxed">
                              {notif.message}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Circle */}
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm select-none">
              {currentUser.name[0]}
            </div>
          </div>
        </header>

        {/* Page Content Panel */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

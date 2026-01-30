import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { PreviewPage } from '@/pages/Preview'
import { LayoutDashboard, Eye, Settings, PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/preview', icon: Eye, label: 'Preview' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className={cn(
      'bg-sidebar border-r border-sidebar-border min-h-screen p-4 transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="mb-8 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Skin Dashboard</h1>
            <p className="text-sm text-sidebar-foreground/60">皮肤预览工具</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
          title={collapsed ? '展开菜单' : '收起菜单'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
      <nav className="space-y-2">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              collapsed && 'justify-center px-2',
              location.pathname === item.path
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function DashboardPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border bg-card">
          <h2 className="text-lg font-semibold mb-2">皮肤总数</h2>
          <p className="text-4xl font-bold text-primary">8</p>
          <p className="text-sm text-muted-foreground mt-1">30号 - 37号</p>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <h2 className="text-lg font-semibold mb-2">快速预览</h2>
          <p className="text-muted-foreground text-sm mb-4">查看所有皮肤的布局结构</p>
          <Link
            to="/preview"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            <Eye className="h-4 w-4" />
            进入预览
          </Link>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <h2 className="text-lg font-semibold mb-2">技术栈</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Vite + React + TypeScript</li>
            <li>• Tailwind CSS + shadcn/ui</li>
            <li>• Leafer-UI Canvas</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="p-6 rounded-lg border bg-card">
        <p className="text-muted-foreground">设置页面开发中...</p>
      </div>
    </div>
  )
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 bg-background">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

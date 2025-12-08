import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Compass, LogOut, CloudSun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Layout() {
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Compass, label: 'Explore API', path: '/explore' },
        { icon: Users, label: 'Users', path: '/users' },
    ]

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-2 border-b">
                    <CloudSun className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl">GDASH Weather</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <Button
                                key={item.path}
                                variant={isActive ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2"
                                onClick={() => navigate(item.path)}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        )
                    })}
                </nav>

                <div className="p-4 border-t">
                    <Button
                        variant="destructive"
                        className="w-full justify-start gap-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-14 border-b flex items-center px-4 md:hidden bg-card">
                    <CloudSun className="h-6 w-6 text-primary mr-2" />
                    <span className="font-bold">GDASH Weather</span>
                </header>

                <main className="flex-1 overflow-y-auto bg-muted/10">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

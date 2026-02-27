import { 
  BedDouble, 
  Calendar, 
  CalendarCheck, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Menu, 
  UserCog, 
  Users, 
  X,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { NavItem, UserRole } from "../utils/auth";

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
}

export default function AppSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
    const { user, logout } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Menu definition with associated roles from Backend Doc
    const navItems: NavItem[] = [
        { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', roles: ['ADMIN', 'MANAGER'] },
        { label: 'Rooms', icon: BedDouble, route: '/rooms', roles: ['ADMIN', 'RECEPTIONIST']},
        { label: 'Calendar', icon: Calendar, route: '/calendar', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST']},
        { label: 'Bookings', icon: CalendarCheck, route: '/bookings', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST']},
        { label: 'Customers', icon: Users, route: '/customers', roles: ['ADMIN', 'RECEPTIONIST']},
        { label: 'Staff', icon: UserCog, route: '/staff', roles: ['ADMIN']},
    ];

    // Filter items based on current user role
    const filteredNavItems = navItems.filter(item => 
        user && item.roles.includes(user.role)
    );

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
    <>
      {/* Mobile Toggle Button */}
        <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-md shadow-lg"
        >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
         </button>

      <aside 
        className={`
            fixed top-0 left-0 h-full bg-white border-r border-surface z-40 transition-all duration-300
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3 overflow-hidden border-b border-surface">
          <div className="w-8 h-8 bg-accent rounded-lg shrink-0 flex items-center justify-center text-white font-bold">
            H
          </div>
          {!isCollapsed && (
            <span className="font-heading font-bold text-xl text-primary animate-in fade-in duration-500 whitespace-nowrap">
              HMS Portal
            </span>
          )}
        </div>

        {/* User Info (Visible when not collapsed) */}
        {!isCollapsed && user && (
            <div className="px-6 py-4 border-b border-surface">
                <p className="text-xs font-bold text-muted uppercase tracking-tighter">Logged in as</p>
                <p className="text-sm font-bold text-primary truncate">{user.name}</p>
                <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">
                    {user.role}
                </span>
            </div>
        )}

        {/* Navigation */}
        <nav className="mt-4 px-3 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.route;
            return (
              <Link
                key={item.route}
                to={item.route}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-4 p-3 rounded-xl transition-all group
                  ${isActive ? 'bg-primary text-white shadow-md' : 'text-muted hover:bg-surface'}
                `}
              >
                <item.icon size={22} className={isActive ? 'text-white' : 'text-muted group-hover:text-primary'} />
                {!isCollapsed && (
                  <span className="font-medium text-sm animate-in slide-in-from-left-2 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-0 w-full px-3 space-y-2">
            <button 
                onClick={handleLogout}
                className={`
                    flex items-center gap-4 p-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all
                `}
            >
                <LogOut size={22} />
                {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
            </button>

            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex w-full h-10 items-center justify-center bg-surface rounded-xl text-muted hover:text-primary transition-colors"
            >
                {isCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2"><ChevronLeft size={20} /><span className="text-xs font-bold">Collapse</span></div>}
            </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
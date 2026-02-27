import { BedDouble, Calendar, CalendarCheck, ChevronLeft, ChevronRight, LayoutDashboard, Menu, UserCog, Users, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
}


export default function AppSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, route: '/'},
        { label: 'Rooms', icon: BedDouble, route: '/rooms'},
        { label: 'Calendar', icon: Calendar, route: '/calendar'},
        { label: 'Bookings', icon: CalendarCheck, route: '/bookings'},
        { label: 'Customers', icon: Users, route: '/customers'},
        { label: 'Staff', icon: UserCog, route: '/staff'},
    ];

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    return (
    <>
      {/* Mobile Toggle Button */}
        <button 
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-primary text-white rounded-md shadow-lg"
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
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-accent rounded-lg shrink-0 flex items-center justify-center text-white font-bold">
            H
          </div>
          {!isCollapsed && (
            <span className="font-heading font-bold text-xl text-primary animate-in fade-in duration-500">
              HMS
            </span>
          )}
        </div>

        <nav className="mt-6 px-3 space-y-2">
          {navItems.map((item) => {
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
                  <span className="font-medium text-sm animate-in slide-in-from-left-2">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 w-10 h-10 items-center justify-center bg-surface rounded-full text-muted hover:text-primary transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </aside>

      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
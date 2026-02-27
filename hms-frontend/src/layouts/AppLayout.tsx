import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setIsCollapsed(true);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate dynamic margin class
    const marginClass = isMobile ? 'ml-0' : (isCollapsed ? 'ml-20' : 'ml-64');

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar now inside AuthProvider, so useAuth() will work */}
            <AppSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            
            <main className={`flex-1 transition-all duration-300 p-8 pt-24 lg:pt-8 ${marginClass}`}>
                <div className="max-w-7xl mx-auto">
                    {/* Specific Page Content renders here */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
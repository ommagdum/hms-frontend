import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setIsCollapsed(true);
            else setIsCollapsed(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Pass state and setter to Sidebar */}
            <AppSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            
            <main 
                className="flex-1 transition-all duration-300 p-8 pt-20 lg:pt-8"
                style={{ 
                    marginLeft: window.innerWidth >= 1024 ? (isCollapsed ? '80px' : '256px') : '0' 
                }}
            >
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
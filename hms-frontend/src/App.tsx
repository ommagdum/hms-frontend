import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AppLayout from "./layouts/AppLayout"
import Dashboard from "./pages/Dashboard"
import Rooms from "./pages/Rooms"
import Bookings from "./pages/Bookings"
import Customers from "./pages/Customers"
import Staff from "./pages/Staff"
import NewBooking from "./pages/NewBooking"
import RoomCalendar from "./pages/RoomCalendar"
import BookingDetails from "./pages/BookingDetials"
import EditBooking from "./pages/EditBooking"
import Login from "./pages/Login"
import { LayoutDashboard, BedDouble, Calendar, CalendarCheck, Users, UserCog } from "lucide-react"
import { getFirstAccessibleRoute } from "./utils/auth"
import { useAuth } from "./contexts/AuthContext"
import type { UserRole } from "./utils/auth"

// Component to handle role-based redirect
function RoleBasedRedirect() {
  const { user } = useAuth();
  
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', roles: ['ADMIN', 'MANAGER'] as UserRole[] },
    { label: 'Rooms', icon: BedDouble, route: '/rooms', roles: ['ADMIN', 'RECEPTIONIST'] as UserRole[]},
    { label: 'Calendar', icon: Calendar, route: '/calendar', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] as UserRole[]},
    { label: 'Bookings', icon: CalendarCheck, route: '/bookings', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] as UserRole[]},
    { label: 'Customers', icon: Users, route: '/customers', roles: ['ADMIN', 'RECEPTIONIST'] as UserRole[]},
    { label: 'Staff', icon: UserCog, route: '/staff', roles: ['ADMIN'] as UserRole[]},
  ];

  const firstRoute = user ? getFirstAccessibleRoute(user.role, navItems) : '/dashboard';
  return <Navigate to={firstRoute} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes - Wrapped in Auth and Layout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleBasedRedirect />} />
            <Route path="dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <Dashboard />
              </ProtectedRoute>
            }/>
            <Route path="rooms" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                <Rooms />
              </ProtectedRoute>
            }/>
            <Route path="calendar" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
                <RoomCalendar />
              </ProtectedRoute>
            } />
            <Route path="bookings" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
                <Bookings />
              </ProtectedRoute>
            }/>
            <Route path="bookings/new" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
                <NewBooking />
              </ProtectedRoute>
            }/>
            <Route path="bookings/:id" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
                <BookingDetails />
              </ProtectedRoute>
            } />
            <Route path="bookings/edit/:id" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
                <EditBooking />
              </ProtectedRoute>
            } />
            <Route path="customers" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                <Customers />
              </ProtectedRoute>
            }/>
            
            {/* Role-Based Route: Only ADMIN can access Staff */}
            <Route 
              path="staff" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Staff />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback for 404s or unauthorized access */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
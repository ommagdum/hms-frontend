import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { User, NavItem } from '../utils/auth';
import { getFirstAccessibleRoute } from '../utils/auth';
import { LayoutDashboard, BedDouble, Calendar, CalendarCheck, Users, UserCog } from 'lucide-react';
import apiClient from '../api/client';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { token, ...userData } = response.data.data;
      
      // Store token in localStorage for API calls
      localStorage.setItem('token', token);
      
      // Create user object matching our User interface
      const user: User = {
        id: userData.id,
        name: userData.name || username,
        email: userData.email || '',
        role: userData.role
      };
      
      login(user);
      
      // Debug: Log the user data and authentication state
      console.log('Login successful:', user);
      console.log('User role:', user.role);
      
      // Navigate to first accessible route based on user role
      const navItems: NavItem[] = [
        { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', roles: ['ADMIN', 'MANAGER'] as const },
        { label: 'Rooms', icon: BedDouble, route: '/rooms', roles: ['ADMIN', 'RECEPTIONIST'] as const },
        { label: 'Calendar', icon: Calendar, route: '/calendar', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] as const },
        { label: 'Bookings', icon: CalendarCheck, route: '/bookings', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] as const },
        { label: 'Customers', icon: Users, route: '/customers', roles: ['ADMIN', 'RECEPTIONIST'] as const },
        { label: 'Staff', icon: UserCog, route: '/staff', roles: ['ADMIN'] as const },
      ];
      
      const firstRoute = getFirstAccessibleRoute(user.role, navItems);
      console.log('Redirecting to:', firstRoute);
      
      // Use a small delay to ensure auth state is updated before navigation
      setTimeout(() => {
        navigate(firstRoute);
      }, 100);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-card shadow-2xl overflow-hidden">
        <div className="bg-primary p-8 text-center text-white">
          <h1 className="text-2xl font-bold uppercase tracking-widest">HMS Portal</h1>
          <p className="text-white/70 text-sm mt-2">Enter credentials to access the system</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle size={18} /> {error}
            </div>
          )}
          
          <div>
            <label className="text-xs font-bold text-muted uppercase">Username</label>
            <input required className="w-full p-3 bg-surface rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
              value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          
          <div>
            <label className="text-xs font-bold text-muted uppercase">Password</label>
            <input required type="password" className="w-full p-3 bg-surface rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button disabled={loading} className="w-full bg-accent text-white py-3 rounded-button font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
            {loading ? <Loader2 className="animate-spin" /> : <LogIn size={18} />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
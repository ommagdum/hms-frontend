import { useEffect, useState } from 'react';
import { 
  BedDouble, CalendarCheck, IndianRupee, Users, 
  TrendingUp, TrendingDown, Loader2, ArrowRightLeft, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { dashboardService, type DashboardSummaryDto } from '../api/dashboardService';

const COLORS: Record<string, string> = {
  OCCUPIED: "#2C4A3E",
  AVAILABLE: "#C6A15B",
  MAINTENANCE: "#E8E7E3"
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await dashboardService.getSummary();
        if (res.success) setData(res.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !data) return (
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-accent" size={40} />
      <p className="text-muted text-sm font-medium">Gathering Serenity Analytics...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. TOP STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Rooms" 
          value={data?.counters?.totalRooms ?? 0} 
          icon={BedDouble} 
          trend="Inventory" 
        />
        <StatCard 
          label="Active Bookings" 
          value={data?.counters?.activeBookings ?? 0} 
          icon={CalendarCheck} 
          trend={data?.counters?.trendsDto?.bookingGrowth ?? "No data"} 
        />
        <StatCard 
          label="Total Revenue" 
          value={`₹${(data?.counters?.totalRevenue ?? 0).toLocaleString('en-IN')}`} 
          icon={IndianRupee} 
          trend={data?.counters?.trendsDto?.revenueGrowth ?? "0%"} 
          isRevenue
        />
        <StatCard 
          label="Total Guests" 
          value={data?.counters?.totalGuests ?? 0} 
          icon={Users} 
          trend="Registered" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. REVENUE TREND (Now using real API Dates) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-card border border-surface shadow-card">
          <h3 className="font-heading text-lg font-semibold mb-6">Revenue Trend (Last 7 Days)</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueChart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A15B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C6A15B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => str.split('-').slice(1).join('/')} // Format: MM/DD
                  axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#666'}} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#666'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number | string) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="amount" stroke="#C6A15B" strokeWidth={3} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. OCCUPANCY PIE */}
        <div className="bg-white p-6 rounded-card border border-surface shadow-card flex flex-col">
          <h3 className="font-heading text-lg font-semibold mb-6">Room Status</h3>
          <div className="flex-1 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data.occupancyDistribution} 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={8} 
                  dataKey="count" 
                  nameKey="status"
                >
                  {data.occupancyDistribution.map((entry) => {
                    // This handles both "Available" and "MAINTENANCE" correctly
                    const statusKey = entry.status.toUpperCase(); 
                    return (
                      <Cell 
                        key={`cell-${entry.status}`} 
                        fill={COLORS[statusKey] || "#E8E7E3"} 
                      />
                    );
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {data.occupancyDistribution.map(item => {
              const statusKey = item.status.toUpperCase();
              return (
                <div key={item.status} className="text-center">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">
                    {item.status}
                  </p>
                  <p 
                    className="text-lg font-bold" 
                    style={{ color: COLORS[statusKey] || "#666" }}
                  >
                    {item.count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY FEED (New Section!) */}
      <div className="bg-white p-6 rounded-card border border-surface shadow-card">
        <div className="flex items-center gap-2 mb-6">
          <ArrowRightLeft className="text-accent" size={20} />
          <h3 className="font-heading text-lg font-semibold">Today's Check-ins & Check-outs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.recentActivity.length > 0 ? data.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-background border border-surface/50">
              <div className={`w-2 h-10 rounded-full ${activity.type === 'CHECK_IN' ? 'bg-primary' : 'bg-accent'}`} />
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{activity.guestName}</p>
                <p className="text-xs text-muted">Room {activity.roomNumber} • {activity.type.replace('_', ' ')}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono flex items-center gap-1 text-muted">
                  <Clock size={10} /> {activity.time}
                </span>
              </div>
            </div>
          )) : (
            <p className="text-muted text-sm italic p-4">No activity recorded for today yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Polished StatCard Component
function StatCard({ label, value, icon: Icon, trend = "", isRevenue }: any) {
  // Safe check for trend existence
  const trendString = String(trend || "");
  const isPositive = trendString.includes('+');
  
  return (
    <div className="bg-white p-6 rounded-card border border-surface shadow-card relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-background rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-bold ${
          isRevenue ? (isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600') : 'bg-background text-muted'
        }`}>
          {isRevenue && trendString !== "0%" && (isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
          {trendString}
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-[10px] font-label text-muted uppercase tracking-widest">{label}</h4>
        <p className="text-2xl font-heading font-bold mt-1 text-foreground">{value}</p>
      </div>
    </div>
  );
}
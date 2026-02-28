import { Link } from 'react-router-dom';
import { FileText, TrendingUp, User, DollarSign, Home, BarChart3 } from 'lucide-react';

export default function ReportsIndex() {
  const reports = [
    {
      title: 'Daily Revenue Report',
      description: 'Analyze daily revenue and booking trends with date range selection',
      icon: DollarSign,
      route: '/reports/daily-revenue',
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'Monthly Occupancy Report',
      description: 'View room occupancy rates and statistics for any month',
      icon: Home,
      route: '/reports/monthly-occupancy',
      color: 'bg-accent/10 text-accent'
    },
    {
      title: 'Customer Booking History',
      description: 'View complete booking history for any customer',
      icon: User,
      route: '/reports/customer-history',
      color: 'bg-surface/70 text-foreground'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Reports</h1>
          <p className="text-muted text-sm italic">Generate and export comprehensive business reports</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <BarChart3 size={18} />
          <span>ADMIN & MANAGER ACCESS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <Link
            key={index}
            to={report.route}
            className="group"
          >
            <div className="bg-white rounded-card shadow-card border border-surface p-6 hover:shadow-lg transition-all duration-200 h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${report.color} group-hover:scale-110 transition-transform`}>
                  <report.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {report.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <FileText size={14} />
                  <span>Export Available</span>
                </div>
                <div className="flex items-center text-sm text-primary font-medium group-hover:translate-x-2 transition-transform">
                  <span>Generate</span>
                  <TrendingUp size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

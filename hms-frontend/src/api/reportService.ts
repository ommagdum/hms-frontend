import apiClient from "./client";

// Daily Revenue Report Types
export interface DailyRevenueData {
  date: string;
  totalRevenue: number;
  totalBookings: number;
}

export interface DailyRevenueResponse {
  success: boolean;
  message: string;
  data: DailyRevenueData[];
}

// Monthly Occupancy Report Types
export interface MonthlyOccupancyData {
  month: string;
  occupiedRoomNights: number;
  totalAvailableRoomNights: number;
  occupancyPercentage: number;
}

export interface MonthlyOccupancyResponse {
  success: boolean;
  message: string;
  data: MonthlyOccupancyData;
}

// Customer History Report Types
export interface CustomerBookingData {
  bookingId: number;
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  totalAmount: number;
  status: string;
}

export interface CustomerHistoryResponse {
  success: boolean;
  message: string;
  data: CustomerBookingData[];
}

// Report Service
export const reportService = {
  // Daily Revenue Report
  getDailyRevenue: async (startDate: string, endDate: string): Promise<DailyRevenueResponse> => {
    const res = await apiClient.get<DailyRevenueResponse>('/reports/daily-revenue', {
      params: { startDate, endDate }
    });
    return res.data;
  },

  exportDailyRevenue: async (startDate: string, endDate: string, format: 'pdf' | 'excel'): Promise<void> => {
    const response = await apiClient.get('/reports/daily-revenue/export', {
      params: { startDate, endDate, format },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `daily-revenue-${startDate}-to-${endDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Monthly Occupancy Report
  getMonthlyOccupancy: async (year: number, month: number): Promise<MonthlyOccupancyResponse> => {
    const res = await apiClient.get<MonthlyOccupancyResponse>('/reports/monthly-occupancy', {
      params: { year, month }
    });
    return res.data;
  },

  exportMonthlyOccupancy: async (year: number, month: number, format: 'pdf' | 'excel'): Promise<void> => {
    const response = await apiClient.get('/reports/monthly-occupancy/export', {
      params: { year, month, format },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monthly-occupancy-${year}-${month}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Customer History Report
  getCustomerHistory: async (customerId: number): Promise<CustomerHistoryResponse> => {
    const res = await apiClient.get<CustomerHistoryResponse>(`/reports/customer-history/${customerId}`);
    return res.data;
  },

  exportCustomerHistory: async (customerId: number, format: 'pdf' | 'excel'): Promise<void> => {
    const response = await apiClient.get(`/reports/customer-history/${customerId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customer-history-${customerId}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

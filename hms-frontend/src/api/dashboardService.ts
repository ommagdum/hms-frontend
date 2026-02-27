import apiClient from './client';
import type { ApiResponse } from './roomService';

export interface DashboardSummaryDto {
  counters: {
    totalRooms: number;
    activeBookings: number;
    totalRevenue: number;
    totalGuests: number;
    trendsDto: {
      revenueGrowth: string;
      bookingGrowth: string;
    }
  };
  occupancyDistribution: { status: string; count: number }[];
  revenueChart: { date: string; amount: number }[];
  recentActivity: {
    id: number;
    guestName: string;
    roomNumber: string;
    type: 'CHECK_IN' | 'CHECK_OUT';
    time: string;
  }[];
}

export const dashboardService = {
  getSummary: async () => {
    const response = await apiClient.get<ApiResponse<DashboardSummaryDto>>('/dashboard/summary');
    return response.data;
  }
};
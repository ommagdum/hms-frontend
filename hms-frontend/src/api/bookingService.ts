import apiClient from "./client";
import type { ApiResponse, Page } from "./roomService"; // Reuse the Page interface

export interface Booking {
    bookingId?: number;
    customerId?: number;
    customerName?: string; 
    roomType?: string;
    roomId: number;
    roomNumber?: string; 
    checkIn: string;
    checkOut: string;
    totalAmount?: number;
    status: 'CONFIRMED' | 'CANCELLED';
}

export interface BookingRangeResponse {
    roomId: number;
    roomNumber: string;
    bookings: {
        guestName: string;
        checkIn: string;
        checkOut: string;
        status: string;
    }[];
}

export const bookingService = {
    getAllBookings: async (params: { 
        page?: number; 
        size?: number; 
        guestName?: string; 
        roomNumber?: string; 
        status?: string 
    }): Promise<ApiResponse<Page<Booking>>> => {

        const cleanParams: Record<string, string> = {};
        Object.keys(params).forEach(key => {
            const value = params[key as keyof typeof params];
            if (value !== '' && value !== undefined) {
                cleanParams[key] = String(value);
            }
        });

        const query = new URLSearchParams(cleanParams).toString();
        const res = await apiClient.get<ApiResponse<Page<Booking>>>(`/bookings?${query}`);
        return res.data;
    },

    createBooking: async (booking: Omit<Booking, 'bookingId'>): Promise<ApiResponse<Booking>> => {
        const res = await apiClient.post<ApiResponse<Booking>>('/bookings', booking);
        return res.data;
    },

    getBookingsInRange: async (startDate: string, endDate: string): Promise<ApiResponse<BookingRangeResponse[]>> => {
        const res = await apiClient.get<ApiResponse<BookingRangeResponse[]>>(
            `/bookings/range?startDate=${startDate}&endDate=${endDate}`
        );
        return res.data;
    },

    cancelBooking: async (id: number): Promise<ApiResponse<Booking>> => {
        const res = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
        return res.data;
    },

    getBookingById: async (id: number): Promise<ApiResponse<Booking>> => {
        const res = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
        return res.data;
    },

    updateBooking: async (id: number, booking: Partial<Booking>): Promise<ApiResponse<Booking>> => {
    const res = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}`, booking);
    return res.data;
    }
};
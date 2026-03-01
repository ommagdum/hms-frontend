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
    }) => {

        const cleanParams: any = { ...params };
        Object.keys(cleanParams).forEach(key => {
            if (cleanParams[key] === '' || cleanParams[key] === undefined) {
                delete cleanParams[key];
            }
        });

        const query = new URLSearchParams(cleanParams).toString();
        const res = await apiClient.get<ApiResponse<Page<Booking>>>(`/bookings?${query}`);
        return res.data;
    },

    createBooking: async (booking: any): Promise<ApiResponse<Booking>> => {
        const res = await apiClient.post<ApiResponse<Booking>>('/bookings', booking);
        return res.data;
    },

    getBookingsInRange: async (startDate: string, endDate: string) => {
        const res = await apiClient.get<ApiResponse<BookingRangeResponse[]>>(
            `/bookings/range?startDate=${startDate}&endDate=${endDate}`
        );
        return res.data;
    },

    cancelBooking: async (id: number) => {
        const res = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
        return res.data;
    },

    getBookingById: async (id: number) => {
        const res = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
        return res.data;
    },

    updateBooking: async (id: number, booking: any) => {
    const res = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}`, booking);
    return res.data;
    }
};
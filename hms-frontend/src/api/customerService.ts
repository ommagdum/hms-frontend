import apiClient from "./client";
import type { ApiResponse, Page } from "./roomService";

export interface Customer {
    customerId?: number; // Optional for creation
    name: string;
    email: string;
    phone: string;
    address?: string;
}

export const customerService = {
   // GET /api/customers (Paginated)
    getCustomers: async (page = 0, size = 10): Promise<ApiResponse<Page<Customer>>> => {
        const res = await apiClient.get<ApiResponse<Page<Customer>>>(`/customers?page=${page}&size=${size}`);
        return res.data;
    },

    // POST /api/customers
    createCustomer: async (customer: Customer): Promise<ApiResponse<Customer>> => {
        const res = await apiClient.post<ApiResponse<Customer>>('/customers', customer);
        return res.data;
    },

    // PUT /api/customers/{id}
    updateCustomer: async (id: number, customer: Customer): Promise<ApiResponse<Customer>> => {
        const res = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, customer);
        return res.data;
    },

    // DELETE /api/customers/{id}
    deleteCustomer: async (id: number): Promise<ApiResponse<null>> => {
        const res = await apiClient.delete<ApiResponse<null>>(`/customers/${id}`);
        return res.data;
    },

    // GET /api/customers/search
    searchCustomers: async (params: { name?: string; phone?: string }): Promise<ApiResponse<Page<Customer>>> => {
        const query = params.name ? `name=${params.name}` : `phone=${params.phone}`;
        const res = await apiClient.get<ApiResponse<Page<Customer>>>(`/customers/search?${query}`);
        return res.data;
    },

    // GET /api/customers/{id}/bookings
    getBookingHistory: async (id: number, page = 0): Promise<ApiResponse<Page<any>>> => {
        const res = await apiClient.get<ApiResponse<Page<any>>>(`/customers/${id}/bookings?page=${page}`);
        return res.data;
    }
};
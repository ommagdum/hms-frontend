import apiClient from "./client";
import type { ApiResponse } from "./roomService";

export interface Customer {
    customerId: number;
    name: string;
    email: string;
    phone: string;
}

export interface Staff {
  staffId?: number; // Optional for creation
  name: string;
  role: string;
  contact: string;
  salary: number;
  createdAt?: string;
  updatedAt?: string;
}

export const userService = {

    getCustomers: async (page = 0) => {
        const res = await apiClient.get<ApiResponse<any>>(`/customers?page=${page}&size=10`);
        return res.data.data;
    },

    searchCustomers: async (name: string) => {
        const res = await apiClient.get<ApiResponse<any>>(`/customers/search?name=${name}`);
        return res.data.data;
    },

    // GET /api/staff - Returns plain array
    getStaff: async (): Promise<Staff[]> => {
        const res = await apiClient.get<Staff[]>('/staff');
        return res.data;
    },

    // POST /api/staff
    createStaff: async (staff: Staff): Promise<Staff> => {
        const res = await apiClient.post<Staff>('/staff', staff);
        return res.data;
    },

    // PUT /api/staff/{id}
    updateStaff: async (id: number, staff: Staff): Promise<Staff> => {
        const res = await apiClient.put<Staff>(`/staff/${id}`, staff);
        return res.data;
    },

    // DELETE /api/staff/{id}
    deleteStaff: async (id: number): Promise<void> => {
        await apiClient.delete(`/staff/${id}`);
    }
}
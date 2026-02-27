import apiClient from "./client";

export interface Staff {
  staffId?: number; // Optional for creation
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'RECEPTIONIST';
  contact: string;
  salary: number;
  username: string;
  password?: string; // Only for creation/update, not in responses
}

export interface StaffDto {
  staffId: number;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'RECEPTIONIST';
  contact: string;
  salary: number;
  username: string;
}

export const staffService = {
  // GET /api/staff - Returns array of staff members
  getAllStaff: async (): Promise<StaffDto[]> => {
    const res = await apiClient.get<StaffDto[]>('/staff');
    return res.data;
  },

  // GET /api/staff/{id} - Get staff by ID
  getStaffById: async (id: number): Promise<StaffDto> => {
    const res = await apiClient.get<StaffDto>(`/staff/${id}`);
    return res.data;
  },

  // POST /api/staff - Create new staff member
  createStaff: async (staff: Omit<Staff, 'staffId'>): Promise<StaffDto> => {
    const res = await apiClient.post<StaffDto>('/staff', staff);
    return res.data;
  },

  // PUT /api/staff/{id} - Update staff member
  updateStaff: async (id: number, staff: Partial<Omit<Staff, 'staffId'>>): Promise<StaffDto> => {
    const res = await apiClient.put<StaffDto>(`/staff/${id}`, staff);
    return res.data;
  },

  // DELETE /api/staff/{id} - Delete staff member
  deleteStaff: async (id: number): Promise<void> => {
    await apiClient.delete(`/staff/${id}`);
  }
};

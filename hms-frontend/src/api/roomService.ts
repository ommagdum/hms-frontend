import apiClient from "./client";

export interface Room {
    roomId: number;
    roomNumber: string;
    roomType: string;
    price: number;
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
    amenities?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const roomService = {
    getAllRooms: async (page = 0, size = 10): Promise<ApiResponse<Page<Room>>> => {
        const res = await apiClient.get<ApiResponse<Page<Room>>>(`/rooms?page=${page}&size=${size}`);
        return res.data;
    },

    getAvailableRooms: async (checkIn: string, checkOut: string): Promise<ApiResponse<Room[]>> => {
        const res = await apiClient.get<ApiResponse<Room[]>>(
            `/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`
        );
        return res.data;
    },

    createRoom: async (roomData: Omit<Room, 'roomId'>): Promise<ApiResponse<Room>> => {
        const response = await apiClient.post<ApiResponse<Room>>('/rooms', roomData);
        return response.data;
    },

    updateRoom: async (id: number, roomData: Omit<Room, 'roomId'>): Promise<ApiResponse<Room>> => {
        const response = await apiClient.put<ApiResponse<Room>>(`/rooms/${id}`, roomData);
        return response.data;
    },

    deleteRoom: async (id: number): Promise<void> => {
        await apiClient.delete(`/rooms/${id}`);
    },
};
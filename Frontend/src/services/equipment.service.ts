import apiClient from '@/lib/api';

interface Equipment {
  equipment_id: number;
  name: string;
  category: string;
  status: string;
  purchase_date: string;
  last_maintenance: string;
  branch_id: number;
}

interface EquipmentResponse {
  success: boolean;
  data: {
    equipment: Equipment[];
    pagination: {
      totalPages: number;
      currentPage: number;
      total: number;
    };
  };
  message?: string;
}

export const equipmentService = {
  getEquipment: async (params?: any): Promise<EquipmentResponse> => {
    const { data } = await apiClient.getClient().get('/equipment', { params });
    return data;
  },

  getEquipmentById: async (id: number) => {
    const { data } = await apiClient.getClient().get(`/equipment/${id}`);
    return data;
  },

  getMaintenanceHistory: async (id: number) => {
    const { data } = await apiClient.getClient().get(`/equipment/${id}/maintenance`);
    return data;
  },

  updateEquipmentStatus: async (id: number, status: string) => {
    const { data } = await apiClient.getClient().patch(`/equipment/${id}/status`, { status });
    return data;
  },

  logMaintenance: async (id: number, maintenanceData: any) => {
    const { data } = await apiClient.getClient().post(`/equipment/${id}/maintenance`, maintenanceData);
    return data;
  },

  getCategories: async () => {
    const { data } = await apiClient.getClient().get('/equipment/categories');
    return data;
  },

  getOverdueEquipment: async () => {
    const { data } = await apiClient.getClient().get('/equipment/overdue');
    return data;
  },
};

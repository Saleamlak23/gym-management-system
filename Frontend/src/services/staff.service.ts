import { api } from '@/lib/api';

interface StaffMember {
  staff_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role_name: string;
  branch_name: string;
  join_date: string;
  status: string;
}

interface StaffResponse {
  success: boolean;
  data: {
    staff: StaffMember[];
    pagination: {
      totalPages: number;
      currentPage: number;
      total: number;
    };
  };
  message?: string;
}

export const staffService = {
  getStaffList: async (params?: any): Promise<StaffResponse> => {
    const { data } = await api.get('/staff', { params });
    return data;
  },

  getStaffById: async (id: number) => {
    const { data } = await api.get(`/staff/${id}`);
    return data;
  },

  getStaffSchedule: async (id: number) => {
    const { data } = await api.get(`/staff/${id}/schedule`);
    return data;
  },

  getPayrollEstimate: async (id: number) => {
    const { data } = await api.get(`/staff/${id}/payroll`);
    return data;
  },

  createStaff: async (staffData: any) => {
    const { data } = await api.post('/staff', staffData);
    return data;
  },

  updateStaff: async (id: number, staffData: any) => {
    const { data } = await api.put(`/staff/${id}`, staffData);
    return data;
  },

  deactivateStaff: async (id: number) => {
    const { data } = await api.delete(`/staff/${id}`);
    return data;
  },

  getStaffRoles: async () => {
    const { data } = await api.get('/staff/roles');
    return data;
  },

  createRole: async (roleData: any) => {
    const { data } = await api.post('/staff/roles', roleData);
    return data;
  },

  updateRole: async (id: number, roleData: any) => {
    const { data } = await api.put(`/staff/roles/${id}`, roleData);
    return data;
  },
};

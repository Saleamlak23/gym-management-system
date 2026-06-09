import api from './api'

export interface Branch {
  branch_id: number;
  branch_name: string;
  location: string;
  phone?: string;
  email?: string;
}

export const getBranches = async (): Promise<{
  success: boolean;
  data: { branches: Branch[] };
}> => {
  const response = await api.get('/branches');
  return response.data;
};

export const getBranch = async (branchId: number): Promise<{
  success: boolean;
  data: { branch: Branch };
}> => {
  const response = await api.get(`/branches/${branchId}`);
  return response.data;
};

export const createBranch = async (data: Omit<Branch, 'branch_id'>) => {
  const response = await api.post('/branches', data);
  return response.data;
};

export const updateBranch = async (
  branchId: number,
  data: Partial<Omit<Branch, 'branch_id'>>
) => {
  const response = await api.put(`/branches/${branchId}`, data);
  return response.data;
};

import api from '@/lib/api';

export interface TrainingSession {
  session_id: number;
  scheduled_at: string;
  duration_min: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  member_name: string;
  member_email: string;
  trainer_name: string;
  branch_name: string;
}

export interface TrainingSessionDetail extends TrainingSession {
  member_id: number;
  trainer_id: number;
  branch_id: number;
}

export const getSessions = async (filters?: {
  status?: string;
  trainerId?: number;
  date?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/training', { params: filters });
  return response.data;
};

export const getMyTrainingSessions = async () => {
  const response = await api.get('/training/mine');
  return response.data;
};

export const getTrainerSessions = async (trainerId: number) => {
  const response = await api.get(`/training/trainer/${trainerId}`);
  return response.data;
};

export const getMemberTrainingSessions = async (memberId: number) => {
  const response = await api.get(`/training/member/${memberId}`);
  return response.data;
};

export const bookSession = async (
  trainerId: number,
  scheduledAt: string,
  durationMin?: number,
  memberId?: number
) => {
  const body: any = {
    trainer_id: trainerId,
    scheduled_at: scheduledAt,
  };
  if (durationMin) body.duration_min = durationMin;
  if (memberId) body.member_id = memberId;

  const response = await api.post('/training', body);
  return response.data;
};

export const updateSessionStatus = async (
  sessionId: number,
  status: string
) => {
  const response = await api.patch(`/training/${sessionId}/status`, {
    status,
  });
  return response.data;
};

export const cancelSession = async (sessionId: number) => {
  const response = await api.delete(`/training/${sessionId}`);
  return response.data;
};

import apiClient from '@/lib/api';
import {
  ApiResponse,
  Member,
  MembersListResponse,
  UpdateMemberRequest,
  SubscriptionsResponse,
  Subscription,
  CreateSubscriptionRequest,
  PaginationParams,
} from '@/types';

const MEMBERS_BASE = '/members';

export const membersService = {
  async getMembers(params?: PaginationParams & { status?: string }) {
    const response = await apiClient.getClient().get<MembersListResponse>(`${MEMBERS_BASE}`, {
      params,
    });
    return response.data;
  },

  async getMember(id: number) {
    const response = await apiClient.getClient().get<ApiResponse<Member>>(`${MEMBERS_BASE}/${id}`);
    return response.data;
  },

  async updateMember(id: number, data: UpdateMemberRequest) {
    const response = await apiClient.getClient().put<ApiResponse<Member>>(`${MEMBERS_BASE}/${id}`, data);
    return response.data;
  },

  async deleteMember(id: number) {
    const response = await apiClient.getClient().delete<ApiResponse<void>>(`${MEMBERS_BASE}/${id}`);
    return response.data;
  },

  async getSubscriptions(memberId: number) {
    const response = await apiClient.getClient().get<SubscriptionsResponse>(`${MEMBERS_BASE}/${memberId}/subscriptions`);
    return response.data;
  },

  async createSubscription(memberId: number, data: CreateSubscriptionRequest) {
    const response = await apiClient.getClient().post<ApiResponse<Subscription>>(
      `${MEMBERS_BASE}/${memberId}/subscriptions`,
      data
    );
    return response.data;
  },

  async updateSubscriptionStatus(memberId: number, subscriptionId: number, status: string) {
    const response = await apiClient.getClient().patch<ApiResponse<Subscription>>(
      `${MEMBERS_BASE}/${memberId}/subscriptions/${subscriptionId}`,
      { status }
    );
    return response.data;
  },
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Activity } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Button } from '@/components/ui/button';
import { Member, Subscription } from '@/types';
import { membersService } from '@/services/members.service';

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscriptions'>('profile');

  useEffect(() => {
    if (id) {
      loadMemberData();
    }
  }, [id]);

  const loadMemberData = async () => {
    setLoading(true);
    try {
      const [memberRes, subsRes] = await Promise.all([
        membersService.getMember(Number(id)),
        membersService.getSubscriptions(Number(id)),
      ]);

      if (memberRes.success && memberRes.data) {
        setMember(memberRes.data as Member);
      }

      if (subsRes.success && subsRes.data?.subscriptions) {
        setSubscriptions(subsRes.data.subscriptions);
      }
    } catch (error) {
      console.error('Failed to load member:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!member) {
    return <div className="text-center py-12">Member not found</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      frozen: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <PageWrapper title={`${member.first_name} ${member.last_name}`} description="Member profile and details">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/members')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-center text-slate-900">
              {member.first_name} {member.last_name}
            </h2>
            <span className={`mt-2 inline-block w-full text-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.subscription_status)}`}>
              {member.subscription_status}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{member.email}</span>
            </div>
            {member.phone && (
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{member.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Joined {new Date(member.join_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Activity className="h-4 w-4" />
              <span className="text-sm">{member.total_visits || 0} visits</span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'subscriptions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600'
              }`}
            >
              Subscriptions
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">First Name</label>
                <p className="text-lg text-slate-900">{member.first_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Last Name</label>
                <p className="text-lg text-slate-900">{member.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="text-lg text-slate-900">{member.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Member ID</label>
                <p className="text-lg text-slate-900">{member.member_id}</p>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              {subscriptions.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                  No subscriptions found
                </div>
              ) : (
                subscriptions.map((sub) => (
                  <div key={sub.subscription_id} className="rounded-lg border border-slate-200 bg-white p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{sub.membership_title}</h3>
                        <span className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{sub.membership_price}</p>
                        <p className="text-sm text-slate-600">{sub.duration_days} days</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                      <div>
                        <p className="font-medium">Start Date</p>
                        <p>{new Date(sub.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">End Date</p>
                        <p>{new Date(sub.end_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

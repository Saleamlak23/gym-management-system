import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { useAuth } from '@/context/AuthContext';
import { getMember } from '@/services/members.service';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { getSubscriptionStatusColor } from '@/utils/status-helpers';
import { Calendar, Dumbbell, CreditCard, AlertCircle } from 'lucide-react';

export const MemberPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await getMember(user.id);
        setMember(response.data?.member);
      } catch (error) {
        console.error('Failed to fetch member:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [user?.id]);

  if (loading) {
    return <PageWrapper title="Member Portal">Loading...</PageWrapper>;
  }

  const daysRemaining = member?.subscription_end
    ? Math.ceil(
        (new Date(member.subscription_end).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const subscriptionPercentage =
    member?.subscription_start && member?.subscription_end
      ? ((new Date().getTime() - new Date(member.subscription_start).getTime()) /
          (new Date(member.subscription_end).getTime() -
            new Date(member.subscription_start).getTime())) *
        100
      : 0;

  return (
    <PageWrapper title="My Portal">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Welcome, {user?.first_name}!</h2>

        {/* Subscription Status Card */}
        {member?.subscription_status && (
          <Card className={`p-6 border-2 ${getSubscriptionStatusColor(member.subscription_status)}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Current Subscription</p>
                <h3 className="text-2xl font-bold">{member.membership_title}</h3>
              </div>
              <Badge className={getSubscriptionStatusColor(member.subscription_status)}>
                {member.subscription_status}
              </Badge>
            </div>

            {member.subscription_status === 'active' && (
              <>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Days Remaining</span>
                    <span className="font-semibold">{daysRemaining} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.max(0, 100 - subscriptionPercentage)}%` }}
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Expires: {formatDate(member.subscription_end)}
                </p>

                {daysRemaining <= 7 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      Your subscription expires soon. Renew now to avoid interruption.
                    </p>
                  </div>
                )}
              </>
            )}

            {member.subscription_status === 'expired' && (
              <Button className="w-full mt-4" size="lg">
                Renew Subscription
              </Button>
            )}
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Member Since"
            value={formatDate(member?.join_date || new Date())}
            icon={Calendar}
          />
          <StatCard
            label="Total Visits"
            value={member?.total_visits || 0}
            icon={Dumbbell}
          />
          <StatCard
            label="Monthly Fee"
            value={formatCurrency(member?.membership_price || 0)}
            icon={CreditCard}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border hover:border-blue-500 cursor-pointer transition">
            <Calendar className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">My Bookings</h3>
            <p className="text-sm text-gray-600 mb-4">View and manage class bookings</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/member/bookings')}
            >
              View Bookings
            </Button>
          </Card>

          <Card className="p-6 border hover:border-blue-500 cursor-pointer transition">
            <Dumbbell className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold mb-2">Training Sessions</h3>
            <p className="text-sm text-gray-600 mb-4">Book personal training</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/member/sessions')}
            >
              View Sessions
            </Button>
          </Card>

          <Card className="p-6 border hover:border-blue-500 cursor-pointer transition">
            <CreditCard className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold mb-2">Payment History</h3>
            <p className="text-sm text-gray-600 mb-4">View receipts and invoices</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/member/payments')}
            >
              View Payments
            </Button>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

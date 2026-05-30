import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/StatCard';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Dumbbell, Users } from 'lucide-react';

export const StaffHome = () => {
  const { user } = useAuth();

  return (
    <PageWrapper title="Staff Dashboard">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Welcome, {user?.first_name}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Today's Check-Ins"
            value="18"
            icon={Users}
            trend="↑ 5% from yesterday"
          />
          <StatCard
            label="Upcoming Classes"
            value="4"
            icon={Calendar}
            trend="Next at 2:00 PM"
          />
          <StatCard
            label="Training Sessions"
            value="2"
            icon={Dumbbell}
            trend="1 confirmed, 1 pending"
          />
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border hover:border-blue-500 cursor-pointer">
              <p className="font-medium">Check In Member</p>
              <p className="text-sm text-gray-600">Fast-track access with member search</p>
            </Card>
            <Card className="p-4 border hover:border-blue-500 cursor-pointer">
              <p className="font-medium">View Today's Schedule</p>
              <p className="text-sm text-gray-600">Classes and training sessions</p>
            </Card>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
};

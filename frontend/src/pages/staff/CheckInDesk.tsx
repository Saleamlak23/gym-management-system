import { useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { checkin, checkout } from '@/services/attendance.service';
import { useToast } from '@/hooks/use-toast';
import { Clock, LogOut, LogIn } from 'lucide-react';

export const CheckInDesk = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckIn = async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      await checkin(selectedMember.member_id, selectedMember.branch_id);
      toast({
        title: 'Success',
        description: `${selectedMember.member_name} checked in`,
      });
      setSelectedMember(null);
      setSearchTerm('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Check-in failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      await checkout(selectedMember.member_id, selectedMember.branch_id);
      toast({
        title: 'Success',
        description: `${selectedMember.member_name} checked out`,
      });
      setSelectedMember(null);
      setSearchTerm('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Check-out failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="Check-In Desk">
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-center mb-2">Member Access</h2>
            <p className="text-center text-gray-600">Search for member to check in</p>
          </div>

          <Input
            type="text"
            placeholder="Search by name or member ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xl p-4 h-auto"
            autoFocus
          />

          {selectedMember && (
            <Card className="p-6 bg-blue-50 border-blue-200 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3" />
                <h3 className="text-2xl font-bold">{selectedMember.member_name}</h3>
                <p className="text-lg font-semibold">
                  {selectedMember.subscription_status && (
                    <Badge className={selectedMember.subscription_status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                      {selectedMember.subscription_status}
                    </Badge>
                  )}
                </p>
                {selectedMember.subscription_status === 'active' && (
                  <p className="text-sm text-gray-600 mt-2">
                    Expires: {selectedMember.subscription_end_date}
                  </p>
                )}
              </div>

              {selectedMember.subscription_status === 'active' ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleCheckIn}
                    disabled={loading}
                    className="w-full h-16 text-lg bg-green-600 hover:bg-green-700"
                  >
                    <LogIn className="h-6 w-6 mr-2" />
                    Check In
                  </Button>
                  <Button
                    onClick={handleCheckOut}
                    disabled={loading}
                    variant="outline"
                    className="w-full h-16 text-lg"
                  >
                    <LogOut className="h-6 w-6 mr-2" />
                    Check Out
                  </Button>
                </div>
              ) : (
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-red-800">No Active Subscription</p>
                  <p className="text-sm text-red-700">Access denied</p>
                </div>
              )}

              <Button
                onClick={() => {
                  setSelectedMember(null);
                  setSearchTerm('');
                }}
                variant="ghost"
                className="w-full"
              >
                Clear
              </Button>
            </Card>
          )}

          {!selectedMember && searchTerm && (
            <div className="text-center text-gray-600">
              <p>Searching for members...</p>
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

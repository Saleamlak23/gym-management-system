import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getMyTrainingSessions, updateSessionStatus } from '@/services/training.service';
import { formatDateTime, formatDuration } from '@/utils/formatters';
import { getTrainingStatusColor } from '@/utils/status-helpers';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell } from 'lucide-react';

export const TrainingSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await getMyTrainingSessions();
        setSessions(response.data?.upcoming || []);
      } catch (error) {
        console.error('Failed to fetch training sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleStatusUpdate = async (sessionId: number, newStatus: string) => {
    try {
      await updateSessionStatus(sessionId, newStatus);
      setSessions((prev) =>
        prev.map((session) =>
          session.session_id === sessionId
            ? { ...session, status: newStatus }
            : session
        )
      );
      toast({
        title: 'Success',
        description: 'Session status updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update session',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <PageWrapper title="Training Sessions">Loading...</PageWrapper>;
  }

  return (
    <PageWrapper title="My Training Sessions">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Upcoming Sessions</h2>

        {sessions.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="No sessions scheduled"
            message="You have no upcoming training sessions."
          />
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.session_id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{session.member_name}</h3>
                      <Badge className={getTrainingStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDateTime(session.scheduled_at)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Duration: {formatDuration(session.duration_min)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {session.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(session.session_id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                    )}
                    {session.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(session.session_id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {['scheduled', 'confirmed'].includes(session.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleStatusUpdate(session.session_id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

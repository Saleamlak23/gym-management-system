import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getMyTrainingSessions, cancelSession } from '@/services/training.service';
import { formatDateTime, formatDuration } from '@/utils/formatters';
import { getTrainingStatusColor } from '@/utils/status-helpers';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell } from 'lucide-react';

export const MySessions = () => {
  const [sessions, setSessions] = useState<any>({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await getMyTrainingSessions();
        setSessions(response.data);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleCancel = async (sessionId: number) => {
    try {
      await cancelSession(sessionId);
      setSessions((prev) => ({
        ...prev,
        upcoming: prev.upcoming.filter((s) => s.session_id !== sessionId),
      }));
      toast({
        title: 'Success',
        description: 'Session cancelled',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel session',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <PageWrapper title="My Sessions">Loading...</PageWrapper>;
  }

  return (
    <PageWrapper title="My Training Sessions">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Upcoming Sessions</h2>

        {sessions.upcoming?.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="No training sessions booked"
            message="Book a personal training session to get started!"
            actionLabel="Book Now"
          />
        ) : (
          <div className="space-y-3">
            {sessions.upcoming?.map((session) => (
              <Card key={session.session_id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{session.trainer_name}</h3>
                      <Badge className={getTrainingStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(session.scheduled_at)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Duration: {formatDuration(session.duration_min)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleCancel(session.session_id)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {sessions.past && sessions.past.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-8">Past Sessions</h2>
            <div className="space-y-3">
              {sessions.past.map((session) => (
                <Card key={session.session_id} className="p-4 opacity-60">
                  <div>
                    <h3 className="font-semibold">{session.trainer_name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(session.scheduled_at)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
};

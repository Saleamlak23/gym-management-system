import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getMyBookings, cancelBooking } from '@/services/classes.service';
import { formatDateTime } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';

export const MyBookings = () => {
  const [bookings, setBookings] = useState<any>({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await getMyBookings();
        setBookings(response.data);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: number) => {
    try {
      await cancelBooking(bookingId);
      setBookings((prev) => ({
        ...prev,
        upcoming: prev.upcoming.filter((b) => b.booking_id !== bookingId),
      }));
      toast({
        title: 'Success',
        description: 'Booking cancelled',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <PageWrapper title="My Bookings">Loading...</PageWrapper>;
  }

  return (
    <PageWrapper title="My Class Bookings">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Upcoming Classes</h2>

        {bookings.upcoming?.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming bookings"
            message="Book a class to get started!"
            actionLabel="Browse Classes"
          />
        ) : (
          <div className="space-y-3">
            {bookings.upcoming?.map((booking) => (
              <Card key={booking.booking_id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.class_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDateTime(booking.start_time)}
                    </p>
                    <p className="text-sm text-gray-600">
                      at {booking.branch_name} · Instructor: {booking.instructor_name}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleCancel(booking.booking_id)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {bookings.past && bookings.past.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-8">Past Classes</h2>
            <div className="space-y-3">
              {bookings.past.map((booking) => (
                <Card key={booking.booking_id} className="p-4 opacity-60">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.class_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDateTime(booking.start_time)}
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

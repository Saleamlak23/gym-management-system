import { PageWrapper, Card, Table, Badge } from '../../components';
import '../../styles/bookings.css';

export function MyBookings() {
  // Mock data - in real app, fetch from API
  const bookings = [
    {
      id: 1,
      className: 'Yoga',
      instructor: 'Sarah Johnson',
      date: '2025-06-01',
      time: '8:00 AM - 9:00 AM',
      status: 'upcoming',
    },
    {
      id: 2,
      className: 'Spinning',
      instructor: 'Mike Chen',
      date: '2025-06-03',
      time: '6:30 PM - 7:30 PM',
      status: 'upcoming',
    },
    {
      id: 3,
      className: 'HIIT',
      instructor: 'Lisa Adams',
      date: '2025-05-25',
      time: '10:00 AM - 11:00 AM',
      status: 'completed',
    },
  ];

  const columns = [
    { key: 'className', label: 'Class' },
    { key: 'instructor', label: 'Instructor' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => <Badge status={v as any}>{v}</Badge>,
    },
  ];

  return (
    <PageWrapper title="My Class Bookings">
      <Card>
        <Table columns={columns} data={bookings} />
      </Card>
    </PageWrapper>
  );
}

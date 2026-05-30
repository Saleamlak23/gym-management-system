import { PageWrapper, Card, Table } from '../../components';
import '../../styles/classes.css';

export function ClassSchedule() {
  // Mock data - in real app, fetch from API
  const schedules = [
    {
      id: 1,
      className: 'Yoga',
      instructor: 'Sarah Johnson',
      branch: 'Downtown',
      date: '2025-06-01',
      time: '8:00 AM - 9:00 AM',
      bookings: 22,
      capacity: 30,
    },
    {
      id: 2,
      className: 'Spinning',
      instructor: 'Mike Chen',
      branch: 'Downtown',
      date: '2025-06-01',
      time: '6:30 PM - 7:30 PM',
      bookings: 28,
      capacity: 30,
    },
    {
      id: 3,
      className: 'HIIT',
      instructor: 'Lisa Adams',
      branch: 'Uptown',
      date: '2025-06-02',
      time: '10:00 AM - 11:00 AM',
      bookings: 18,
      capacity: 25,
    },
  ];

  const columns = [
    { key: 'className', label: 'Class' },
    { key: 'instructor', label: 'Instructor' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    {
      key: 'bookings',
      label: 'Bookings',
      render: (v: number, r: any) => `${v}/${r.capacity}`,
    },
  ];

  return (
    <PageWrapper title="Class Schedule">
      <Card>
        <Table columns={columns} data={schedules} />
      </Card>
    </PageWrapper>
  );
}

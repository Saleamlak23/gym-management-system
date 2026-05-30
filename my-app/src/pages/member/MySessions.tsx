import { PageWrapper, Card, Table, Badge } from '../../components';
import '../../styles/sessions.css';

export function MySessions() {
  // Mock data - in real app, fetch from API
  const sessions = [
    {
      id: 1,
      trainer: 'John Smith',
      date: '2025-06-02',
      time: '10:00 AM',
      duration: '1 hour',
      status: 'scheduled',
    },
    {
      id: 2,
      trainer: 'Jane Doe',
      date: '2025-06-04',
      time: '3:00 PM',
      duration: '1 hour',
      status: 'confirmed',
    },
    {
      id: 3,
      trainer: 'Mike Chen',
      date: '2025-05-28',
      time: '2:00 PM',
      duration: '1 hour',
      status: 'completed',
    },
  ];

  const columns = [
    { key: 'trainer', label: 'Trainer' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'duration', label: 'Duration' },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => <Badge status={v as any}>{v}</Badge>,
    },
  ];

  return (
    <PageWrapper title="My Training Sessions">
      <Card>
        <Table columns={columns} data={sessions} />
      </Card>
    </PageWrapper>
  );
}

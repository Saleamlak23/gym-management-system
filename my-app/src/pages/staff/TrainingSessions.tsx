import { PageWrapper, Card, Table, Badge } from '../../components';
import '../../styles/sessions.css';

export function TrainingSessions() {
  // Mock data
  const sessions = [
    {
      id: 1,
      memberName: 'John Doe',
      date: '2025-06-02',
      time: '10:00 AM',
      duration: '1 hour',
      status: 'scheduled',
    },
    {
      id: 2,
      memberName: 'Jane Smith',
      date: '2025-06-04',
      time: '3:00 PM',
      duration: '1 hour',
      status: 'confirmed',
    },
  ];

  const columns = [
    { key: 'memberName', label: 'Member' },
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
    <PageWrapper title="Training Sessions">
      <Card>
        <Table columns={columns} data={sessions} />
      </Card>
    </PageWrapper>
  );
}

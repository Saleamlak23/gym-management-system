import { PageWrapper, Card, Table } from '../../components';

export function StaffList() {
  // Mock data
  const staff = [
    { id: 1, name: 'John Smith', role: 'Trainer', branch: 'Downtown', email: 'john@gym.com' },
    { id: 2, name: 'Sarah Johnson', role: 'Trainer', branch: 'Uptown', email: 'sarah@gym.com' },
    { id: 3, name: 'Mike Chen', role: 'Receptionist', branch: 'Downtown', email: 'mike@gym.com' },
  ];

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'branch', label: 'Branch' },
    { key: 'email', label: 'Email' },
  ];

  return (
    <PageWrapper title="Staff Management">
      <Card>
        <Table columns={columns} data={staff} />
      </Card>
    </PageWrapper>
  );
}

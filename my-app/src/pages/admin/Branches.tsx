import { PageWrapper, Card, Table } from '../../components';

export function Branches() {
  const branches = [
    { id: 1, name: 'Downtown Gym', city: 'New York', members: 180, staff: 12 },
    { id: 2, name: 'Uptown Fitness', city: 'New York', members: 160, staff: 10 },
    { id: 3, name: 'West Side Sports', city: 'New York', members: 110, staff: 8 },
  ];

  const columns = [
    { key: 'name', label: 'Branch Name' },
    { key: 'city', label: 'City' },
    { key: 'members', label: 'Members' },
    { key: 'staff', label: 'Staff' },
  ];

  return (
    <PageWrapper title="Branch Management">
      <Card>
        <Table columns={columns} data={branches} />
      </Card>
    </PageWrapper>
  );
}

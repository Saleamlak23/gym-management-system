import { useState } from 'react';
import { PageWrapper, Card, Table, Badge, Modal } from '../../components';
import '../../styles/equipment.css';

export function Equipment() {
  const [showModal, setShowModal] = useState(false);
  
  const equipment = [
    {
      id: 1,
      name: 'Treadmill A1',
      category: 'Cardio',
      purchase_date: '2023-01-15',
      status: 'active',
      last_serviced: '2025-05-20',
    },
    {
      id: 2,
      name: 'Barbell Set',
      category: 'Strength',
      purchase_date: '2023-06-01',
      status: 'active',
      last_serviced: '2025-04-10',
    },
    {
      id: 3,
      name: 'Elliptical E2',
      category: 'Cardio',
      purchase_date: '2022-11-30',
      status: 'maintenance',
      last_serviced: '2025-05-15',
    },
  ];

  const columns = [
    { key: 'name', label: 'Equipment' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', render: (v: string) => <Badge status={v as any}>{v}</Badge> },
    { key: 'last_serviced', label: 'Last Serviced' },
    {
      key: 'id',
      label: 'Actions',
      render: () => <button className="action-link">Details</button>,
    },
  ];

  return (
    <PageWrapper title="Equipment Management">
      <Card>
        <div style={{ marginBottom: '1.5rem' }}>
          <button className="action-link" onClick={() => setShowModal(true)}>
            Log Maintenance
          </button>
        </div>
        <Table columns={columns} data={equipment} />
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Maintenance">
        <p>Maintenance logging form would be here</p>
      </Modal>
    </PageWrapper>
  );
}

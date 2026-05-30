import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageWrapper, Card, Input, Button, Modal, Badge, Table } from '../../components';
import { getMemberDetail } from '../../services/members.service';
import '../../styles/members.css';

type TabType = 'profile' | 'subscriptions' | 'payments' | 'attendance';

export function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadMember = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await getMemberDetail(parseInt(id));
        setMember(response.data);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load member');
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [id]);

  if (loading) return <PageWrapper title="Loading..."><p>Loading member details...</p></PageWrapper>;
  if (error) return <PageWrapper title="Error"><div className="error-banner">{error}</div></PageWrapper>;
  if (!member) return <PageWrapper title="Not Found"><p>Member not found</p></PageWrapper>;

  return (
    <PageWrapper title={`${member.first_name} ${member.last_name}`}>
      <Card>
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            Subscriptions
          </button>
          <button
            className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
          <button
            className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'profile' && (
            <div>
              <div className="form-row">
                <Input label="First Name" defaultValue={member.first_name} />
                <Input label="Last Name" defaultValue={member.last_name} />
              </div>
              <div className="form-row">
                <Input label="Email" type="email" defaultValue={member.email} />
                <Input label="Join Date" type="date" defaultValue={member.join_date} />
              </div>
              <div className="form-row full">
                <Button variant="primary">Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <Button onClick={() => setShowModal(true)}>New Subscription</Button>
              </div>
              <Table
                columns={[
                  { key: 'membership_type', label: 'Type' },
                  { key: 'start_date', label: 'Start Date' },
                  { key: 'end_date', label: 'End Date' },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (v: string) => <Badge status={v as any}>{v}</Badge>,
                  },
                ]}
                data={member.subscriptions || []}
              />
            </div>
          )}

          {activeTab === 'payments' && (
            <Table
              columns={[
                { key: 'amount', label: 'Amount' },
                { key: 'method', label: 'Method' },
                { key: 'created_at', label: 'Date' },
              ]}
              data={member.payments || []}
            />
          )}

          {activeTab === 'attendance' && (
            <Table
              columns={[
                { key: 'check_in', label: 'Check In' },
                { key: 'check_out', label: 'Check Out' },
                { key: 'branch_name', label: 'Branch' },
              ]}
              data={member.attendance || []}
            />
          )}
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Subscription">
        <div className="form-row full">
          <select className="form-select">
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Annual</option>
            <option>Day Pass</option>
          </select>
        </div>
        <div className="form-row full">
          <Input label="Start Date" type="date" />
        </div>
        <Button variant="primary" style={{ width: '100%' }}>Create Subscription</Button>
      </Modal>
    </PageWrapper>
  );
}

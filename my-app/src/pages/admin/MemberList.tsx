import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, Table, Badge, Card, Input } from '../../components';
import { getMembersList } from '../../services/members.service';
import '../../styles/members.css';

export function MemberList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const response = await getMembersList(search || undefined, status || undefined);
        setMembers(response.data || []);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadMembers, 300);
    return () => clearTimeout(timer);
  }, [search, status]);

  const columns = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'join_date', label: 'Join Date' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <Badge status={value as any}>{value}</Badge>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value: number) => (
        <button
          className="action-link"
          onClick={() => navigate(`/admin/members/${value}`)}
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <PageWrapper title="Members Management">
      {error && <div className="error-banner">{error}</div>}

      <Card>
        <div className="filters-section">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <Table
          columns={columns}
          data={members}
          loading={loading}
        />
      </Card>
    </PageWrapper>
  );
}

import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPaymentIntents } from '@/services/chapa.service';
import { formatDateTime, formatCurrency } from '@/utils/formatters';
import { CreditCard } from 'lucide-react';

export const OnlinePaymentsPage = () => {
  const [intents, setIntents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntents = async () => {
      try {
        setLoading(true);
        const response = await getPaymentIntents();
        setIntents(response.data?.intents || []);
      } catch (error) {
        console.error('Failed to fetch payment intents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIntents();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <PageWrapper title="Online Payments">Loading...</PageWrapper>;
  }

  return (
    <PageWrapper title="Online Payments (Chapa)">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Payment Intents & Transactions</h2>

        {intents.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No online payments yet"
            message="Online payment transactions will appear here."
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Transaction Ref</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Member</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {intents.map((intent) => (
                    <tr key={intent.tx_ref} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-xs">{intent.tx_ref}</td>
                      <td className="px-6 py-4 text-sm">{intent.member_name}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {formatCurrency(intent.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge className={getStatusColor(intent.status)}>
                          {intent.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDateTime(intent.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

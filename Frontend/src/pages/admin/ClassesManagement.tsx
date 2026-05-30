import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getClasses } from '@/services/classes.service';
import { Calendar, Plus } from 'lucide-react';

export const ClassesManagement = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await getClasses();
        setClasses(response.data?.classes || []);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return <PageWrapper title="Classes Management">Loading...</PageWrapper>;
  }

  return (
    <PageWrapper title="Classes & Schedules">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Class Templates</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        </div>

        {classes.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No classes yet"
            message="Create your first class template to get started."
            actionLabel="Create Class"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <Card key={cls.class_id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{cls.class_name}</h3>
                  <Badge variant="secondary">{cls.capacity} capacity</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">{cls.description}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Schedule Session
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

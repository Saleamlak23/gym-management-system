import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Building2, Plus } from 'lucide-react';
import { Branch } from '@/services/branches.service';

export const BranchesPage = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch branches from API when backend is ready
    // For now, use placeholder
    setLoading(false);
  }, []);

  if (loading) {
    return <PageWrapper title="Branches">Loading...</PageWrapper>;
  }

  return (
    <PageWrapper title="Branches">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Branch Locations</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        </div>

        {branches.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No branches yet"
            message="Start by adding your first gym branch location."
            actionLabel="Add Branch"
          />
        ) : (
          <div className="grid gap-4">
            {branches.map((branch) => (
              <Card key={branch.branch_id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{branch.branch_name}</h3>
                    <p className="text-sm text-gray-600">{branch.location}</p>
                    {branch.phone && (
                      <p className="text-sm text-gray-600">{branch.phone}</p>
                    )}
                    {branch.email && (
                      <p className="text-sm text-gray-600">{branch.email}</p>
                    )}
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

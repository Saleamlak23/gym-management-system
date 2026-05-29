import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportData {
  filename: string;
  data: any[];
}

export const useExportData = () => {
  const exportToCSV = (filename: string, data: any[]) => {
    if (!data || data.length === 0) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (filename: string, data: any[]) => {
    if (!data || data.length === 0) return;

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { exportToCSV, exportToJSON };
};

export const ExportButton: React.FC<{
  filename: string;
  data: any[];
  format?: 'csv' | 'json' | 'both';
}> = ({ filename, data, format = 'csv' }) => {
  const { exportToCSV, exportToJSON } = useExportData();

  if (format === 'both') {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCSV(filename, data)}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToJSON(filename, data)}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => format === 'csv' ? exportToCSV(filename, data) : exportToJSON(filename, data)}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Export {format.toUpperCase()}
    </Button>
  );
};

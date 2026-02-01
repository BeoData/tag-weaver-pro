import { ProcessingReport } from '@/types/mp3';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, AlertTriangle, CheckCircle, FileSpreadsheet, FileType, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProcessingReportViewProps {
  report: ProcessingReport;
  onDownload?: () => void;
  onUpgradeClick?: () => void;
}

export function ProcessingReportView({ report, onDownload, onUpgradeClick }: ProcessingReportViewProps) {
  const { getTierLimits } = useAuth();
  const tierLimits = getTierLimits();

  const exportCSV = () => {
    // CSV Header
    const rows = [['File', 'Field', 'Old Value', 'New Value', 'Category']];

    // Metadata Changes
    for (const change of report.changes) {
      rows.push([
        report.fileName,
        change.field,
        change.oldValue || '',
        change.newValue || '',
        'Metadata Change'
      ]);
    }

    // Removed Frames
    for (const frame of report.removedFrames) {
      rows.push([
        report.fileName,
        frame.id,
        frame.value || '',
        '(Removed)',
        `AI/Software Removal: ${frame.name}`
      ]);
    }

    // Escape CSV fields
    const csvContent = rows.map(e => e.map(item => {
      const stringItem = String(item);
      // If contains comma, quote, or newline, wrap in quotes and escape quotes
      if (/[",\n]/.test(stringItem)) {
        return `"${stringItem.replace(/"/g, '""')}"`;
      }
      return stringItem;
    }).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${report.fileName.replace('.mp3', '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTXT = () => {
    const lines: string[] = [
      '='.repeat(60),
      'MP3 METADATA PROCESSING REPORT',
      '='.repeat(60),
      '',
      `File: ${report.fileName}`,
      `Processed: ${report.timestamp.toLocaleString()}`,
      '',
      '-'.repeat(60),
      'METADATA CHANGES',
      '-'.repeat(60),
    ];

    for (const change of report.changes) {
      lines.push(`${change.field}:`);
      lines.push(`  Before: ${change.oldValue || '(empty)'}`);
      lines.push(`  After:  ${change.newValue || '(empty)'}`);
      lines.push('');
    }

    if (report.removedFrames.length > 0) {
      lines.push('-'.repeat(60));
      lines.push('REMOVED AI/SOFTWARE FRAMES');
      lines.push('-'.repeat(60));

      for (const frame of report.removedFrames) {
        lines.push(`• ${frame.name} (${frame.id})`);
        lines.push(`  Reason: ${frame.reason}`);
        if (frame.value) {
          lines.push(`  Value: ${frame.value}`);
        }
        lines.push('');
      }
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${report.fileName.replace('.mp3', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-sm text-foreground">Processing Report</h3>
        </div>

        {tierLimits.canExportReports ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportTXT}>
                <FileType className="w-4 h-4 mr-2" />
                <span>Export as TXT</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onUpgradeClick}
          >
            <Lock className="w-4 h-4 mr-2" />
            Export (Upgrade)
          </Button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Metadata Changes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-success" />
            <h4 className="text-sm font-medium">Metadata Changes ({report.changes.length})</h4>
          </div>

          {report.changes.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[120px]">Field</TableHead>
                    <TableHead>Before</TableHead>
                    <TableHead>After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.changes.map((change, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{change.field}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {change.oldValue || <span className="italic">(empty)</span>}
                      </TableCell>
                      <TableCell className="text-success">
                        {change.newValue || <span className="italic">(empty)</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No changes made.</p>
          )}
        </div>

        {/* Removed Frames */}
        {report.removedFrames.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h4 className="text-sm font-medium">Removed AI/Software Frames ({report.removedFrames.length})</h4>
            </div>

            <div className="space-y-2">
              {report.removedFrames.map((frame, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-muted/20 p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs font-mono">
                      {frame.id}
                    </Badge>
                    <span className="text-sm font-medium">{frame.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{frame.reason}</p>
                  {frame.value && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                      Value: {frame.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

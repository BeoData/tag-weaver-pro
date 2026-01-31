import { ProcessingReport } from '@/types/mp3';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProcessingReportViewProps {
  report: ProcessingReport;
  onDownload?: () => void;
}

export function ProcessingReportView({ report, onDownload }: ProcessingReportViewProps) {
  const exportReport = () => {
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
        <Button variant="outline" size="sm" onClick={exportReport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
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

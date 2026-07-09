import React from 'react';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIDetectionDisplayProps {
  isLikelyAI: boolean;
  confidence: number;
  detectedPatterns: string[];
}

export function AIDetectionDisplay({ isLikelyAI, confidence, detectedPatterns }: AIDetectionDisplayProps) {
  const confidencePercent = Math.round(confidence * 100);
  const confidenceColor = confidence > 0.7 ? 'bg-destructive' : confidence > 0.5 ? 'bg-warning' : 'bg-success';

  if (!isLikelyAI && confidence < 0.3) {
    return (
      <Alert className="border-success/50 bg-success/5">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <AlertTitle>Original Audio Detected</AlertTitle>
        <AlertDescription>
          This appears to be legitimately created audio with no AI generation indicators.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={isLikelyAI ? 'border-destructive/50 bg-destructive/5' : 'border-warning/50 bg-warning/5'}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {isLikelyAI ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <Sparkles className="h-4 w-4 text-warning" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <AlertTitle className="text-base">
              {isLikelyAI ? '🤖 AI-Generated Audio Detected' : '⚠️ Suspicious Patterns Found'}
            </AlertTitle>
            <Badge className={`${confidenceColor} text-white`}>
              {confidencePercent}% confidence
            </Badge>
          </div>

          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${confidenceColor}`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>

          {detectedPatterns.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-sm font-medium">Detected indicators:</p>
              <ul className="space-y-1">
                {detectedPatterns.slice(0, 5).map((pattern, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {pattern}
                  </li>
                ))}
              </ul>
              {detectedPatterns.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  +{detectedPatterns.length - 5} more patterns detected
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            {isLikelyAI
              ? 'AI traces will be automatically cleaned during processing.'
              : 'Review metadata manually if needed.'}
          </p>
        </div>
      </div>
    </Alert>
  );
}

export function AIDetectionCard({ result }: { result: { isLikelyAI: boolean; confidence: number; detectedPatterns: string[] } | undefined }) {
  if (!result) return null;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AIDetectionDisplay
          isLikelyAI={result.isLikelyAI}
          confidence={result.confidence}
          detectedPatterns={result.detectedPatterns}
        />
      </CardContent>
    </Card>
  );
}

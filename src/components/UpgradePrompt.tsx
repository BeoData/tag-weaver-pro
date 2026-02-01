import { Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
    feature: string;
    requiredTier: 'basic' | 'pro';
    onUpgradeClick: () => void;
}

export function UpgradePrompt({ feature, requiredTier, onUpgradeClick }: UpgradePromptProps) {
    const tierName = requiredTier === 'basic' ? 'Basic' : 'Pro';

    return (
        <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/50">
            <CardHeader className="text-center pb-3">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Upgrade to {tierName}</CardTitle>
                <CardDescription>
                    {feature} is available on the {tierName} plan
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
                <Button onClick={onUpgradeClick} size="sm" className="w-full">
                    View Pricing Plans
                </Button>
            </CardContent>
        </Card>
    );
}

import { Check, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const tiers = [
    {
        name: 'Free',
        tier: 'free' as const,
        price: '$0',
        description: 'Perfect for trying out the app',
        features: [
            { name: 'Single file upload', included: true },
            { name: 'Full metadata editing', included: true },
            { name: 'Waveform visualization', included: true },
            { name: 'BPM/Key detection', included: true },
            { name: 'Bulk upload', included: false },
            { name: 'Bulk processing', included: false },
            { name: 'Report export', included: false },
            { name: 'Download with tags', included: false },
        ],
    },
    {
        name: 'Basic',
        tier: 'basic' as const,
        price: '$9.99',
        period: '/month',
        description: 'For DJs managing their collection',
        popular: true,
        features: [
            { name: 'Up to 10 files bulk upload', included: true },
            { name: 'Full metadata editing', included: true },
            { name: 'Waveform visualization', included: true },
            { name: 'BPM/Key detection', included: true },
            { name: 'Bulk processing', included: true },
            { name: 'Report export (CSV/TXT)', included: true },
            { name: 'Download with tags', included: true },
            { name: 'Batch download (zip)', included: false },
        ],
    },
    {
        name: 'Pro',
        tier: 'pro' as const,
        price: '$19.99',
        period: '/month',
        description: 'For professionals and power users',
        features: [
            { name: 'Unlimited file uploads', included: true },
            { name: 'Full metadata editing', included: true },
            { name: 'Waveform visualization', included: true },
            { name: 'BPM/Key detection', included: true },
            { name: 'Bulk processing', included: true },
            { name: 'Report export (CSV/TXT)', included: true },
            { name: 'Download with tags', included: true },
            { name: 'Batch download (zip)', included: true },
            { name: 'Priority processing', included: true },
            { name: 'Advanced presets', included: true },
            { name: 'Raw tag inspector', included: true },
        ],
    },
];

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
    const handleUpgrade = (tier: string) => {
        // TODO: Implement payment flow
        console.log('Upgrade to:', tier);
        alert(`Payment integration coming soon! Selected tier: ${tier}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
                    <DialogDescription>
                        Unlock powerful features to streamline your music library management
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 md:grid-cols-3 mt-6">
                    {tiers.map((tier) => (
                        <Card
                            key={tier.tier}
                            className={`relative ${tier.popular ? 'border-primary shadow-lg' : ''
                                }`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge variant="default">Most Popular</Badge>
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{tier.name}</CardTitle>
                                    <Badge variant={tier.tier}>{tier.tier.toUpperCase()}</Badge>
                                </div>
                                <CardDescription className="min-h-[40px]">
                                    {tier.description}
                                </CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    {tier.period && (
                                        <span className="text-muted-foreground">{tier.period}</span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-6">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            {feature.included ? (
                                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                            ) : (
                                                <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                            )}
                                            <span
                                                className={
                                                    feature.included
                                                        ? 'text-sm'
                                                        : 'text-sm text-muted-foreground'
                                                }
                                            >
                                                {feature.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="w-full"
                                    variant={tier.tier === 'free' ? 'outline' : 'default'}
                                    onClick={() => handleUpgrade(tier.tier)}
                                    disabled={tier.tier === 'free'}
                                >
                                    {tier.tier === 'free' ? 'Current Plan' : 'Upgrade Now'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>All plans include 14-day money-back guarantee</p>
                    <p className="mt-1">Cancel anytime, no questions asked</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

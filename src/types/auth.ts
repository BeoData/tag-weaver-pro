export type UserTier = 'free' | 'basic' | 'pro';

export interface User {
    id: string;
    email: string;
    tier: UserTier;
    isAuthenticated: boolean;
}

export interface TierLimits {
    maxFiles: number;
    canBulkProcess: boolean;
    canExportReports: boolean;
    canDownloadFiles: boolean;
    canBatchDownload: boolean;
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
    free: {
        maxFiles: 1,
        canBulkProcess: false, // Cannot use "Process All" button
        canExportReports: true, // Can export report for their single file
        canDownloadFiles: true, // Can download their single processed file
        canBatchDownload: false,
    },
    basic: {
        maxFiles: 10,
        canBulkProcess: true,
        canExportReports: true,
        canDownloadFiles: true,
        canBatchDownload: false,
    },
    pro: {
        maxFiles: Infinity,
        canBulkProcess: true,
        canExportReports: true,
        canDownloadFiles: true,
        canBatchDownload: true,
    },
};

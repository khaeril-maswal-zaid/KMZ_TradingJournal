import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { statusLabel } from '@/lib/trading';
import type { AnalysisStatus } from '@/types/trading';

export function ProfitBadge({
    status,
    className,
}: {
    status: AnalysisStatus;
    className?: string;
}) {
    return (
        <Badge
            className={cn(
                'border text-xs',
                status === 'PROFIT' &&
                    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
                status === 'LOSS' &&
                    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300',
                status === 'BREAK_EVEN' &&
                    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
                className,
            )}
            variant="outline"
        >
            {statusLabel(status)}
        </Badge>
    );
}

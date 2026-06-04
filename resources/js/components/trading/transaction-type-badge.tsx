import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TransactionType } from '@/types/trading';

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'border text-xs font-medium lowercase',
                type === 'BUY'
                    ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300'
                    : 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300',
            )}
        >
            {type}
        </Badge>
    );
}

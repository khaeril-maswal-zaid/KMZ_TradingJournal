import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
    invalidCount: number;
    totalCount: number;
};

export function ValidationBadge({ invalidCount, totalCount }: Props) {
    const isValid = totalCount > 0 && invalidCount === 0;

    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1.5 rounded-md px-2.5 py-1',
                isValid
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
            )}
        >
            {isValid ? (
                <CheckCircle2 className="size-3.5" />
            ) : (
                <AlertCircle className="size-3.5" />
            )}
            {isValid ? 'Siap import' : `${invalidCount} baris perlu diperiksa`}
        </Badge>
    );
}

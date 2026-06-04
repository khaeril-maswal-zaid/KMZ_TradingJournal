import { TransactionImportSummary } from '@/types/transactions';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    CheckCircle2,
    Rows3,
} from 'lucide-react';

type Props = {
    summary: TransactionImportSummary;
};

const items = [
    {
        key: 'filledRows',
        label: 'Total Baris',
        icon: Rows3,
        className: 'text-sky-600 dark:text-sky-300',
    },
    {
        key: 'buyRows',
        label: 'Total Beli',
        icon: ArrowDownToLine,
        className: 'text-emerald-600 dark:text-emerald-300',
    },
    {
        key: 'sellRows',
        label: 'Total Jual',
        icon: ArrowUpFromLine,
        className: 'text-rose-600 dark:text-rose-300',
    },
    {
        key: 'validRows',
        label: 'Baris Valid',
        icon: CheckCircle2,
        className: 'text-violet-600 dark:text-violet-300',
    },
] as const;

export function ImportSummaryCards({ summary }: Props) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map(({ key, label, icon: Icon, className }) => (
                <div
                    key={key}
                    className="rounded-lg border bg-card p-4 shadow-xs transition-colors hover:bg-muted/30"
                >
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-muted-foreground">
                            {label}
                        </span>
                        <Icon className={className} />
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-normal">
                        {summary[key]}
                    </p>
                </div>
            ))}
        </div>
    );
}

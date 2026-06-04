import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ProfitCard({
    title,
    value,
    helper,
    icon: Icon,
    tone = 'neutral',
}: {
    title: string;
    value: string;
    helper?: string;
    icon: LucideIcon;
    tone?: 'neutral' | 'green' | 'red' | 'blue' | 'amber';
}) {
    const tones = {
        neutral:
            'bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300',
        green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        red: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        blue: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
        amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    };

    return (
        <Card className="rounded-lg border-border/70 shadow-xs">
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0 space-y-2">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="truncate text-2xl font-semibold tracking-normal">
                        {value}
                    </p>
                    {helper && (
                        <p className="text-xs text-muted-foreground">
                            {helper}
                        </p>
                    )}
                </div>
                <div className={cn('rounded-md p-2', tones[tone])}>
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

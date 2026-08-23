import { Card, CardContent } from '@/components/ui/card';

export function HistoryCard({
    title,
    value,
    helper,
}: {
    title: string;
    value: string;
    helper?: string;
}) {
    return (
        <Card className="rounded-lg border-border/70 py-0 shadow-xs">
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0 space-y-2">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="truncate text-lg font-semibold tracking-normal">
                        {value}
                    </p>
                    {helper && (
                        <p className="text-xs text-muted-foreground">
                            {helper}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

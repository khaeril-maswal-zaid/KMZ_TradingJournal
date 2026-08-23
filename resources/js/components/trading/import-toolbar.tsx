import { Plus, RotateCcw, Upload } from 'lucide-react';
import { ValidationBadge } from '@/components/trading/validation-badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { TransactionImportSummary } from '@/types/transactions';

type Props = {
    summary: TransactionImportSummary;
    processing: boolean;
    onAddRow: () => void;
    onClearRows: () => void;
    onImport: () => void;
};

export function ImportToolbar({
    summary,
    processing,
    onAddRow,
    onClearRows,
    onImport,
}: Props) {
    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
                <ValidationBadge
                    invalidCount={summary.invalidRows}
                    totalCount={summary.filledRows}
                />
                <span className="text-sm text-muted-foreground">
                    {summary.filledRows === 0
                        ? 'Belum ada data transaksi'
                        : `${summary.filledRows} baris terisi`}
                </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={onAddRow}>
                    <Plus className="size-4" />
                    Tambah Baris
                </Button>
                <Button variant="outline" size="sm" onClick={onClearRows}>
                    <RotateCcw className="size-4" />
                    Bersihkan
                </Button>
                <Button
                    size="sm"
                    onClick={onImport}
                    disabled={processing || summary.filledRows === 0}
                >
                    {processing ? (
                        <Spinner className="size-4" />
                    ) : (
                        <Upload className="size-4" />
                    )}
                    Impor
                </Button>
            </div>
        </div>
    );
}

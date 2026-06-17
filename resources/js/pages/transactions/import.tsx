import { Head, router, usePage } from '@inertiajs/react';
import { Table2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { EditableTransactionTable } from '@/components/trading/editable-transaction-table';
import { ImportSummaryCards } from '@/components/trading/import-summary-cards';
import { ImportToolbar } from '@/components/trading/import-toolbar';

import { useTransactionImportTable } from '@/hooks/use-transaction-import-table';
import { BreadcrumbItem } from '@/types';
import { importstore } from '@/routes/transactions';
import { index } from '@/routes/transactions';
import { Button } from '@/components/ui/button';

export default function TransactionsImport() {
    const {
        version,
        switchVersion,
        rows,
        rowsV2,
        rowErrors,
        rowErrorsV2,
        payload,
        payloadIndexByRowId,
        summary,
        addRow,
        addRowV2,
        removeRow,
        removeRowV2,
        clearRows,
        clearRowsV2,
        updateCell,
        updateCellV2,
        pasteCells,
        pasteCellsV2,
    } = useTransactionImportTable();

    const page = usePage();
    const { errors = {} } = page.props as unknown as {
        errors?: Record<string, string>;
    };
    const [processing, setProcessing] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    const handleImport = (): void => {
        setShowValidation(true);

        if (summary.filledRows === 0) {
            toast.error('Data transaksi wajib diisi.');

            return;
        }

        if (summary.invalidRows > 0) {
            toast.error('Periksa kembali sel yang ditandai.');
            return;
        }

        router.post(
            importstore.url(),
            { transactions: payload },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
                onSuccess: () => {
                    clearRows();
                    clearRowsV2();
                    setShowValidation(false);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const currentRows = version === 'v1' ? rows : rowsV2;
    const currentRowErrors = version === 'v1' ? rowErrors : rowErrorsV2;
    const currentAddRow = version === 'v1' ? addRow : addRowV2;
    const currentRemoveRow = version === 'v1' ? removeRow : removeRowV2;
    const currentClearRows = version === 'v1' ? clearRows : clearRowsV2;
    const currentUpdateCell = version === 'v1' ? updateCell : updateCellV2;
    const currentPasteCells = version === 'v1' ? pasteCells : pasteCellsV2;

    return (
        <>
            <Head title="Import Data" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-xs">
                            <Table2 className="size-3.5" />
                            Lembar Impor
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                                Import Data Transaksi
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                Tinjau baris trading sebelum masuk ke jurnal.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => switchVersion('v1')}
                            className={`rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 transition-colors ${
                                version === 'v1'
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-input bg-background hover:bg-accent'
                            }`}
                        >
                            Format V1
                        </Button>
                        <Button
                            onClick={() => switchVersion('v2')}
                            className={`rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 transition-colors ${
                                version === 'v2'
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-input bg-background hover:bg-accent'
                            }`}
                        >
                            Format V2
                        </Button>
                    </div>
                </div>

                <ImportSummaryCards summary={summary} />

                <ImportToolbar
                    summary={summary}
                    processing={processing}
                    onAddRow={currentAddRow}
                    onClearRows={currentClearRows}
                    onImport={handleImport}
                />

                <EditableTransactionTable
                    version={version}
                    rows={currentRows as any}
                    rowErrors={currentRowErrors as any}
                    payloadIndexByRowId={payloadIndexByRowId}
                    serverErrors={errors}
                    showValidation={showValidation}
                    processing={processing}
                    onChange={currentUpdateCell as any}
                    onPasteCells={currentPasteCells as any}
                    onAddRow={currentAddRow}
                    onRemoveRow={currentRemoveRow}
                />
            </div>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaksi',
        href: index.url(),
    },
    {
        title: 'Import Data',
        href: index.url(),
    },
];

TransactionsImport.layout = {
    breadcrumbs,
};

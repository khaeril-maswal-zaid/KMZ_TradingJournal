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

const importUrl = '/transactions/import';

export default function TransactionsImport() {
    const {
        rows,
        rowErrors,
        payload,
        payloadIndexByRowId,
        summary,
        addRow,
        removeRow,
        clearRows,
        updateCell,
        pasteCells,
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
                onError: (er) => toast.error('Data transaksi tidak valid.'),
                onSuccess: () => {
                    clearRows();
                    setShowValidation(false);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

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
                </div>

                <ImportSummaryCards summary={summary} />

                <ImportToolbar
                    summary={summary}
                    processing={processing}
                    onAddRow={addRow}
                    onClearRows={clearRows}
                    onImport={handleImport}
                />

                <EditableTransactionTable
                    rows={rows}
                    rowErrors={rowErrors}
                    payloadIndexByRowId={payloadIndexByRowId}
                    serverErrors={errors}
                    showValidation={showValidation}
                    processing={processing}
                    onChange={updateCell}
                    onPasteCells={pasteCells}
                    onAddRow={addRow}
                    onRemoveRow={removeRow}
                />
            </div>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaksi',
        href: importUrl,
    },
    {
        title: 'Import Data',
        href: importUrl,
    },
];

TransactionsImport.layout = {
    breadcrumbs,
};

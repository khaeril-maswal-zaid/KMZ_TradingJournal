import { Head, router } from '@inertiajs/react';
import { Loader2, UploadCloud } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    EditableTransactionTable,
    createEmptyImportRow,
    type ImportRow,
} from '@/components/trading/editable-transaction-table';
import { ProfitCard } from '@/components/trading/profit-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { normalizeDecimalInput } from '@/lib/trading';

type RowErrorMap = Record<string, string>;

function hasRowValue(row: ImportRow): boolean {
    return Object.entries(row).some(
        ([key, value]) => key !== 'id' && value.trim() !== '',
    );
}

function toNumber(value: string): number {
    return Number(normalizeDecimalInput(value));
}

function validateRows(rows: ImportRow[]): RowErrorMap {
    const errors: RowErrorMap = {};

    rows.forEach((row, index) => {
        if (!hasRowValue(row)) {
            return;
        }

        const requiredFields: (keyof ImportRow)[] = [
            'executed_at',
            'pair',
            'base_asset',
            'quote_asset',
            'type',
            'price',
            'amount',
            'total',
        ];

        requiredFields.forEach((field) => {
            if (!row[field].trim()) {
                errors[`${index}.${field}`] =
                    `${field === 'executed_at' ? 'Tanggal' : 'Kolom'} wajib diisi.`;
            }
        });

        if (row.type && row.type !== 'BUY' && row.type !== 'SELL') {
            errors[`${index}.type`] = 'Tipe harus BUY atau SELL.';
        }

        (
            ['price', 'amount', 'total', 'fee_amount'] as (keyof ImportRow)[]
        ).forEach((field) => {
            if (row[field] && Number.isNaN(toNumber(row[field]))) {
                errors[`${index}.${field}`] = 'Nilai harus berupa angka.';
            }
        });
    });

    return errors;
}

function mapServerErrors(errors: Record<string, string>): RowErrorMap {
    return Object.fromEntries(
        Object.entries(errors).map(([key, value]) => [
            key.replace(/^transactions\./, ''),
            value,
        ]),
    );
}

export default function ImportTransactions() {
    const [rows, setRows] = useState<ImportRow[]>([
        createEmptyImportRow(),
        createEmptyImportRow(),
        createEmptyImportRow(),
    ]);
    const [errors, setErrors] = useState<RowErrorMap>({});
    const [processing, setProcessing] = useState(false);

    const filledRows = useMemo(() => rows.filter(hasRowValue), [rows]);
    const totalBuy = useMemo(
        () =>
            filledRows
                .filter((row) => row.type === 'BUY')
                .reduce(
                    (total, row) =>
                        total +
                        (Number.isNaN(toNumber(row.total))
                            ? 0
                            : toNumber(row.total)),
                    0,
                ),
        [filledRows],
    );
    const totalSell = useMemo(
        () =>
            filledRows
                .filter((row) => row.type === 'SELL')
                .reduce(
                    (total, row) =>
                        total +
                        (Number.isNaN(toNumber(row.total))
                            ? 0
                            : toNumber(row.total)),
                    0,
                ),
        [filledRows],
    );

    const handleImport = (): void => {
        const validationErrors = validateRows(rows);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (filledRows.length === 0) {
            setErrors({
                '0.executed_at': 'Minimal satu transaksi wajib diisi.',
            });
            return;
        }

        setProcessing(true);
        setErrors({});

        router.post(
            '/transactions/import',
            {
                transactions: filledRows.map((row) => ({
                    executed_at: row.executed_at,
                    pair: row.pair,
                    base_asset: row.base_asset,
                    quote_asset: row.quote_asset,
                    type: row.type,
                    price: normalizeDecimalInput(row.price),
                    amount: normalizeDecimalInput(row.amount),
                    total: normalizeDecimalInput(row.total),
                    fee_amount: row.fee_amount
                        ? normalizeDecimalInput(row.fee_amount)
                        : '0',
                    fee_coin: row.fee_coin,
                })),
            },
            {
                preserveScroll: true,
                onError: (serverErrors) =>
                    setErrors(mapServerErrors(serverErrors)),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <Head title="Import Data" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                            Import Data
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tempel data dari Excel, Google Sheets, atau export
                            Binance langsung ke tabel.
                        </p>
                    </div>
                    <Button onClick={handleImport} disabled={processing}>
                        {processing ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <UploadCloud className="size-4" />
                        )}
                        Import Transaksi
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <ProfitCard
                        title="Total Row"
                        value={filledRows.length.toString()}
                        helper="Baris yang memiliki isi"
                        icon={UploadCloud}
                    />
                    <ProfitCard
                        title="Total BUY"
                        value={`${totalBuy.toLocaleString('id-ID', { maximumFractionDigits: 2 })} USDT`}
                        helper="Preview modal keluar"
                        icon={UploadCloud}
                        tone="blue"
                    />
                    <ProfitCard
                        title="Total SELL"
                        value={`${totalSell.toLocaleString('id-ID', { maximumFractionDigits: 2 })} USDT`}
                        helper="Preview uang kembali"
                        icon={UploadCloud}
                        tone="green"
                    />
                </div>

                <EditableTransactionTable
                    rows={rows}
                    onRowsChange={setRows}
                    errors={errors}
                    loading={processing}
                />

                <Card className="rounded-lg border-dashed shadow-xs">
                    <CardContent className="p-4 text-sm text-muted-foreground">
                        Klik cell pertama lalu paste data tabular. Baris baru
                        otomatis dibuat, angka koma seperti 0,0008 akan
                        dinormalisasi saat import.
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ImportTransactions.layout = {
    breadcrumbs: [
        { title: 'Transaksi', href: '/transactions' },
        { title: 'Import Data', href: '/transactions/import' },
    ],
};

import {
    TransactionImportColumn,
    TransactionImportField,
    TransactionImportPayload,
    TransactionImportRow,
    TransactionImportSummary,
} from '@/types/transactions';
import { useMemo, useState } from 'react';

export const transactionImportColumns: TransactionImportColumn[] = [
    {
        key: 'executed_at',
        label: 'Tanggal (UTC)',
        placeholder: '2026-05-29 09:15:00',
        width: 'min-w-44',
    },
    {
        key: 'pair',
        label: 'Pair',
        placeholder: 'BTCUSDT',
        width: 'min-w-28',
    },
    {
        key: 'base_asset',
        label: 'Aset Dasar',
        placeholder: 'BTC',
        width: 'min-w-28',
    },
    {
        key: 'quote_asset',
        label: 'Aset Kuotasi',
        placeholder: 'USDT',
        width: 'min-w-28',
    },
    {
        key: 'type',
        label: 'Tipe',
        placeholder: 'BUY',
        width: 'min-w-24',
    },
    {
        key: 'price',
        label: 'Harga',
        placeholder: '65000,50',
        width: 'min-w-32',
        align: 'right',
    },
    {
        key: 'amount',
        label: 'Jumlah',
        placeholder: '0,0008',
        width: 'min-w-32',
        align: 'right',
    },
    {
        key: 'total',
        label: 'Total',
        placeholder: '52.00',
        width: 'min-w-32',
        align: 'right',
    },
    {
        key: 'fee_amount',
        label: 'Biaya',
        placeholder: '0,02',
        width: 'min-w-28',
        align: 'right',
    },
    {
        key: 'fee_coin',
        label: 'Koin Fee',
        placeholder: 'USDT',
        width: 'min-w-28',
    },
];

const requiredFields: TransactionImportField[] = [
    'executed_at',
    'pair',
    'base_asset',
    'quote_asset',
    'type',
    'price',
    'amount',
    'total',
];

const decimalFields: TransactionImportField[] = [
    'price',
    'amount',
    'total',
    'fee_amount',
];

const createId = (): string =>
    globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2, 12);

const createEmptyRow = (): TransactionImportRow => ({
    id: createId(),
    executed_at: '',
    pair: '',
    base_asset: '',
    quote_asset: '',
    type: '',
    price: '',
    amount: '',
    total: '',
    fee_amount: '',
    fee_coin: '',
});

const createRows = (count: number): TransactionImportRow[] =>
    Array.from({ length: count }, createEmptyRow);

export const normalizeDecimalInput = (value: string): string => {
    let normalized = value.trim().replace(/\s/g, '');

    if (normalized.includes(',') && normalized.includes('.')) {
        normalized =
            normalized.lastIndexOf(',') > normalized.lastIndexOf('.')
                ? normalized.replace(/\./g, '').replace(',', '.')
                : normalized.replace(/,/g, '');
    } else {
        normalized = normalized.replace(',', '.');
    }

    return normalized;
};

export const isImportRowEmpty = (row: TransactionImportRow): boolean =>
    transactionImportColumns.every(({ key }) => row[key].trim() === '');

export const validateImportRow = (
    row: TransactionImportRow,
): Partial<Record<TransactionImportField, string>> => {
    if (isImportRowEmpty(row)) {
        return {};
    }

    const errors: Partial<Record<TransactionImportField, string>> = {};

    requiredFields.forEach((field) => {
        if (!row[field].trim()) {
            errors[field] = 'Wajib diisi';
        }
    });

    if (row.executed_at.trim() && Number.isNaN(Date.parse(row.executed_at))) {
        errors.executed_at = 'Tanggal tidak valid';
    }

    if (row.type.trim() && !['BUY', 'SELL'].includes(row.type.toUpperCase())) {
        errors.type = 'Gunakan BUY atau SELL';
    }

    decimalFields.forEach((field) => {
        const value = row[field].trim();

        if (value && Number.isNaN(Number(normalizeDecimalInput(value)))) {
            errors[field] = 'Angka tidak valid';
        }
    });

    return errors;
};

export function useTransactionImportTable(initialRows = 8) {
    const [rows, setRows] = useState<TransactionImportRow[]>(() =>
        createRows(initialRows),
    );

    const updateCell = (
        rowId: string,
        field: TransactionImportField,
        value: string,
    ): void => {
        setRows((currentRows) =>
            currentRows.map((row) =>
                row.id === rowId ? { ...row, [field]: value } : row,
            ),
        );
    };

    const addRow = (): void => {
        setRows((currentRows) => [...currentRows, createEmptyRow()]);
    };

    const removeRow = (rowId: string): void => {
        setRows((currentRows) =>
            currentRows.length === 1
                ? [createEmptyRow()]
                : currentRows.filter((row) => row.id !== rowId),
        );
    };

    const clearRows = (): void => {
        setRows(createRows(initialRows));
    };

    const pasteCells = (
        startRowIndex: number,
        startColumnIndex: number,
        clipboardText: string,
    ): void => {
        const matrix = clipboardText
            .replace(/\r/g, '')
            .split('\n')
            .filter((line) => line.length > 0)
            .map((line) => line.split('\t'));

        if (matrix.length === 0) {
            return;
        }

        setRows((currentRows) => {
            const nextRows = [...currentRows];
            const neededRows = startRowIndex + matrix.length;

            while (nextRows.length < neededRows) {
                nextRows.push(createEmptyRow());
            }

            matrix.forEach((cells, rowOffset) => {
                const rowIndex = startRowIndex + rowOffset;
                const nextRow = { ...nextRows[rowIndex] };

                cells.forEach((cell, cellOffset) => {
                    const column =
                        transactionImportColumns[startColumnIndex + cellOffset];

                    if (column) {
                        nextRow[column.key] = cell.trim();
                    }
                });

                nextRows[rowIndex] = nextRow;
            });

            return nextRows;
        });
    };

    const rowErrors = useMemo(
        () => new Map(rows.map((row) => [row.id, validateImportRow(row)])),
        [rows],
    );

    const payload = useMemo<TransactionImportPayload[]>(
        () =>
            rows
                .filter((row) => !isImportRowEmpty(row))
                .map((row) => ({
                    executed_at: row.executed_at.trim(),
                    pair: row.pair.trim().toUpperCase(),
                    base_asset: row.base_asset.trim().toUpperCase(),
                    quote_asset: row.quote_asset.trim().toUpperCase(),
                    type: row.type.trim().toUpperCase(),
                    price: normalizeDecimalInput(row.price),
                    amount: normalizeDecimalInput(row.amount),
                    total: normalizeDecimalInput(row.total),
                    fee_amount: row.fee_amount.trim()
                        ? normalizeDecimalInput(row.fee_amount)
                        : '0',
                    fee_coin: row.fee_coin.trim().toUpperCase(),
                })),
        [rows],
    );

    const payloadIndexByRowId = useMemo(() => {
        const indexes = new Map<string, number>();

        rows.filter((row) => !isImportRowEmpty(row)).forEach((row, index) => {
            indexes.set(row.id, index);
        });

        return indexes;
    }, [rows]);

    const summary = useMemo<TransactionImportSummary>(() => {
        const filledRows = rows.filter((row) => !isImportRowEmpty(row));
        const invalidRows = filledRows.filter((row) => {
            const errors = rowErrors.get(row.id) ?? {};

            return Object.keys(errors).length > 0;
        });

        return {
            filledRows: filledRows.length,
            validRows: filledRows.length - invalidRows.length,
            invalidRows: invalidRows.length,
            buyRows: filledRows.filter(
                (row) => row.type.trim().toUpperCase() === 'BUY',
            ).length,
            sellRows: filledRows.filter(
                (row) => row.type.trim().toUpperCase() === 'SELL',
            ).length,
        };
    }, [rowErrors, rows]);

    return {
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
    };
}

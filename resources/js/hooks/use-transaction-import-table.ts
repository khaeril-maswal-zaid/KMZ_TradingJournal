import {
    TransactionImportColumn,
    TransactionImportField,
    TransactionImportFieldV2,
    TransactionImportPayload,
    TransactionImportRow,
    TransactionImportRowV2,
    TransactionImportSummary,
    TransactionImportVersion,
    TransactionImportColumnV2,
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

export const transactionImportColumnsV2: TransactionImportColumnV2[] = [
    {
        key: 'time',
        label: 'Waktu',
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
        key: 'side',
        label: 'Side',
        placeholder: 'BUY',
        width: 'min-w-24',
    },
    {
        key: 'price',
        label: 'Harga',
        placeholder: '65427,80',
        width: 'min-w-32',
        align: 'right',
    },
    {
        key: 'executed',
        label: 'Executed',
        placeholder: '0.00035BTC',
        width: 'min-w-32',
    },
    {
        key: 'amount',
        label: 'Amount',
        placeholder: '22.89973USDT',
        width: 'min-w-32',
    },
    {
        key: 'fee',
        label: 'Fee',
        placeholder: '0.00000035BTC',
        width: 'min-w-32',
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

const requiredFieldsV2: TransactionImportFieldV2[] = [
    'time',
    'pair',
    'side',
    'price',
    'executed',
    'amount',
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

const createEmptyRowV2 = (): TransactionImportRowV2 => ({
    id: createId(),
    time: '',
    pair: '',
    side: '',
    price: '',
    executed: '',
    amount: '',
    fee: '',
});

const createRows = (count: number): TransactionImportRow[] =>
    Array.from({ length: count }, createEmptyRow);

const createRowsV2 = (count: number): TransactionImportRowV2[] =>
    Array.from({ length: count }, createEmptyRowV2);

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

// Parse V2 date format (YY-MM-DD HH:mm:ss) to ISO format (YYYY-MM-DD HH:mm:ss)
export const parseDateV2 = (dateStr: string): string => {
    const trimmed = dateStr.trim();
    const match = trimmed.match(/^(\d{2})-(\d{2})-(\d{2})\s(.*)$/);

    if (!match) {
        return trimmed; // Return as-is if format doesn't match
    }

    const [, yy, mm, dd, time] = match;
    const year = parseInt(yy, 10);
    // Assume 2000s for years (e.g., 26 = 2026, 25 = 2025)
    const fullYear = year < 100 ? 2000 + year : year;

    return `${fullYear}-${mm}-${dd} ${time}`;
};

export const isImportRowEmpty = (row: TransactionImportRow): boolean =>
    transactionImportColumns.every(({ key }) => row[key].trim() === '');

export const isImportRowEmptyV2 = (row: TransactionImportRowV2): boolean =>
    transactionImportColumnsV2.every(({ key }) => row[key].trim() === '');

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

export const validateImportRowV2 = (
    row: TransactionImportRowV2,
): Partial<Record<TransactionImportFieldV2, string>> => {
    if (isImportRowEmptyV2(row)) {
        return {};
    }

    const errors: Partial<Record<TransactionImportFieldV2, string>> = {};

    requiredFieldsV2.forEach((field) => {
        if (!row[field].trim()) {
            errors[field] = 'Wajib diisi';
        }
    });

    if (row.time.trim()) {
        const parsedDate = parseDateV2(row.time);
        if (Number.isNaN(Date.parse(parsedDate))) {
            errors.time = 'Tanggal tidak valid';
        }
    }

    if (row.side.trim() && !['BUY', 'SELL'].includes(row.side.toUpperCase())) {
        errors.side = 'Gunakan BUY atau SELL';
    }

    if (row.price.trim()) {
        const priceValue = normalizeDecimalInput(row.price);
        if (Number.isNaN(Number(priceValue))) {
            errors.price = 'Angka tidak valid';
        }
    }

    // Validate executed format (should contain digit and letter)
    if (row.executed.trim()) {
        const executedMatch = row.executed.match(/^([0-9.,]+)([A-Z]+)$/i);
        if (!executedMatch) {
            errors.executed = 'Format: 0.00035BTC';
        } else {
            const numericPart = normalizeDecimalInput(executedMatch[1]);
            if (Number.isNaN(Number(numericPart))) {
                errors.executed = 'Angka tidak valid';
            }
        }
    }

    // Validate amount format (should contain digit and letter)
    if (row.amount.trim()) {
        const amountMatch = row.amount.match(/^([0-9.,]+)([A-Z]+)$/i);
        if (!amountMatch) {
            errors.amount = 'Format: 22.89973USDT';
        } else {
            const numericPart = normalizeDecimalInput(amountMatch[1]);
            if (Number.isNaN(Number(numericPart))) {
                errors.amount = 'Angka tidak valid';
            }
        }
    }

    // Validate fee format (should contain digit and letter, optional)
    if (row.fee.trim()) {
        const feeMatch = row.fee.match(/^([0-9.,]+)([A-Z]+)$/i);
        if (!feeMatch) {
            errors.fee = 'Format: 0.00000035BTC';
        } else {
            const numericPart = normalizeDecimalInput(feeMatch[1]);
            if (Number.isNaN(Number(numericPart))) {
                errors.fee = 'Angka tidak valid';
            }
        }
    }

    return errors;
};

// Extract number and coin from format like "0.00035BTC" or "22.89973USDT"
const extractValueAndCoin = (
    value: string,
): { value: string; coin: string } => {
    const match = value.trim().match(/^([0-9.,]+)([A-Z]+)$/i);
    if (!match) {
        return { value: '', coin: '' };
    }
    return {
        value: normalizeDecimalInput(match[1]),
        coin: match[2].toUpperCase(),
    };
};

// Parse V2 format to V1 format
export const parseV2toV1 = (
    rowV2: TransactionImportRowV2,
): TransactionImportRow => {
    // Check if entire row is empty to preserve empty state
    const isRowEmpty = isImportRowEmptyV2(rowV2);

    const { value: executedAmount, coin: baseCoin } = extractValueAndCoin(
        rowV2.executed,
    );
    const { value: totalAmount, coin: quoteCoin } = extractValueAndCoin(
        rowV2.amount,
    );
    const { value: feeAmount, coin: feeCoin } = extractValueAndCoin(rowV2.fee);

    return {
        id: rowV2.id,
        executed_at: parseDateV2(rowV2.time),
        pair: rowV2.pair.toUpperCase(),
        base_asset: baseCoin,
        quote_asset: quoteCoin,
        type: rowV2.side.toUpperCase(),
        price: rowV2.price,
        amount: executedAmount,
        total: totalAmount,
        fee_amount: isRowEmpty ? '' : feeAmount || '0',
        fee_coin: isRowEmpty ? '' : feeCoin || quoteCoin,
    };
};

export function useTransactionImportTable(initialRows = 8) {
    const [version, setVersion] = useState<TransactionImportVersion>('v1');
    const [rows, setRows] = useState<TransactionImportRow[]>(() =>
        createRows(initialRows),
    );
    const [rowsV2, setRowsV2] = useState<TransactionImportRowV2[]>(() =>
        createRowsV2(initialRows),
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

    const updateCellV2 = (
        rowId: string,
        field: TransactionImportFieldV2,
        value: string,
    ): void => {
        setRowsV2((currentRows) =>
            currentRows.map((row) =>
                row.id === rowId ? { ...row, [field]: value } : row,
            ),
        );
    };

    const addRow = (): void => {
        setRows((currentRows) => [...currentRows, createEmptyRow()]);
    };

    const addRowV2 = (): void => {
        setRowsV2((currentRows) => [...currentRows, createEmptyRowV2()]);
    };

    const removeRow = (rowId: string): void => {
        setRows((currentRows) =>
            currentRows.length === 1
                ? [createEmptyRow()]
                : currentRows.filter((row) => row.id !== rowId),
        );
    };

    const removeRowV2 = (rowId: string): void => {
        setRowsV2((currentRows) =>
            currentRows.length === 1
                ? [createEmptyRowV2()]
                : currentRows.filter((row) => row.id !== rowId),
        );
    };

    const clearRows = (): void => {
        setRows(createRows(initialRows));
    };

    const clearRowsV2 = (): void => {
        setRowsV2(createRowsV2(initialRows));
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

    const pasteCellsV2 = (
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

        setRowsV2((currentRows) => {
            const nextRows = [...currentRows];
            const neededRows = startRowIndex + matrix.length;

            while (nextRows.length < neededRows) {
                nextRows.push(createEmptyRowV2());
            }

            matrix.forEach((cells, rowOffset) => {
                const rowIndex = startRowIndex + rowOffset;
                const nextRow = { ...nextRows[rowIndex] };

                cells.forEach((cell, cellOffset) => {
                    const column =
                        transactionImportColumnsV2[
                            startColumnIndex + cellOffset
                        ];

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

    const rowErrorsV2 = useMemo(
        () => new Map(rowsV2.map((row) => [row.id, validateImportRowV2(row)])),
        [rowsV2],
    );

    // Merge V2 data to V1 for payload
    const mergedRows = useMemo(() => {
        if (version === 'v2') {
            return rowsV2.map((row) => parseV2toV1(row));
        }
        return rows;
    }, [version, rows, rowsV2]);

    const payload = useMemo<TransactionImportPayload[]>(
        () =>
            mergedRows
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
        [mergedRows],
    );

    const payloadIndexByRowId = useMemo(() => {
        const indexes = new Map<string, number>();

        mergedRows
            .filter((row) => !isImportRowEmpty(row))
            .forEach((row, index) => {
                indexes.set(row.id, index);
            });

        return indexes;
    }, [mergedRows]);

    const summary = useMemo<TransactionImportSummary>(() => {
        const filledRows = mergedRows.filter((row) => !isImportRowEmpty(row));

        const errors = version === 'v2' ? rowErrorsV2 : rowErrors;

        const invalidRows = filledRows.filter((row) => {
            const rowErrorMap = errors.get(row.id) ?? {};

            return Object.keys(rowErrorMap).length > 0;
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
    }, [rowErrors, rowErrorsV2, rows, rowsV2, mergedRows, version]);

    const switchVersion = (newVersion: TransactionImportVersion): void => {
        setVersion(newVersion);
    };

    return {
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
    };
}

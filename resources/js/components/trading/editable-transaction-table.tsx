import { Plus, Trash2 } from 'lucide-react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { v4 as uuid } from 'uuid';
import { cn } from '@/lib/utils';

export type ImportRow = {
    id: string;
    executed_at: string;
    pair: string;
    base_asset: string;
    quote_asset: string;
    type: 'BUY' | 'SELL' | '';
    price: string;
    amount: string;
    total: string;
    fee_amount: string;
    fee_coin: string;
};

type Field = keyof Omit<ImportRow, 'id'>;

const columns: {
    key: Field;
    label: string;
    width: string;
    numeric?: boolean;
}[] = [
    { key: 'executed_at', label: 'Tanggal (UTC)', width: 'min-w-42' },
    { key: 'pair', label: 'Pair', width: 'min-w-28' },
    { key: 'base_asset', label: 'Base Asset', width: 'min-w-28' },
    { key: 'quote_asset', label: 'Quote Asset', width: 'min-w-28' },
    { key: 'type', label: 'Tipe', width: 'min-w-24' },
    { key: 'price', label: 'Harga', width: 'min-w-32', numeric: true },
    { key: 'amount', label: 'Jumlah', width: 'min-w-32', numeric: true },
    { key: 'total', label: 'Total', width: 'min-w-32', numeric: true },
    { key: 'fee_amount', label: 'Fee', width: 'min-w-28', numeric: true },
    { key: 'fee_coin', label: 'Koin Fee', width: 'min-w-28' },
];

export function createEmptyImportRow(): ImportRow {
    return {
        id: uuid(),
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
    };
}

function hasValue(row: ImportRow): boolean {
    return columns.some((column) => row[column.key].trim() !== '');
}

function cellId(rowIndex: number, field: Field): string {
    return `import-cell-${rowIndex}-${field}`;
}

function focusCell(rowIndex: number, colIndex: number): void {
    const field = columns[colIndex]?.key;

    if (!field) {
        return;
    }

    document.getElementById(cellId(rowIndex, field))?.focus();
}

export function EditableTransactionTable({
    rows,
    onRowsChange,
    errors,
    loading = false,
}: {
    rows: ImportRow[];
    onRowsChange: (rows: ImportRow[]) => void;
    errors: Record<string, string>;
    loading?: boolean;
}) {
    const activeRows = useMemo(() => rows.filter(hasValue), [rows]);

    const updateCell = (
        rowIndex: number,
        field: Field,
        value: string,
    ): void => {
        const nextRows = rows.map((row, index) =>
            index === rowIndex ? { ...row, [field]: value } : row,
        );

        if (rowIndex === rows.length - 1 && hasValue(nextRows[rowIndex])) {
            nextRows.push(createEmptyImportRow());
        }

        onRowsChange(nextRows);
    };

    const removeRow = (rowIndex: number): void => {
        const nextRows = rows.filter((_, index) => index !== rowIndex);
        onRowsChange(nextRows.length ? nextRows : [createEmptyImportRow()]);
    };

    const addRow = (): void => onRowsChange([...rows, createEmptyImportRow()]);

    const handlePaste = (
        event: ClipboardEvent<HTMLInputElement>,
        rowIndex: number,
        colIndex: number,
    ): void => {
        const text = event.clipboardData.getData('text');

        if (!text.includes('\t') && !text.includes('\n')) {
            return;
        }

        event.preventDefault();

        const matrix = text
            .replace(/\r/g, '')
            .split('\n')
            .filter((line) => line.length > 0)
            .map((line) => line.split('\t'));

        const nextRows = [...rows];

        matrix.forEach((values, matrixRowIndex) => {
            const targetRowIndex = rowIndex + matrixRowIndex;

            while (!nextRows[targetRowIndex]) {
                nextRows.push(createEmptyImportRow());
            }

            values.forEach((value, matrixColIndex) => {
                const column = columns[colIndex + matrixColIndex];

                if (!column) {
                    return;
                }

                nextRows[targetRowIndex] = {
                    ...nextRows[targetRowIndex],
                    [column.key]: value.trim(),
                };
            });
        });

        if (hasValue(nextRows[nextRows.length - 1])) {
            nextRows.push(createEmptyImportRow());
        }

        onRowsChange(nextRows);
    };

    const handleKeyDown = (
        event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
        rowIndex: number,
        colIndex: number,
    ): void => {
        if (event.key === 'Enter' || event.key === 'ArrowDown') {
            event.preventDefault();
            focusCell(Math.min(rowIndex + 1, rows.length - 1), colIndex);
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusCell(Math.max(rowIndex - 1, 0), colIndex);
        }

        if (event.key === 'Tab') {
            event.preventDefault();
            const nextCol = event.shiftKey ? colIndex - 1 : colIndex + 1;

            if (nextCol < 0) {
                focusCell(Math.max(rowIndex - 1, 0), columns.length - 1);
                return;
            }

            if (nextCol >= columns.length) {
                focusCell(Math.min(rowIndex + 1, rows.length - 1), 0);
                return;
            }

            focusCell(rowIndex, nextCol);
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                <div>
                    <p className="text-sm font-medium">Editor Import</p>
                    <p className="text-xs text-muted-foreground">
                        {activeRows.length} baris siap divalidasi
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                    disabled={loading}
                >
                    <Plus className="size-4" />
                    Tambah Baris
                </Button>
            </div>

            <div className="max-h-[58vh] overflow-auto">
                <Table className="min-w-[1180px]">
                    <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                        <TableRow>
                            <TableHead className="w-12 text-center">
                                No
                            </TableHead>
                            {columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={column.width}
                                >
                                    {column.label}
                                </TableHead>
                            ))}
                            <TableHead className="w-16 text-center">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + 2}
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    Belum ada data transaksi.
                                </TableCell>
                            </TableRow>
                        )}
                        {rows.map((row, rowIndex) => (
                            <TableRow
                                key={row.id}
                                className={loading ? 'opacity-70' : undefined}
                            >
                                <TableCell className="text-center text-xs text-muted-foreground">
                                    {rowIndex + 1}
                                </TableCell>
                                {columns.map((column, colIndex) => {
                                    const errorKey = `${rowIndex}.${column.key}`;
                                    const hasError = Boolean(errors[errorKey]);
                                    const inputClass = cn(
                                        'h-9 w-full rounded-md border bg-background px-2 text-sm transition outline-none focus:border-ring focus:ring-2 focus:ring-ring/20',
                                        column.numeric &&
                                            'text-right tabular-nums',
                                        hasError &&
                                            'border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive/20',
                                    );

                                    return (
                                        <TableCell
                                            key={column.key}
                                            className="p-1.5"
                                        >
                                            {column.key === 'type' ? (
                                                <select
                                                    id={cellId(
                                                        rowIndex,
                                                        column.key,
                                                    )}
                                                    value={row.type}
                                                    onChange={(event) =>
                                                        updateCell(
                                                            rowIndex,
                                                            column.key,
                                                            event.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(event) =>
                                                        handleKeyDown(
                                                            event,
                                                            rowIndex,
                                                            colIndex,
                                                        )
                                                    }
                                                    disabled={loading}
                                                    className={inputClass}
                                                >
                                                    <option value="">
                                                        Pilih
                                                    </option>
                                                    <option value="BUY">
                                                        BUY
                                                    </option>
                                                    <option value="SELL">
                                                        SELL
                                                    </option>
                                                </select>
                                            ) : (
                                                <input
                                                    id={cellId(
                                                        rowIndex,
                                                        column.key,
                                                    )}
                                                    value={row[column.key]}
                                                    onChange={(event) =>
                                                        updateCell(
                                                            rowIndex,
                                                            column.key,
                                                            event.target.value,
                                                        )
                                                    }
                                                    onPaste={(event) =>
                                                        handlePaste(
                                                            event,
                                                            rowIndex,
                                                            colIndex,
                                                        )
                                                    }
                                                    onKeyDown={(event) =>
                                                        handleKeyDown(
                                                            event,
                                                            rowIndex,
                                                            colIndex,
                                                        )
                                                    }
                                                    disabled={loading}
                                                    className={inputClass}
                                                    placeholder={
                                                        column.key ===
                                                        'executed_at'
                                                            ? '2026-06-03 10:30:00'
                                                            : ''
                                                    }
                                                />
                                            )}
                                            {hasError && (
                                                <p className="mt-1 text-[11px] text-destructive">
                                                    {errors[errorKey]}
                                                </p>
                                            )}
                                        </TableCell>
                                    );
                                })}
                                <TableCell className="text-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRow(rowIndex)}
                                        disabled={loading || rows.length === 1}
                                        title="Hapus baris"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

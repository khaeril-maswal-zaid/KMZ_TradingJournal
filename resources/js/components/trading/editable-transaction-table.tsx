import { Trash2 } from 'lucide-react';
import { EditableCell } from '@/components/trading/editable-cell';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    isImportRowEmpty,
    isImportRowEmptyV2,
    transactionImportColumns,
    transactionImportColumnsV2,
} from '@/hooks/use-transaction-import-table';
import { cn } from '@/lib/utils';
import {
    TransactionImportField,
    TransactionImportFieldV2,
    TransactionImportRow,
    TransactionImportRowV2,
} from '@/types/transactions';

type Props =
    | {
          version: 'v1';
          rows: TransactionImportRow[];
          rowErrors: Map<
              string,
              Partial<Record<TransactionImportField, string>>
          >;
          payloadIndexByRowId: Map<string, number>;
          serverErrors: Record<string, string>;
          showValidation: boolean;
          processing?: boolean;
          onChange: (
              rowId: string,
              field: TransactionImportField,
              value: string,
          ) => void;
          onPasteCells: (
              rowIndex: number,
              columnIndex: number,
              clipboardText: string,
          ) => void;
          onAddRow: () => void;
          onRemoveRow: (rowId: string) => void;
      }
    | {
          version: 'v2';
          rows: TransactionImportRowV2[];
          rowErrors: Map<
              string,
              Partial<Record<TransactionImportFieldV2, string>>
          >;
          payloadIndexByRowId: Map<string, number>;
          serverErrors: Record<string, string>;
          showValidation: boolean;
          processing?: boolean;
          onChange: (
              rowId: string,
              field: TransactionImportFieldV2,
              value: string,
          ) => void;
          onPasteCells: (
              rowIndex: number,
              columnIndex: number,
              clipboardText: string,
          ) => void;
          onAddRow: () => void;
          onRemoveRow: (rowId: string) => void;
      };

export function EditableTransactionTable(props: Props) {
    const {
        rows,
        rowErrors,
        payloadIndexByRowId,
        serverErrors,
        showValidation,
        processing = false,
        onChange,
        onPasteCells,
        onAddRow,
        onRemoveRow,
        version,
    } = props;

    const isEmptyCheck =
        version === 'v1' ? isImportRowEmpty : isImportRowEmptyV2;
    const columns =
        version === 'v1'
            ? transactionImportColumns
            : transactionImportColumnsV2;
    const isEmpty = rows.every((row) => isEmptyCheck(row as any));

    return (
        <div className="relative overflow-hidden rounded-lg border bg-card shadow-xs">
            {processing && (
                <div
                    className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-[1px]"
                    aria-busy="true"
                    aria-live="polite"
                >
                    <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm">
                        <Spinner className="size-4" />
                        Mengimpor transaksi...
                    </div>
                </div>
            )}
            {isEmpty && (
                <div className="border-b bg-sky-50/70 px-4 py-3 text-sm text-sky-800 dark:bg-sky-950/30 dark:text-sky-200">
                    Data import kosong. Pilih sel pertama untuk mulai menempel
                    data transaksi.
                </div>
            )}
            <div className="max-h-[62vh] overflow-auto">
                <Table className="min-w-[1180px]">
                    <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                        <TableRow className="hover:bg-muted/95">
                            <TableHead className="w-12 text-center">
                                #
                            </TableHead>
                            {columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={cn(
                                        column.width,
                                        column.align === 'right' &&
                                            'text-right',
                                        column.align === 'center' &&
                                            'text-center',
                                    )}
                                >
                                    {column.label}
                                </TableHead>
                            ))}
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, rowIndex) => {
                            const localErrors = rowErrors.get(row.id) ?? {};
                            const payloadIndex = payloadIndexByRowId.get(
                                row.id,
                            );

                            return (
                                <TableRow key={row.id} className="group">
                                    <TableCell className="bg-muted/20 text-center text-xs text-muted-foreground">
                                        {rowIndex + 1}
                                    </TableCell>
                                    {columns.map((column, columnIndex) => {
                                        const serverError =
                                            payloadIndex === undefined
                                                ? undefined
                                                : serverErrors[
                                                      `rows.${payloadIndex}.${column.key}`
                                                  ];
                                        const error =
                                            serverError ??
                                            (showValidation
                                                ? (
                                                      localErrors as Record<
                                                          string,
                                                          string
                                                      >
                                                  )[column.key as string]
                                                : undefined);

                                        return (
                                            <TableCell
                                                key={column.key}
                                                className={cn(
                                                    'border-r last:border-r-0',
                                                    error && 'bg-destructive/5',
                                                    'max-h-0 gap-0 px-0 py-0',
                                                )}
                                            >
                                                <EditableCell
                                                    rowId={row.id}
                                                    rowIndex={rowIndex}
                                                    columnIndex={columnIndex}
                                                    field={column.key as any}
                                                    value={
                                                        (row as any)[column.key]
                                                    }
                                                    placeholder={
                                                        column.placeholder
                                                    }
                                                    align={column.align}
                                                    error={error}
                                                    onChange={onChange as any}
                                                    onPasteCells={onPasteCells}
                                                    onAddRow={onAddRow}
                                                />
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="bg-muted/20 px-0 py-0 text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 opacity-60 transition-opacity hover:opacity-100"
                                            onClick={() => onRemoveRow(row.id)}
                                            aria-label="Hapus baris"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

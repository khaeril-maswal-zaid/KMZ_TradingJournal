import type { KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';
import type { TransactionImportField } from '@/types/transactions';

type Props = {
    rowId: string;
    rowIndex: number;
    columnIndex: number;
    field: TransactionImportField;
    value: string;
    placeholder: string;
    align?: 'left' | 'right' | 'center';
    error?: string;
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
};

const focusCell = (rowIndex: number, columnIndex: number): void => {
    window.requestAnimationFrame(() => {
        const nextCell = document.querySelector<HTMLInputElement>(
            `[data-import-cell="${rowIndex}-${columnIndex}"]`,
        );

        nextCell?.focus();
        nextCell?.select();
    });
};

export function EditableCell({
    rowId,
    rowIndex,
    columnIndex,
    field,
    value,
    placeholder,
    align = 'left',
    error,
    onChange,
    onPasteCells,
    onAddRow,
}: Props) {
    const handlePaste = (event: ClipboardEvent<HTMLInputElement>): void => {
        const text = event.clipboardData.getData('text');

        if (!text.includes('\t') && !text.includes('\n')) {
            return;
        }

        event.preventDefault();
        onPasteCells(rowIndex, columnIndex, text);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        const maxColumnIndex = 9;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusCell(rowIndex + 1, columnIndex);
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusCell(Math.max(rowIndex - 1, 0), columnIndex);
        }

        if (
            event.key === 'ArrowRight' &&
            event.currentTarget.selectionStart === value.length
        ) {
            event.preventDefault();
            focusCell(rowIndex, Math.min(columnIndex + 1, maxColumnIndex));
        }

        if (
            event.key === 'ArrowLeft' &&
            event.currentTarget.selectionStart === 0
        ) {
            event.preventDefault();
            focusCell(rowIndex, Math.max(columnIndex - 1, 0));
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            focusCell(rowIndex + 1, columnIndex);
        }

        if (
            !event.shiftKey &&
            event.key === 'Tab' &&
            columnIndex === maxColumnIndex
        ) {
            onAddRow();
        }
    };

    return (
        <div className="relative m-0 p-0">
            <input
                data-import-cell={`${rowIndex}-${columnIndex}`}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(rowId, field, event.target.value)}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                aria-invalid={Boolean(error)}
                className={cn(
                    'h-10 w-full border-0 bg-transparent px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground/45 focus:bg-sky-50 focus:ring-2 focus:ring-sky-400 focus:ring-inset dark:focus:bg-sky-950/30',
                    align === 'right' && 'text-right tabular-nums',
                    align === 'center' && 'text-center',
                    error &&
                        'bg-destructive/10 text-destructive focus:bg-destructive/10 focus:ring-destructive',
                )}
            />
            {error && (
                <span className="pointer-events-none absolute right-2 bottom-0.5 text-[10px] font-medium text-destructive">
                    {error}
                </span>
            )}
        </div>
    );
}

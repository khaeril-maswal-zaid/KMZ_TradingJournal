import type { AnalysisStatus, TransactionType } from '@/types/trading';

export function formatMoney(value: number, currency = 'USDT'): string {
    return `${new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)} ${currency}`;
}

export function formatCrypto(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8,
    }).format(value);
}

export function formatPercent(value: number): string {
    return `${new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)}%`;
}

export function normalizeDecimalInput(value: string): string {
    const trimmed = value.trim().replace(/\s/g, '');

    if (!trimmed) {
        return '0';
    }

    if (trimmed.includes(',') && trimmed.includes('.')) {
        const lastComma = trimmed.lastIndexOf(',');
        const lastDot = trimmed.lastIndexOf('.');

        return lastComma > lastDot
            ? trimmed.replace(/\./g, '').replace(',', '.')
            : trimmed.replace(/,/g, '');
    }

    return trimmed.replace(',', '.');
}

export function statusLabel(status: AnalysisStatus): string {
    return {
        PROFIT: 'Profit',
        LOSS: 'Rugi',
        BREAK_EVEN: 'Impas',
    }[status];
}

export function typeLabel(type: TransactionType): string {
    return type === 'BUY' ? 'BUY' : 'SELL';
}

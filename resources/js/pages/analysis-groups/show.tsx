import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    CircleDollarSign,
    Loader2,
    Lock,
    Plus,
    ReceiptText,
    Trash2,
    TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProfitBadge } from '@/components/trading/profit-badge';
import { ProfitCard } from '@/components/trading/profit-card';
import { TransactionTypeBadge } from '@/components/trading/transaction-type-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCrypto, formatMoney, formatPercent } from '@/lib/trading';
import type {
    AnalysisGroup,
    ResourceCollection,
    ResourceItem,
    SellBreakdown,
    Transaction,
} from '@/types';

type Props = {
    group: ResourceItem<AnalysisGroup>;
    buyTransactions: ResourceCollection<Transaction>;
    sellTransactions: ResourceCollection<Transaction>;
    sellBreakdown: SellBreakdown[];
    availableTransactions: ResourceCollection<Transaction>;
};

function TransactionCard({
    transaction,
    onRemove,
}: {
    transaction: Transaction;
    onRemove: (transaction: Transaction) => void;
}) {
    return (
        <div className="rounded-lg border bg-card p-4 shadow-xs transition hover:border-primary/30">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">{transaction.pair}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {transaction.executed_at_label}
                    </p>
                </div>
                <TransactionTypeBadge type={transaction.type} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">Jumlah</p>
                    <p className="mt-1 font-medium tabular-nums">
                        {formatCrypto(transaction.amount)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="mt-1 font-medium tabular-nums">
                        {formatMoney(
                            transaction.total,
                            transaction.quote_asset,
                        )}
                    </p>
                </div>
                <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Fee</p>
                    <p className="mt-1 font-medium tabular-nums">
                        {formatCrypto(transaction.fee_amount)}{' '}
                        {transaction.fee_coin ?? '-'}
                    </p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-destructive hover:text-destructive"
                onClick={() => onRemove(transaction)}
            >
                <Trash2 className="size-4" />
                Hapus dari Grup
            </Button>
        </div>
    );
}

export default function AnalysisGroupShow({
    group,
    buyTransactions,
    sellTransactions,
    sellBreakdown,
    availableTransactions,
}: Props) {
    const analysis = group.data;
    const [open, setOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);

    const selectedTotal = useMemo(
        () =>
            availableTransactions.data
                .filter((transaction) => selectedIds.includes(transaction.id))
                .reduce((total, transaction) => total + transaction.total, 0),
        [availableTransactions.data, selectedIds],
    );

    const toggle = (transaction: Transaction): void => {
        if (transaction.is_analyzed) {
            return;
        }

        setSelectedIds((current) =>
            current.includes(transaction.id)
                ? current.filter((id) => id !== transaction.id)
                : [...current, transaction.id],
        );
    };

    const attach = (): void => {
        setProcessing(true);
        router.post(
            `/analysis-groups/${analysis.id}/transactions`,
            { transaction_ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    setSelectedIds([]);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const detach = (transaction: Transaction): void => {
        router.delete(
            `/analysis-groups/${analysis.id}/transactions/${transaction.id}`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title={analysis.name} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <ProfitBadge status={analysis.status} />
                            <Badge variant="outline">
                                {analysis.transactions_count} transaksi
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                            {analysis.name}
                        </h1>
                        {analysis.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {analysis.description}
                            </p>
                        )}
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="size-4" />
                                Tambah Transaksi
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>Matching Transaksi</DialogTitle>
                                <DialogDescription>
                                    Pilih transaksi BUY dan SELL yang masuk ke
                                    analisa ini. Transaksi yang sudah dipakai
                                    tampil terkunci.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                                <p className="font-medium">
                                    {selectedIds.length} transaksi dipilih
                                </p>
                                <p className="mt-1 text-muted-foreground">
                                    Subtotal pilihan:{' '}
                                    {formatMoney(selectedTotal)}
                                </p>
                            </div>
                            <div className="max-h-96 overflow-auto rounded-lg border">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-muted">
                                        <TableRow>
                                            <TableHead className="w-10" />
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Pair</TableHead>
                                            <TableHead>Tipe</TableHead>
                                            <TableHead className="text-right">
                                                Total
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {availableTransactions.data.map(
                                            (transaction) => (
                                                <TableRow
                                                    key={transaction.id}
                                                    className={
                                                        transaction.is_analyzed
                                                            ? 'opacity-60'
                                                            : undefined
                                                    }
                                                >
                                                    <TableCell>
                                                        {transaction.is_analyzed ? (
                                                            <Lock className="size-4 text-muted-foreground" />
                                                        ) : (
                                                            <Checkbox
                                                                checked={selectedIds.includes(
                                                                    transaction.id,
                                                                )}
                                                                onCheckedChange={() =>
                                                                    toggle(
                                                                        transaction,
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {
                                                            transaction.executed_at_label
                                                        }
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {transaction.pair}
                                                    </TableCell>
                                                    <TableCell>
                                                        <TransactionTypeBadge
                                                            type={
                                                                transaction.type
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {formatMoney(
                                                            transaction.total,
                                                            transaction.quote_asset,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {transaction.is_analyzed
                                                                ? 'Terkunci'
                                                                : 'Tersedia'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={attach}
                                    disabled={
                                        processing || selectedIds.length === 0
                                    }
                                >
                                    {processing && (
                                        <Loader2 className="size-4 animate-spin" />
                                    )}
                                    Masukkan ke Grup
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <ProfitCard
                        title="Total Buy"
                        value={formatMoney(analysis.total_buy)}
                        helper="Modal keluar"
                        icon={CircleDollarSign}
                        tone="blue"
                    />
                    <ProfitCard
                        title="Total Sell"
                        value={formatMoney(analysis.total_sell)}
                        helper="Uang kembali"
                        icon={ReceiptText}
                        tone="amber"
                    />
                    <ProfitCard
                        title="Profit"
                        value={formatMoney(analysis.profit)}
                        helper="Sell dikurangi buy"
                        icon={TrendingUp}
                        tone={analysis.profit >= 0 ? 'green' : 'red'}
                    />
                    <ProfitCard
                        title="ROI"
                        value={formatPercent(analysis.roi_percent)}
                        helper="Profit dibagi total buy"
                        icon={BarChart3}
                        tone={analysis.roi_percent >= 0 ? 'green' : 'red'}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card className="rounded-lg shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Riwayat BUY
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {buyTransactions.data.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    Belum ada transaksi BUY di grup ini.
                                </div>
                            ) : (
                                buyTransactions.data.map((transaction) => (
                                    <TransactionCard
                                        key={transaction.id}
                                        transaction={transaction}
                                        onRemove={detach}
                                    />
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Riwayat SELL
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {sellTransactions.data.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    Belum ada transaksi SELL di grup ini.
                                </div>
                            ) : (
                                sellTransactions.data.map((transaction) => (
                                    <TransactionCard
                                        key={transaction.id}
                                        transaction={transaction}
                                        onRemove={detach}
                                    />
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-lg shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Hasil Analisa Penjualan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sellBreakdown.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                Tambahkan transaksi SELL untuk melihat profit
                                per hasil penjualan.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {sellBreakdown.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border bg-card p-4 shadow-xs"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium">
                                                    {item.label}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {
                                                        item.transaction.data
                                                            .executed_at_label
                                                    }
                                                </p>
                                            </div>
                                            <ProfitBadge status={item.status} />
                                        </div>
                                        <div className="mt-4 space-y-3 text-sm">
                                            <div className="flex justify-between gap-3">
                                                <span className="text-muted-foreground">
                                                    Subtotal BUY
                                                </span>
                                                <span className="font-medium tabular-nums">
                                                    {formatMoney(
                                                        item.subtotal_buy,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-muted-foreground">
                                                    Subtotal SELL
                                                </span>
                                                <span className="font-medium tabular-nums">
                                                    {formatMoney(
                                                        item.subtotal_sell,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3 border-t pt-3">
                                                <span className="text-muted-foreground">
                                                    Profit
                                                </span>
                                                <span
                                                    className={`font-semibold tabular-nums ${item.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                                                >
                                                    {formatMoney(item.profit)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-muted-foreground">
                                                    ROI
                                                </span>
                                                <span className="font-medium tabular-nums">
                                                    {formatPercent(
                                                        item.roi_percent,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AnalysisGroupShow.layout = {
    breadcrumbs: [{ title: 'Analisa Trading', href: '/analysis-groups' }],
};

import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    Calculator,
    CircleDollarSign,
    Loader2,
    Lock,
    Plus,
    ReceiptText,
    Target,
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { attach, detach, index } from '@/routes/tradematching';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HistoryCard } from '@/components/trading/history-card';

type Props = {
    group: ResourceItem<AnalysisGroup>;
    buyTransactions: ResourceCollection<Transaction>;
    sellTransactions: ResourceCollection<Transaction>;
    sellBreakdown: SellBreakdown[];
    availableTransactions: ResourceCollection<Transaction>;
    sellPlannerSummary: {
        total_buy_amount: number;
        total_buy_cost: number;
        average_buy_price: number;
    };
};

export default function AnalysisGroupShow({
    group,
    buyTransactions,
    sellTransactions,
    sellBreakdown,
    availableTransactions,
    sellPlannerSummary,
}: Props) {
    const analysis = group.data;
    const [open, setOpen] = useState(false);
    const [planner, setPlanner] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] =
        useState<Transaction | null>(null);

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

    const attacher = (): void => {
        setProcessing(true);
        router.post(
            attach.url(analysis.key),
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

    const detacher = (transaction: Transaction): void => {
        router.delete(
            detach.url({
                analysisGroup: analysis.key,
                transaction: transaction.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteConfirmOpen(false);
                    setTransactionToDelete(null);
                },
            },
        );
    };

    const handleDeleteClick = (transaction: Transaction): void => {
        setTransactionToDelete(transaction);
        setDeleteConfirmOpen(true);
    };

    const { total_buy_amount, total_buy_cost, average_buy_price } =
        sellPlannerSummary ?? {
            total_buy_amount: 0,
            total_buy_cost: 0,
            average_buy_price: 0,
        };

    const [mode, setMode] = useState<'price' | 'roi'>('price');

    const [totalAmountInput, setTotalAmountInput] =
        useState<number>(total_buy_amount);

    const [targetSellPrice, setTargetSellPrice] = useState<number>(
        average_buy_price || 0,
    );

    const [targetRoi, setTargetRoi] = useState<number>(0);

    const computed = useMemo(() => {
        if (mode === 'price') {
            const estimatedSellValue = totalAmountInput * targetSellPrice;
            const estimatedProfit = estimatedSellValue - total_buy_cost;
            const roi =
                total_buy_cost > 0
                    ? (estimatedProfit / total_buy_cost) * 100
                    : 0;

            return {
                targetSellPrice,
                estimatedSellValue,
                estimatedProfit,
                roi,
            };
        }

        // mode === 'roi'
        const estimatedProfit = (targetRoi / 100) * total_buy_cost;
        const estimatedSellValue = total_buy_cost + estimatedProfit;
        const targetSell =
            totalAmountInput > 0 ? estimatedSellValue / totalAmountInput : 0;

        return {
            targetSellPrice: targetSell,
            estimatedSellValue,
            estimatedProfit,
            roi: targetRoi,
        };
    }, [mode, totalAmountInput, targetSellPrice, targetRoi, total_buy_cost]);

    const handleConfirmDelete = (): void => {
        if (transactionToDelete) {
            detacher(transactionToDelete);
        }
    };

    return (
        <>
            <Head title={analysis.key} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <ProfitBadge status={analysis.status} />
                            <Badge variant="outline">
                                {analysis.transactions_count} transaksi
                            </Badge>
                            <span className="text-xs">
                                {analysis.executed_at}
                            </span>
                        </div>
                        <h1 className="font-semibold tracking-normal">
                            {analysis.key}
                        </h1>
                    </div>

                    <div className="flex gap-2 self-end">
                        {sellTransactions.data.length === 0 && (
                            <Dialog open={planner} onOpenChange={setPlanner}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Calculator className="size-4" />
                                        Sell Planner
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-4xl">
                                    <DialogHeader>
                                        <DialogTitle>Sell Planner</DialogTitle>
                                        <DialogDescription>
                                            Rencanakan hasil penjualan untuk
                                            transaksi BUY yang sudah ada di grup
                                            ini.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="max-h-96 overflow-auto rounded-lg border"></div>
                                    <div className="space-y-4">
                                        <div className="grid gap-3 md:grid-cols-3">
                                            <div className="rounded-lg border bg-card p-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Total Amount
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        className="w-full rounded-md border p-2 text-right tabular-nums"
                                                        value={totalAmountInput.toFixed(
                                                            6,
                                                        )}
                                                        onChange={(e) =>
                                                            setTotalAmountInput(
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        step="0.00000001"
                                                    />
                                                </div>
                                            </div>
                                            <div className="rounded-lg border bg-card p-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Average Buy Price
                                                </p>
                                                <p className="mt-1 font-medium tabular-nums">
                                                    {formatMoney(
                                                        average_buy_price,
                                                        '',
                                                    )}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border bg-card p-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Total Modal
                                                </p>
                                                <p className="mt-1 font-medium tabular-nums">
                                                    {formatMoney(
                                                        total_buy_cost,
                                                        '',
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1 rounded-md bg-muted p-1">
                                                <button
                                                    type="button"
                                                    className={`rounded-md px-3 py-1 text-sm ${mode === 'price' ? 'bg-card' : 'text-muted-foreground'}`}
                                                    onClick={() =>
                                                        setMode('price')
                                                    }
                                                >
                                                    By Price
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`rounded-md px-3 py-1 text-sm ${mode === 'roi' ? 'bg-card' : 'text-muted-foreground'}`}
                                                    onClick={() =>
                                                        setMode('roi')
                                                    }
                                                >
                                                    By ROI
                                                </button>
                                            </div>
                                        </div>

                                        {mode === 'price' ? (
                                            <div className="space-y-4">
                                                <div className="rounded-lg border bg-muted/30 p-4">
                                                    <Label className="text-sm text-muted-foreground">
                                                        Target Sell Price
                                                    </Label>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            className="w-full rounded-md border p-2 text-right tabular-nums"
                                                            value={targetSellPrice.toFixed(
                                                                2,
                                                            )}
                                                            onChange={(e) =>
                                                                setTargetSellPrice(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            step="0.00000001"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-3 md:grid-cols-3">
                                                    <div className="rounded-lg border bg-card p-4">
                                                        <p className="text-sm text-muted-foreground">
                                                            Estimated Sell Value
                                                        </p>
                                                        <p className="mt-1 font-medium tabular-nums">
                                                            {formatMoney(
                                                                computed.estimatedSellValue,
                                                                '',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg border bg-card p-4">
                                                        <p className="text-sm text-muted-foreground">
                                                            Estimated Profit
                                                        </p>
                                                        <p className="mt-1 font-medium tabular-nums">
                                                            {formatMoney(
                                                                computed.estimatedProfit,
                                                                '',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg border bg-card p-4">
                                                        <p className="text-sm text-muted-foreground">
                                                            ROI
                                                        </p>
                                                        <p className="mt-1 font-medium tabular-nums">
                                                            {formatPercent(
                                                                computed.roi,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="rounded-lg border bg-muted/30 p-4">
                                                    <Label className="text-sm text-muted-foreground">
                                                        Target ROI (%)
                                                    </Label>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            className="w-full rounded-md border p-2 text-right tabular-nums"
                                                            value={targetRoi}
                                                            onChange={(e) =>
                                                                setTargetRoi(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-3 md:grid-cols-3">
                                                    <div className="rounded-lg border bg-card p-4">
                                                        <p className="text-sm text-muted-foreground">
                                                            Target Sell Price
                                                        </p>
                                                        <p className="mt-1 font-medium tabular-nums">
                                                            {formatMoney(
                                                                computed.targetSellPrice,
                                                                '',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg border bg-card p-4">
                                                        <p className="text-sm text-muted-foreground">
                                                            Estimated Profit
                                                        </p>
                                                        <p className="mt-1 font-medium tabular-nums">
                                                            {formatMoney(
                                                                computed.estimatedProfit,
                                                                '',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg border bg-card p-4">
                                                        <p className="text-sm text-muted-foreground">
                                                            Estimated Sell Value
                                                        </p>
                                                        <p className="mt-1 font-medium tabular-nums">
                                                            {formatMoney(
                                                                computed.estimatedSellValue,
                                                                '',
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="size-4" />
                                    Tambah Transaksi
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        Matching Transaksi
                                    </DialogTitle>
                                    <DialogDescription>
                                        Pilih transaksi BUY dan SELL yang masuk
                                        ke analisa ini. Transaksi yang sudah
                                        dipakai tampil terkunci.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                                    <p className="font-medium">
                                        {selectedIds.length} transaksi dipilih
                                    </p>
                                    <p className="mt-1 text-muted-foreground">
                                        Subtotal pilihan:{' '}
                                        {formatMoney(selectedTotal, '')}
                                    </p>
                                </div>
                                <div className="max-h-96 overflow-auto rounded-lg border">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-muted">
                                            <TableRow>
                                                <TableHead className="w-10" />
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>Pair</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Amount</TableHead>
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
                                                                ? 'cursor-pointer opacity-60'
                                                                : undefined
                                                        }
                                                        onClick={() =>
                                                            toggle(transaction)
                                                        }
                                                    >
                                                        <TableCell
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >
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
                                                        <TableCell className="text-muted-foreground">
                                                            {transaction.pair}
                                                        </TableCell>
                                                        <TableCell className="tabular-nums">
                                                            {formatMoney(
                                                                transaction.price,
                                                                transaction.quote_asset,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="tabular-nums">
                                                            {formatCrypto(
                                                                transaction.amount,
                                                                transaction.base_asset,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <TransactionTypeBadge
                                                                type={
                                                                    transaction.type
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
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
                                        onClick={attacher}
                                        disabled={
                                            processing ||
                                            selectedIds.length === 0
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
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <ProfitCard
                        title="Sisa Kepemilikan"
                        value={formatCrypto(
                            analysis.total_buy_amount -
                                analysis?.total_sell_amount,
                            buyTransactions.data[0]?.base_asset,
                        )}
                        helper="Jumlah amount buy dikurangi sell"
                        icon={TrendingUp}
                        tone={analysis.profit >= 0 ? 'green' : 'red'}
                    />
                    <ProfitCard
                        title="Profit"
                        value={formatMoney(
                            analysis.profit,
                            buyTransactions.data[0]?.quote_asset,
                        )}
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

                <div className="grid gap-2 xl:grid-cols-2">
                    <Card className="rounded-lg shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Riwayat BUY
                            </CardTitle>
                            <div className="grid gap-2 xl:grid-cols-3">
                                <HistoryCard
                                    title="Rata-rata Harga Buy"
                                    value={formatMoney(
                                        analysis.average_buy_price,
                                        '',
                                    )}
                                    helper={
                                        buyTransactions.data[0]?.quote_asset
                                    }
                                />
                                <HistoryCard
                                    title="Total Buy"
                                    value={formatMoney(analysis.total_buy, '')}
                                    helper={
                                        buyTransactions.data[0]?.quote_asset
                                    }
                                />
                                <HistoryCard
                                    title="Jumlah Amount Buy"
                                    value={formatCrypto(
                                        analysis.total_buy_amount,
                                        '',
                                    )}
                                    helper={buyTransactions.data[0]?.base_asset}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {buyTransactions.data.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    Belum ada transaksi BUY di grup ini.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-lg border">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow className="border-b hover:bg-muted/50">
                                                <TableHead className="text-xs font-semibold">
                                                    Tanggal
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold">
                                                    Pair
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold">
                                                    Harga
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold">
                                                    Jumlah
                                                </TableHead>
                                                <TableHead className="text-right text-xs font-semibold">
                                                    Total
                                                </TableHead>
                                                <TableHead className="w-8" />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {buyTransactions.data.map(
                                                (transaction) => (
                                                    <TableRow
                                                        key={transaction.id}
                                                        className="hover:bg-muted/30"
                                                    >
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {
                                                                transaction.executed_at_label
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {transaction.pair}
                                                        </TableCell>
                                                        <TableCell className="text-xs tabular-nums">
                                                            {formatMoney(
                                                                transaction.price,
                                                                transaction.quote_asset,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs font-medium">
                                                            {formatCrypto(
                                                                transaction.amount,
                                                                transaction.base_asset,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs font-medium tabular-nums">
                                                            {formatMoney(
                                                                transaction.total,
                                                                transaction.quote_asset,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    handleDeleteClick(
                                                                        transaction,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Riwayat SELL
                            </CardTitle>

                            <div className="grid gap-2 xl:grid-cols-3">
                                <HistoryCard
                                    title="Rata-rata Harga Sell"
                                    value={formatMoney(
                                        analysis.average_sell_price,
                                        '',
                                    )}
                                    helper={
                                        sellTransactions.data[0]?.quote_asset
                                    }
                                />
                                <HistoryCard
                                    title="Total Sell"
                                    value={formatMoney(analysis.total_sell, '')}
                                    helper={
                                        sellTransactions.data[0]?.quote_asset
                                    }
                                />
                                <HistoryCard
                                    title="Jumlah Amount Sell"
                                    value={formatCrypto(
                                        analysis.total_sell_amount,
                                        '',
                                    )}
                                    helper={
                                        sellTransactions.data[0]?.base_asset
                                    }
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {sellTransactions.data.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    Belum ada transaksi SELL di grup ini.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-lg border">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow className="border-b hover:bg-muted/50">
                                                <TableHead className="text-xs font-semibold">
                                                    Tanggal
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold">
                                                    Pair
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold">
                                                    Harga
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold">
                                                    Jumlah
                                                </TableHead>
                                                <TableHead className="text-right text-xs font-semibold">
                                                    Total
                                                </TableHead>
                                                <TableHead className="w-8" />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sellTransactions.data.map(
                                                (transaction) => (
                                                    <TableRow
                                                        key={transaction.id}
                                                        className="hover:bg-muted/30"
                                                    >
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {
                                                                transaction.executed_at_label
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {transaction.pair}
                                                        </TableCell>
                                                        <TableCell className="text-xs tabular-nums">
                                                            {formatMoney(
                                                                transaction.price,
                                                                transaction.quote_asset,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs font-medium">
                                                            {formatCrypto(
                                                                transaction.amount,
                                                                transaction.base_asset,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs font-medium tabular-nums">
                                                            {formatMoney(
                                                                transaction.total,
                                                                transaction.quote_asset,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    handleDeleteClick(
                                                                        transaction,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <AlertDialog
                    open={deleteConfirmOpen}
                    onOpenChange={setDeleteConfirmOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus transaksi{' '}
                                <span className="font-semibold text-foreground">
                                    {transactionToDelete?.pair}
                                </span>
                                ({transactionToDelete?.executed_at_label})?
                                Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}

AnalysisGroupShow.layout = {
    breadcrumbs: [
        {
            title: 'Trade Matching',
            href: index.url(),
        },
        {
            title: `Details`,
            href: null,
        },
    ],
};

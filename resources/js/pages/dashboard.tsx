import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    CircleDollarSign,
    FileSpreadsheet,
    LineChart,
    ReceiptText,
    TrendingUp,
} from 'lucide-react';
import { ProfitBadge } from '@/components/trading/profit-badge';
import { ProfitCard } from '@/components/trading/profit-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCrypto, formatMoney, formatPercent } from '@/lib/trading';
import { dashboard } from '@/routes';
import type { AnalysisGroup, ResourceCollection, Transaction } from '@/types';
import { TransactionTypeBadge } from '@/components/trading/transaction-type-badge';

type DashboardProps = {
    stats: {
        total_profit: number;
        total_buy: number;
        total_sell: number;
        total_roi: number;
        transactions_count: number;
        analysis_groups_count: number;
    };
    monthlyProfit: {
        month: string;
        label: string;
        profit: number;
    }[];
    recentTransactions: ResourceCollection<Transaction>;
    recentGroups: ResourceCollection<AnalysisGroup>;
};

export default function Dashboard({
    stats,
    monthlyProfit,
    recentTransactions,
    recentGroups,
}: DashboardProps) {
    const maxAbsProfit = Math.max(
        ...monthlyProfit.map((item) => Math.abs(item.profit)),
        1,
    );

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <Badge
                            variant="outline"
                            className="mb-3 border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300"
                        >
                            Jurnal Trading Crypto
                        </Badge>
                        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Ringkasan modal, hasil jual, profit, dan performa
                            analisa trading.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/transactions/import">
                                <FileSpreadsheet className="size-4" />
                                Import Data
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/analysis-groups">
                                <LineChart className="size-4" />
                                Analisa Trading
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <ProfitCard
                        title="Total Profit"
                        value={formatMoney(stats.total_profit)}
                        helper="Akumulasi profit grup analisa"
                        icon={TrendingUp}
                        tone={stats.total_profit >= 0 ? 'green' : 'red'}
                    />
                    <ProfitCard
                        title="Total Buy"
                        value={formatMoney(stats.total_buy)}
                        helper="Seluruh modal transaksi BUY"
                        icon={CircleDollarSign}
                        tone="blue"
                    />
                    <ProfitCard
                        title="Total Sell"
                        value={formatMoney(stats.total_sell)}
                        helper="Seluruh hasil transaksi SELL"
                        icon={ReceiptText}
                        tone="amber"
                    />
                    <ProfitCard
                        title="Total ROI"
                        value={formatPercent(stats.total_roi)}
                        helper="Berdasarkan total buy dan sell"
                        icon={BarChart3}
                        tone={stats.total_roi >= 0 ? 'green' : 'red'}
                    />
                    <ProfitCard
                        title="Jumlah Transaksi"
                        value={stats.transactions_count.toString()}
                        helper="Data raw hasil import"
                        icon={FileSpreadsheet}
                    />
                    <ProfitCard
                        title="Grup Analisa"
                        value={stats.analysis_groups_count.toString()}
                        helper="Trade grouping aktif"
                        icon={LineChart}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
                    <Card className="rounded-lg shadow-xs">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                Profit Bulanan
                            </CardTitle>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/analysis-groups">
                                    Lihat Analisa
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {monthlyProfit.length === 0 ? (
                                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                                    Belum ada profit bulanan. Buat grup analisa
                                    untuk melihat grafik.
                                </div>
                            ) : (
                                <div className="flex h-64 items-end gap-3">
                                    {monthlyProfit.map((item) => {
                                        const height = Math.max(
                                            (Math.abs(item.profit) /
                                                maxAbsProfit) *
                                                100,
                                            6,
                                        );

                                        return (
                                            <div
                                                key={item.month}
                                                className="flex flex-1 flex-col items-center gap-2"
                                            >
                                                <div className="flex h-48 w-full items-end rounded-md bg-muted/60 px-2">
                                                    <div
                                                        className={`w-full rounded-t-md ${item.profit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                        style={{
                                                            height: `${height}%`,
                                                        }}
                                                        title={formatMoney(
                                                            item.profit,
                                                        )}
                                                    />
                                                </div>
                                                <span className="w-full truncate text-center text-xs text-muted-foreground">
                                                    {item.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Grup Analisa Terbaru
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentGroups.data.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    Belum ada grup analisa.
                                </div>
                            ) : (
                                recentGroups.data.map((group) => (
                                    <Link
                                        key={group.id}
                                        href={`/analysis-groups/${group.id}`}
                                        className="block rounded-lg border p-4 transition hover:border-primary/40 hover:bg-muted/40"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {group.name}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {group.transactions_count}{' '}
                                                    transaksi
                                                </p>
                                            </div>
                                            <ProfitBadge
                                                status={group.status}
                                            />
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <span
                                                className={
                                                    group.profit >= 0
                                                        ? 'text-emerald-600'
                                                        : 'text-rose-600'
                                                }
                                            >
                                                {formatMoney(group.profit)}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {formatPercent(
                                                    group.roi_percent,
                                                )}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-lg shadow-xs">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">
                            Transaksi Terbaru
                        </CardTitle>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/transactions">
                                Semua Transaksi
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Pair</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead className="text-right">
                                        Jumlah
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Total
                                    </TableHead>
                                    <TableHead>Status Analisa</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-28 text-center text-muted-foreground"
                                        >
                                            Belum ada transaksi.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentTransactions.data.map(
                                        (transaction) => (
                                            <TableRow key={transaction.id}>
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
                                                        type={transaction.type}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {formatCrypto(
                                                        transaction.amount,
                                                    )}
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
                                                            ? 'Sudah Dianalisa'
                                                            : 'Belum Dianalisa'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

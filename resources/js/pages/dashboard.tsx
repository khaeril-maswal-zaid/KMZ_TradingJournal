import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    CircleDollarSign,
    FileSpreadsheet,
    LineChart,
    Package,
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

type PortfolioAsset = {
    asset: string;
    pair: string;
    remaining_amount: number;
    average_buy_price: number;
    cost_basis: number;
    estimated_value: number | null;
    unrealized_pnl: number | null;
    last_updated: string;
    last_updated_label: string;
};

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
    portfolioAssets: ResourceCollection<PortfolioAsset>;
    recentTransactions: ResourceCollection<Transaction>;
    recentGroups: ResourceCollection<AnalysisGroup>;
};

export default function Dashboard({
    stats,
    monthlyProfit,
    portfolioAssets,
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
                        title="Jumlah Transaksi"
                        value={stats.transactions_count.toString()}
                        helper="Data raw hasil import"
                        icon={FileSpreadsheet}
                    />
                    <ProfitCard
                        title="Total ROI"
                        value={formatPercent(stats.total_roi)}
                        helper="Berdasarkan total buy dan sell"
                        icon={BarChart3}
                        tone={stats.total_roi >= 0 ? 'green' : 'red'}
                    />
                    <ProfitCard
                        title="Total Sell"
                        value={formatMoney(stats.total_sell)}
                        helper="Seluruh hasil transaksi SELL"
                        icon={ReceiptText}
                        tone="amber"
                    />
                    <ProfitCard
                        title="Grup Analisa"
                        value={stats.analysis_groups_count.toString()}
                        helper="Trade grouping aktif"
                        icon={LineChart}
                    />
                </div>

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
                                        (Math.abs(item.profit) / maxAbsProfit) *
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
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">
                                Portfolio Assets Summary
                            </CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Ringkasan aset yang masih dimiliki (open
                                position)
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {portfolioAssets.data?.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                <Package className="mx-auto mb-3 size-8 opacity-40" />
                                Belum ada open position. Lakukan transaksi BUY
                                untuk memulai.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Asset</TableHead>
                                            <TableHead>Pair</TableHead>
                                            <TableHead className="text-right">
                                                Remaining Amount
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Avg Buy Price
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Cost Basis
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Est. Value
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Unrealized PNL
                                            </TableHead>
                                            <TableHead className="text-right text-xs">
                                                Last Updated
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {portfolioAssets.data?.map((asset) => (
                                            <TableRow key={asset.pair}>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono"
                                                    >
                                                        {asset.asset}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {asset.pair}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {formatCrypto(
                                                        asset.remaining_amount,
                                                        asset.asset,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {formatMoney(
                                                        asset.average_buy_price,
                                                        asset.pair.split(
                                                            '/',
                                                        )[1],
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {formatMoney(
                                                        asset.cost_basis,
                                                        asset.pair.split(
                                                            '/',
                                                        )[1],
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground">
                                                    {asset.estimated_value
                                                        ? formatMoney(
                                                              asset.estimated_value,
                                                              asset.pair.split(
                                                                  '/',
                                                              )[1],
                                                          )
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground">
                                                    {asset.unrealized_pnl
                                                        ? formatMoney(
                                                              asset.unrealized_pnl,
                                                              asset.pair.split(
                                                                  '/',
                                                              )[1],
                                                          )
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-muted-foreground">
                                                    {asset.last_updated_label}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
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

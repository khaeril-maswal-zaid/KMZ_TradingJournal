import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpDown,
    FileSpreadsheet,
    MoreHorizontal,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import { TransactionTypeBadge } from '@/components/trading/transaction-type-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCrypto, formatMoney } from '@/lib/trading';
import type { Paginated, Transaction } from '@/types';
import { index as indexTrans } from '@/routes/transactions';
import { index as indexMatching } from '@/routes/tradematching';
import { show } from '@/routes/tradematching';

type Filters = {
    search: string;
    type: 'ALL' | 'BUY' | 'SELL';
    analysis: 'all' | 'analyzed' | 'unreviewed';
    sort: string;
    direction: 'asc' | 'desc';
};

type Props = {
    transactions: Paginated<Transaction>;
    filters: Filters;
};

const typeTabs: { label: string; value: Filters['type'] }[] = [
    { label: 'Semua', value: 'ALL' },
    { label: 'BUY', value: 'BUY' },
    { label: 'SELL', value: 'SELL' },
];

function paginationLabel(label: string): string {
    return label.replace('&laquo;', '<').replace('&raquo;', '>');
}

export default function TransactionsIndex({ transactions, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

    const visit = (nextFilters: Partial<Filters>): void => {
        const merged = { ...filters, ...nextFilters };

        router.get(
            indexTrans.url(),
            {
                search: merged.search || undefined,
                type: merged.type === 'ALL' ? undefined : merged.type,
                analysis:
                    merged.analysis === 'all' ? undefined : merged.analysis,
                sort: merged.sort,
                direction: merged.direction,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const sortBy = (field: string): void => {
        visit({
            sort: field,
            direction:
                filters.sort === field && filters.direction === 'desc'
                    ? 'asc'
                    : 'desc',
        });
    };

    return (
        <>
            <Head title="Transaksi" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                            Transaksi
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Data raw hasil import sebagai source of truth jurnal
                            trading.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/transactions/import">
                            <FileSpreadsheet className="size-4" />
                            Import Data
                        </Link>
                    </Button>
                </div>

                <Card className="rounded-lg shadow-xs">
                    <CardContent className="space-y-4 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap gap-2">
                                {typeTabs.map((tab) => (
                                    <Button
                                        key={tab.value}
                                        variant={
                                            filters.type === tab.value
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            visit({ type: tab.value })
                                        }
                                    >
                                        {tab.label}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                visit({ search });
                                            }
                                        }}
                                        placeholder="Cari pair atau aset"
                                        className="w-full pl-9 sm:w-72"
                                    />
                                </div>
                                <Select
                                    value={filters.analysis}
                                    onValueChange={(value) =>
                                        visit({
                                            analysis:
                                                value as Filters['analysis'],
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Status analisa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Status
                                        </SelectItem>
                                        <SelectItem value="unreviewed">
                                            Belum Dianalisa
                                        </SelectItem>
                                        <SelectItem value="analyzed">
                                            Sudah Dianalisa
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        ['No', 'id'],
                                        ['Tanggal', 'executed_at'],
                                        ['Pair', 'pair'],
                                        ['Tipe', 'type'],
                                        ['Harga', 'price'],
                                        ['Jumlah', 'amount'],
                                        ['Total', 'total'],
                                    ].map(([label, field]) => (
                                        <TableHead
                                            key={field}
                                            className={
                                                [
                                                    'price',
                                                    'amount',
                                                    'total',
                                                ].includes(field)
                                                    ? 'text-right'
                                                    : undefined
                                            }
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={
                                                    [
                                                        'price',
                                                        'amount',
                                                        'total',
                                                    ].includes(field)
                                                        ? 'ml-auto'
                                                        : '-ml-3'
                                                }
                                                onClick={() => sortBy(field)}
                                            >
                                                {label}
                                                <ArrowUpDown className="size-3.5" />
                                            </Button>
                                        </TableHead>
                                    ))}
                                    <TableHead>Fee</TableHead>
                                    <TableHead>Status Analisa</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="h-36 text-center text-muted-foreground"
                                        >
                                            Belum ada transaksi sesuai filter.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.data.map(
                                        (transaction, index) => (
                                            <TableRow
                                                key={transaction.id}
                                                className="h-10"
                                            >
                                                <TableCell className="py-0 text-xs">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="py-0 text-xs text-muted-foreground">
                                                    {
                                                        transaction.executed_at_label
                                                    }
                                                </TableCell>
                                                <TableCell className="py-0 text-xs text-muted-foreground">
                                                    {transaction.pair}
                                                </TableCell>
                                                <TableCell className="py-0 text-xs">
                                                    <TransactionTypeBadge
                                                        type={transaction.type}
                                                    />
                                                </TableCell>
                                                <TableCell className="py-0 text-right text-xs tabular-nums">
                                                    {formatMoney(
                                                        transaction.price,
                                                        transaction.quote_asset,
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-0 text-right text-xs tabular-nums">
                                                    {formatCrypto(
                                                        transaction.amount,
                                                        transaction.base_asset,
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-0 text-right text-xs tabular-nums">
                                                    {formatMoney(
                                                        transaction.total,
                                                        transaction.quote_asset,
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-0 text-xs text-muted-foreground">
                                                    {formatCrypto(
                                                        transaction.fee_amount,
                                                        transaction.fee_coin,
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-0 text-xs">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            transaction.is_analyzed
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                : ''
                                                        }
                                                    >
                                                        {transaction.is_analyzed
                                                            ? 'Sudah Dianalisa'
                                                            : 'Belum Dianalisa'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-0 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {transaction.analysis_group ? (
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={show.url(
                                                                            transaction
                                                                                .analysis_group
                                                                                .key,
                                                                        )}
                                                                    >
                                                                        Buka
                                                                        Analisa
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={indexMatching.url()}
                                                                    >
                                                                        Masukkan
                                                                        ke
                                                                        Analisa
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )
                                )}
                            </TableBody>
                        </Table>

                        <div className="flex flex-col justify-between gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center">
                            <span>
                                Menampilkan {transactions.meta.from ?? 0}-
                                {transactions.meta.to ?? 0} dari{' '}
                                {transactions.meta.total} transaksi
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {transactions.meta.links.map((link, index) => (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        asChild={Boolean(link.url)}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>
                                                {paginationLabel(link.label)}
                                            </Link>
                                        ) : (
                                            <span>
                                                {paginationLabel(link.label)}
                                            </span>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TransactionsIndex.layout = {
    breadcrumbs: [{ title: 'Transaksi', href: '/transactions' }],
};

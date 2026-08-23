import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    Boxes,
    ExternalLink,
    MoreHorizontal,
    Search,
    WalletCards,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCrypto, formatMoney } from '@/lib/trading';
import { index as openPositionsIndex } from '@/routes/openpositions';
import { show as showMatching } from '@/routes/tradematching';
import type { OpenPosition, OpenPositionStatus, Paginated } from '@/types';

type Filters = {
    search: string;
    status: 'all' | OpenPositionStatus;
};

type Summary = {
    open_positions_count: number;
    total_open_value: number;
    unique_assets_count: number;
};

type Props = {
    positions: Paginated<OpenPosition>;
    filters: Filters;
    summary: Summary;
};

function paginationLabel(label: string): string {
    return label.replace('&laquo;', '<').replace('&raquo;', '>');
}

function statusBadge(status: OpenPositionStatus) {
    if (status === 'OPEN') {
        return (
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                OPEN
            </Badge>
        );
    }

    return (
        <Badge variant="secondary" className="text-muted-foreground">
            CLOSED
        </Badge>
    );
}

export default function OpenPositionsIndex({
    positions,
    filters,
    summary,
}: Props) {
    const [search, setSearch] = useState(filters.search);

    const visit = (nextFilters: Partial<Filters>): void => {
        const merged = { ...filters, ...nextFilters };

        router.get(
            openPositionsIndex.url(),
            {
                search: merged.search || undefined,
                status: merged.status === 'all' ? undefined : merged.status,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Posisi Terbuka" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                            Posisi Terbuka
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Sisa aset dari hasil analisa trade matching yang
                            masih menjadi modal berjalan.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-lg shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Jumlah Posisi Terbuka
                            </CardTitle>
                            <WalletCards className="size-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {summary.open_positions_count}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Nilai Modal
                            </CardTitle>
                            <BarChart3 className="size-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {formatMoney(summary.total_open_value, 'USDT')}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Jumlah Asset Unik
                            </CardTitle>
                            <Boxes className="size-4 text-violet-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {summary.unique_assets_count}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-lg shadow-xs">
                    <CardContent className="space-y-4 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
                                    placeholder="Cari aset atau grup"
                                    className="w-full pl-9 sm:w-96"
                                />
                            </div>
                            <Select
                                value={filters.status}
                                onValueChange={(value) =>
                                    visit({
                                        status: value as Filters['status'],
                                    })
                                }
                            >
                                <SelectTrigger className="w-full sm:w-44">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="OPEN">
                                        Terbuka
                                    </SelectItem>
                                    <SelectItem value="CLOSED">
                                        Tertutup
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <TooltipProvider>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Aset</TableHead>
                                        <TableHead>Grup Sumber</TableHead>
                                        <TableHead className="text-right">
                                            Harga Modal
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Total Modal
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Dibuat</TableHead>
                                        <TableHead className="w-12 text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {positions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                className="h-36 text-center text-muted-foreground"
                                            >
                                                Belum ada posisi sesuai filter.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        positions.data.map((position) => (
                                            <TableRow key={position.id}>
                                                <TableCell className="font-medium">
                                                    {position.asset}
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={showMatching.url(
                                                                    position
                                                                        .analysis_group
                                                                        .key,
                                                                )}
                                                                className="text-xs text-muted-foreground hover:text-blue-600 hover:underline"
                                                            >
                                                                {`...${position.analysis_group.name.slice(-12)}`}
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Buka detail Analysis
                                                            Group
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell className="text-right text-xs tabular-nums">
                                                    {formatMoney(
                                                        position.buy_price,
                                                        'USDT',
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-xs tabular-nums">
                                                    {formatCrypto(
                                                        position.amount,
                                                        position.asset,
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-right text-xs font-medium tabular-nums">
                                                    {formatMoney(
                                                        position.total,
                                                        'USDT',
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {statusBadge(
                                                        position.status,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {position.created_at_label}
                                                </TableCell>
                                                <TableCell className="text-right">
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
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={showMatching.url(
                                                                        position
                                                                            .analysis_group
                                                                            .key,
                                                                    )}
                                                                >
                                                                    <ExternalLink className="size-4" />
                                                                    Buka Grup
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TooltipProvider>

                        <div className="flex flex-col justify-between gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center">
                            <span>
                                Menampilkan {positions.meta.from ?? 0}-
                                {positions.meta.to ?? 0} dari{' '}
                                {positions.meta.total} posisi
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {positions.meta.links.map((link, index) => (
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

OpenPositionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Posisi Terbuka',
            href: openPositionsIndex.url(),
        },
    ],
};

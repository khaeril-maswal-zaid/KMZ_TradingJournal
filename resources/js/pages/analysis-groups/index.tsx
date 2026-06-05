import { Head, Link, router } from '@inertiajs/react';
import { Loader2, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProfitBadge } from '@/components/trading/profit-badge';
import { TransactionTypeBadge } from '@/components/trading/transaction-type-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { formatMoney, formatPercent } from '@/lib/trading';
import type {
    AnalysisGroup,
    Paginated,
    ResourceCollection,
    Transaction,
} from '@/types';
import { index, show, store } from '@/routes/tradematching';

type Props = {
    groups: Paginated<AnalysisGroup>;
    availableTransactions: ResourceCollection<Transaction>;
};

export default function AnalysisGroupsIndex({
    groups,
    availableTransactions,
}: Props) {
    const [open, setOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);

    const toggleTransaction = (id: number): void => {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
        );
    };

    const submit = (): void => {
        setProcessing(true);

        router.post(
            store.url(),
            {
                transaction_ids: selectedIds,
            },
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

    return (
        <>
            <Head title="Analisa Trading" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                            Analisa Trading
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelompokkan transaksi BUY dan SELL menjadi satu sesi
                            analisa.
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="size-4" />
                                Buat Analisa
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Buat Grup Analisa</DialogTitle>
                                <DialogDescription>
                                    Pilih transaksi yang saling berhubungan
                                    dalam satu analisa trading.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="max-h-72 overflow-auto rounded-lg border">
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
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {availableTransactions.data.length ===
                                        0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    Tidak ada transaksi
                                                    tersedia.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            availableTransactions.data.map(
                                                (transaction) => (
                                                    <TableRow
                                                        key={transaction.id}
                                                        data-state={
                                                            selectedIds.includes(
                                                                transaction.id,
                                                            )
                                                                ? 'selected'
                                                                : undefined
                                                        }
                                                        className="cursor-pointer"
                                                        onClick={() =>
                                                            toggleTransaction(
                                                                transaction.id,
                                                            )
                                                        }
                                                    >
                                                        <TableCell
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >
                                                            <Checkbox
                                                                checked={selectedIds.includes(
                                                                    transaction.id,
                                                                )}
                                                                onCheckedChange={() =>
                                                                    toggleTransaction(
                                                                        transaction.id,
                                                                    )
                                                                }
                                                            />
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
                                                    </TableRow>
                                                ),
                                            )
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
                                <Button onClick={submit} disabled={processing}>
                                    {processing && (
                                        <Loader2 className="size-4 animate-spin" />
                                    )}
                                    Simpan Analisa
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="rounded-lg shadow-xs">
                    <CardContent className="p-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Key Analisa Trading</TableHead>
                                    <TableHead className="text-right">
                                        Total Buy
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Total Sell
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Profit
                                    </TableHead>
                                    <TableHead className="text-right">
                                        ROI
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Jumlah Transaksi
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groups.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-36 text-center text-muted-foreground"
                                        >
                                            Belum ada grup analisa.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    groups.data.map((group) => (
                                        <TableRow key={group.key}>
                                            <TableCell>
                                                <Link
                                                    href={show.url(group.key)}
                                                    className="font-medium hover:underline"
                                                >
                                                    {group.key}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatMoney(group.total_buy)}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatMoney(group.total_sell)}
                                            </TableCell>
                                            <TableCell
                                                className={`text-right tabular-nums ${group.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                                            >
                                                {formatMoney(group.profit)}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatPercent(
                                                    group.roi_percent,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {group.transactions_count}
                                            </TableCell>
                                            <TableCell>
                                                <ProfitBadge
                                                    status={group.status}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <div className="mt-4 flex flex-col justify-between gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center">
                            <span>
                                Menampilkan {groups.meta.from ?? 0}-
                                {groups.meta.to ?? 0} dari {groups.meta.total}{' '}
                                analisa
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {groups.meta.links.map((link, index) => (
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
                                                {link.label
                                                    .replace('&laquo;', '<')
                                                    .replace('&raquo;', '>')}
                                            </Link>
                                        ) : (
                                            <span>
                                                {link.label
                                                    .replace('&laquo;', '<')
                                                    .replace('&raquo;', '>')}
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

AnalysisGroupsIndex.layout = {
    breadcrumbs: [{ title: 'Trade Matching', href: index.url() }],
};

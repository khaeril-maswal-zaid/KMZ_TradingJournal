import { Head, Link, router } from '@inertiajs/react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import { formatCrypto, formatMoney, formatPercent } from '@/lib/trading';
import type {
    AnalysisGroup,
    Paginated,
    ResourceCollection,
    Transaction,
} from '@/types';
import { index, show, store, destroy } from '@/routes/tradematching';
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
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

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
            <Head title="Trade Matching" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                            Trade Matching
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelompokkan transaksi BUY dan SELL menjadi satu sesi
                            trade matching.
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="size-4" />
                                Buat Matching
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>
                                    Buat Grup Trade Matching
                                </DialogTitle>
                                <DialogDescription>
                                    Pilih transaksi yang saling berhubungan
                                    dalam satu trade matching.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="max-h-72 overflow-auto rounded-lg border">
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
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {availableTransactions?.data?.length ===
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
                                            availableTransactions?.data?.map(
                                                (transaction, key) => (
                                                    <TableRow
                                                        key={
                                                            key ||
                                                            transaction.id
                                                        }
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
                                    <TableHead>Key Matching</TableHead>
                                    <TableHead>Tanggal Eksekusi</TableHead>
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
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groups.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
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
                                                    className="py-0 text-xs text-muted-foreground hover:text-blue-600 hover:underline"
                                                >
                                                    {`...${group.key.slice(-12)}`}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="py-0 text-xs text-muted-foreground">
                                                {group.executed_at}
                                            </TableCell>
                                            <TableCell className="py-0 text-right text-xs tabular-nums">
                                                {formatMoney(
                                                    group.total_buy,
                                                    'USDT',
                                                )}
                                            </TableCell>
                                            <TableCell className="py-0 text-right text-xs tabular-nums">
                                                {formatMoney(
                                                    group.total_sell,
                                                    'USDT',
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className={`py-0 text-right text-xs tabular-nums ${group.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                                            >
                                                {formatMoney(
                                                    group.profit,
                                                    'USDT',
                                                )}
                                            </TableCell>
                                            <TableCell className="py-0 text-right text-xs tabular-nums">
                                                {formatPercent(
                                                    group.roi_percent,
                                                )}
                                            </TableCell>
                                            <TableCell className="py-0 text-center text-xs">
                                                {group.transactions_count}
                                            </TableCell>
                                            <TableCell>
                                                <ProfitBadge
                                                    status={group.status}
                                                />
                                            </TableCell>
                                            <TableCell className="py-0 text-right text-xs">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setGroupToDelete(
                                                            group.key,
                                                        );
                                                        setDeleteConfirmOpen(
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <AlertDialog
                            open={deleteConfirmOpen}
                            onOpenChange={setDeleteConfirmOpen}
                        >
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Hapus Trade Matching
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah Anda yakin ingin menghapus grup
                                        analisa ini? Tindakan ini akan menghapus
                                        grup dan melepaskan transaksi yang
                                        terkait.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => {
                                            if (!groupToDelete) return;

                                            router.delete(
                                                destroy.url(groupToDelete),
                                                {
                                                    preserveScroll: true,
                                                    onFinish: () => {
                                                        setDeleteConfirmOpen(
                                                            false,
                                                        );
                                                        setGroupToDelete(null);
                                                    },
                                                },
                                            );
                                        }}
                                    >
                                        Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

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

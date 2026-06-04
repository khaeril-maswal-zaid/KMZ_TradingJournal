import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BarChart3, Table2, WalletCards } from 'lucide-react';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="KMZ Trading Journal" />
            <main className="min-h-screen bg-background text-foreground">
                <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6">
                    <header className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <BarChart3 className="size-5" />
                            </div>
                            <span className="font-semibold">
                                KMZ Trading Journal
                            </span>
                        </div>
                        <nav className="flex items-center gap-2 text-sm">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
                                >
                                    Buka Ringkasan
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex h-9 items-center rounded-md px-4 font-medium hover:bg-muted"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex h-9 items-center rounded-md bg-primary px-4 font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_420px]">
                        <div className="max-w-2xl">
                            <p className="text-sm font-medium text-muted-foreground">
                                Jurnal trading crypto harian
                            </p>
                            <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
                                Catat transaksi, baca performa, ambil keputusan
                                lebih tenang.
                            </h1>
                            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                                Import data dari spreadsheet, rapikan riwayat
                                trading, dan pantau keuntungan serta kerugian
                                dalam satu ruang kerja.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href={auth.user ? dashboard() : login()}
                                    className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
                                >
                                    Mulai
                                    <ArrowRight className="size-4" />
                                </Link>
                                <Link
                                    href="/transactions/import"
                                    className="inline-flex h-10 items-center gap-2 rounded-md border px-5 text-sm font-medium hover:bg-muted"
                                >
                                    <Table2 className="size-4" />
                                    Import Data
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <p className="text-sm font-medium">
                                        Preview Jurnal
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Hari ini
                                    </p>
                                </div>
                                <WalletCards className="size-5 text-muted-foreground" />
                            </div>
                            <div className="grid gap-3 py-4">
                                {[
                                    ['BTCUSDT', 'BUY', '0,0008', '52 USDT'],
                                    ['ETHUSDT', 'SELL', '0,12', '438 USDT'],
                                    ['SOLUSDT', 'BUY', '3,5', '615 USDT'],
                                ].map(([pair, type, amount, total]) => (
                                    <div
                                        key={`${pair}-${type}`}
                                        className="grid grid-cols-[1fr_auto] gap-3 rounded-md border bg-background p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {pair}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {amount}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-sm">
                                                {total}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {type}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-3 border-t pt-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Keuntungan
                                    </p>
                                    <p className="font-semibold text-emerald-600">
                                        +128 USDT
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Kerugian
                                    </p>
                                    <p className="font-semibold text-rose-600">
                                        -34 USDT
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

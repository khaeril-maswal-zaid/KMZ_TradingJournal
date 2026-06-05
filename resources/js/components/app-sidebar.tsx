import { Link } from '@inertiajs/react';
import {
    BarChart3,
    ChartCandlestick,
    ClipboardList,
    FileSpreadsheet,
    LayoutDashboard,
    LineChart,
    ReceiptText,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import AppearanceToggleTab from '@/components/appearance-tabs';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as transIndex } from '@/routes/transactions';
import { index as matchingsIndex } from '@/routes/tradematching';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Transaksi',
        href: transIndex.url(),
        icon: ReceiptText,
    },
    {
        title: 'Trade Matching',
        href: matchingsIndex.url(),
        icon: ChartCandlestick,
    },
    {
        title: 'Deposit',
        href: '/deposits',
        icon: Wallet,
    },
    {
        title: 'Rencana Trading',
        href: '/trading-plans',
        icon: ClipboardList,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

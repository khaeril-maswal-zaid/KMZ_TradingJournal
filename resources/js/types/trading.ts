export type TransactionType = 'BUY' | 'SELL';
export type AnalysisStatus = 'PROFIT' | 'LOSS' | 'BREAK_EVEN';
export type OpenPositionStatus = 'OPEN' | 'CLOSED';
export type SelectableAnalysisItemSource = 'TRANSACTION' | 'OPEN_POSITION';

export type Transaction = {
    id: number;
    uuid: string;
    pair: string;
    selection_id: string;
    base_asset: string;
    quote_asset: string;
    type: TransactionType;
    price: number;
    amount: number;
    total: number;
    fee_amount: number;
    fee_coin: string | null;
    executed_at: string;
    executed_at_label: string;
    notes: string | null;
    is_analyzed: boolean;
    source: string;
    analysis_group?: {
        key: string;
    } | null;
};

export type AnalysisGroup = {
    id: number;
    executed_at: string;
    key: string;
    total_buy: number;
    total_buy_amount: number;
    average_buy_price: number;
    total_sell: number;
    total_sell_amount: number;
    average_sell_price: number;
    profit: number;
    roi_percent: number;
    status: AnalysisStatus;
    transactions_count: number;
    created_at: string;
    created_at_label: string;
    transactions?: Transaction[];
};

export type OpenPosition = {
    id: number;
    uuid: string;
    asset: string;
    buy_price: number;
    amount: number;
    total: number;
    status: OpenPositionStatus;
    created_at: string;
    created_at_label: string;
    analysis_group: {
        id: number;
        key: string;
        name: string;
    };
};

export type SelectableAnalysisItem = Transaction & {
    selection_id: string;
    source: SelectableAnalysisItemSource;
    source_label: string;
    max_allocatable_amount: number;
};

export type Paginated<T> = {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
        links: {
            url: string | null;
            label: string;
            page: number | null;
            active: boolean;
        }[];
    };
};
export type ResourceCollection<T> = {
    data: T[];
};

export type ResourceItem<T> = {
    data: T;
};

export type SellBreakdown = {
    id: number;
    label: string;
    transaction: ResourceItem<Transaction>;
    subtotal_buy: number;
    subtotal_sell: number;
    profit: number;
    roi_percent: number;
    status: AnalysisStatus;
};

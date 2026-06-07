export type TransactionImportVersion = 'v1' | 'v2';

export type TransactionImportField =
    | 'executed_at'
    | 'pair'
    | 'base_asset'
    | 'quote_asset'
    | 'type'
    | 'price'
    | 'amount'
    | 'total'
    | 'fee_amount'
    | 'fee_coin';

export type TransactionImportFieldV2 =
    | 'time'
    | 'pair'
    | 'side'
    | 'price'
    | 'executed'
    | 'amount'
    | 'fee';

export type TransactionImportRow = Record<TransactionImportField, string> & {
    id: string;
};

export type TransactionImportRowV2 = Record<
    TransactionImportFieldV2,
    string
> & {
    id: string;
};

export type TransactionImportPayload = Record<TransactionImportField, string>;

export type TransactionImportColumn = {
    key: TransactionImportField;
    label: string;
    placeholder: string;
    width: string;
    align?: 'left' | 'right' | 'center';
};

export type TransactionImportColumnV2 = {
    key: TransactionImportFieldV2;
    label: string;
    placeholder: string;
    width: string;
    align?: 'left' | 'right' | 'center';
};

export type TransactionImportSummary = {
    filledRows: number;
    validRows: number;
    invalidRows: number;
    buyRows: number;
    sellRows: number;
};

export type RecentTransaction = {
    id: number;
    traded_at: string;
    pair: string;
    type: 'BUY' | 'SELL';
    total: string;
    quote_asset: string;
};

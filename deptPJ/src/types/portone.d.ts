export interface RequestPayResponse {
    success: boolean;
    error_code?: string;
    error_msg?: string;
    imp_uid?: string;
    merchant_uid?: string;
    pay_method?: string;
    paid_amount?: number;
    status?: string;
    name?: string;
    pg_provider?: string;
    emb_pg_provider?: string;
    pg_tid?: string;
    buyer_name?: string;
    buyer_email?: string;
    buyer_tel?: string;
    buyer_addr?: string;
    buyer_postcode?: string;
    custom_data?: any;
    paid_at?: number;
    receipt_url?: string;
}

export interface RequestPayParams {
    pg?: string;
    pay_method: string;
    merchant_uid: string;
    name: string;
    amount: number;
    buyer_email?: string;
    buyer_name?: string;
    buyer_tel?: string;
    buyer_addr?: string;
    buyer_postcode?: string;
    app_scheme?: string; // For mobile app return
    custom_data?: any;
    display?: {
        card_quota?: number[];
    };
}

export interface Iamport {
    init: (accountID: string) => void;
    request_pay: (
        params: RequestPayParams,
        callback?: (response: RequestPayResponse) => void
    ) => void;
}

declare global {
    interface Window {
        IMP: Iamport;
    }
}

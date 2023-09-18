export interface OrderInterface {

    symbol: string;
    status: string;
    side: string;
    order_id: number;
    user_id: number;
    price: number;
    type: string;
    quantity: number;
    amount: string;
    visible: number;
    executed: number;
    total_fee: number;
    fee_asset: string;
    client_order_id: string;
    average_executed_price: string;
    created_time: number;
    updated_time: number;
    broker_id: string;
}
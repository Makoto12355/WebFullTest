export type Category = {
    catagory_id: number;
    catagory_name: string;
};

export type Menu = {
    menu_id: number;
    food_name: string;
    price: number;
    is_available: boolean;
    catagory_id: number;
    image_path?: string | null;
};

export type CafeTable = {
    table_id: number;
    table_no?: number;
    is_occupied: boolean;
    is_active?: boolean;
};

export type OrderStatus = "waiting" | "preparing" | "completed" | "cancelled";

export type TableDetailItem = {
    order_item_id: number;
    order_id: number;
    menu_id: number;
    quantity: number;
    unit_price: number;
    note?: string | null;
    menu?: {
        food_name?: string;
        image_path?: string | null;
        catagory_id?: number;
    } | null;
};

export type TableDetailOrder = {
    order_id: number;
    bill_no?: string | null;
    table_id: number;
    order_status: OrderStatus;
    ordered_at?: string | null;
    items: TableDetailItem[];
};

export type TableDetailResponse = {
    table: CafeTable;
    orders: TableDetailOrder[];
};
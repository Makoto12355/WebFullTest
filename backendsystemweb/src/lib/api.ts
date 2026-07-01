export const API_BASE = "http://localhost:3000/api";

export type ApiResult<T> = {
    success: boolean;
    message: string;
    data: T;
};

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
    table_no: number;
    is_occupied: boolean;
    is_active: boolean;
};

export type OrderStatus = "waiting" | "preparing" | "completed" | "cancelled";

export type Order = {
    order_id: number;
    bill_no?: string | null;
    table_id: number;
    order_status: OrderStatus;
    ordered_at?: string | null;
};

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message =
            typeof data === "object" && data?.message ? data.message : "Request failed";
        throw new Error(message);
    }

    return data as T;
}

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
    order_status: "waiting" | "preparing" | "completed" | "cancelled";
    ordered_at?: string | null;
    items: TableDetailItem[];
};

export type TableDetailResponse = {
    table: CafeTable;
    orders: TableDetailOrder[];
};
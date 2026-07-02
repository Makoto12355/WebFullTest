const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
    throw new Error("ไม่พบ VITE_API_BASE_URL");
}

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

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
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
            typeof data === "object" && data !== null && "message" in data
                ? String((data as { message?: string }).message || "Request failed")
                : "Request failed";

        throw new Error(message);
    }

    return data as T;
}

export { apiFetch };

export async function fetchTables() {
    return apiFetch<ApiResult<CafeTable[]>>("/tables");
}

export async function fetchCategories() {
    return apiFetch<ApiResult<Category[]>>("/categories");
}

export async function fetchMenus() {
    return apiFetch<ApiResult<Menu[]>>("/menus");
}

export async function fetchTableDetail(tableId: number) {
    return apiFetch<ApiResult<TableDetailResponse>>(`/tables/${tableId}/detail`);
}

export async function createOrder(tableId: number) {
    return apiFetch<ApiResult<{
        order_id: number;
        bill_no?: string | null;
        table_id: number;
        table_no?: number | null;
        order_status: OrderStatus;
        ordered_at?: string | null;
    }>>("/orders", {
        method: "POST",
        body: JSON.stringify({
            table_id: tableId,
            order_status: "waiting"
        })
    });
}

export async function addOrderItem(
    orderId: number,
    menuId: number,
    quantity = 1,
    note: string | null = null
) {
    return apiFetch(`/orders/${orderId}/items`, {
        method: "POST",
        body: JSON.stringify({
            menu_id: menuId,
            quantity,
            note
        })
    });
}

export async function updateOrderItem(
    orderItemId: number,
    quantity: number,
    note: string | null = null
) {
    return apiFetch(`/order-items/${orderItemId}`, {
        method: "PUT",
        body: JSON.stringify({
            quantity,
            note
        })
    });
}

export async function deleteOrderItem(orderItemId: number) {
    return apiFetch(`/order-items/${orderItemId}`, {
        method: "DELETE"
    });
}

export async function updateOrderStatus(orderId: number, orderStatus: OrderStatus) {
    return apiFetch(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({
            order_status: orderStatus
        })
    });
}

export async function updateTableStatus(tableId: number, isOccupied: boolean) {
    return apiFetch(`/tables/${tableId}/status`, {
        method: "PUT",
        body: JSON.stringify({
            is_occupied: isOccupied
        })
    });
}
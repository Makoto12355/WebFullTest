import type {
    CafeTable,
    Category,
    Menu,
    OrderStatus,
    TableDetailResponse
} from "../types/pos";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
    throw new Error("ไม่พบ VITE_API_BASE_URL");
}

export type ApiResult<T> = {
    success: boolean;
    message: string;
    data: T;
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

export async function addOrderItem(orderId: number, menuId: number, quantity = 1, note: string | null = null) {
    return apiFetch(`/orders/${orderId}/items`, {
        method: "POST",
        body: JSON.stringify({
            menu_id: menuId,
            quantity,
            note
        })
    });
}

export async function updateOrderItem(orderItemId: number, quantity: number, note: string | null = null) {
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
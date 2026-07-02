import { useEffect, useMemo, useState } from "react";
import {
    addOrderItem,
    createOrder,
    deleteOrderItem,
    fetchCategories,
    fetchMenus,
    fetchTableDetail,
    fetchTables,
    updateOrderItem,
    updateOrderStatus,
    updateTableStatus
} from "../lib/api";
import type {
    CafeTable,
    Category,
    Menu,
    OrderStatus,
    TableDetailItem,
    TableDetailResponse
} from "../types/pos";
import TableList from "../components/TableList";
import CategoryBar from "../components/CategoryBar";
import MenuGrid from "../components/MenuGrid";
import OrderPanel from "../components/OrderPanel";

export default function PosPage() {
    const [tables, setTables] = useState<CafeTable[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [tableDetail, setTableDetail] = useState<TableDetailResponse | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadTablesOnly() {
        const result = await fetchTables();
        setTables(result.data || []);
    }

    async function loadCatalogOnly() {
        const [categoryResult, menuResult] = await Promise.all([
            fetchCategories(),
            fetchMenus()
        ]);
        setCategories(categoryResult.data || []);
        setMenus(menuResult.data || []);
    }

    async function loadInitialData() {
        setLoading(true);
        setError("");

        try {
            await Promise.all([loadTablesOnly(), loadCatalogOnly()]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }

    async function loadSelectedTable(tableId: number) {
        setDetailLoading(true);
        setError("");

        try {
            const result = await fetchTableDetail(tableId);
            setTableDetail(result.data);
            setSelectedTableId(tableId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดรายละเอียดโต๊ะไม่สำเร็จ");
        } finally {
            setDetailLoading(false);
        }
    }

    async function refreshSelectedTable() {
        if (!selectedTableId) return;
        const result = await fetchTableDetail(selectedTableId);
        setTableDetail(result.data);
    }

    useEffect(() => {
        loadInitialData();
    }, []);

    const selectedTable = useMemo(() => {
        if (tableDetail?.table) return tableDetail.table;
        if (!selectedTableId) return null;
        return tables.find((table) => table.table_id === selectedTableId) || null;
    }, [tableDetail, selectedTableId, tables]);

    const filteredMenus = useMemo(() => {
        return menus.filter((menu) => {
            if (!menu.is_available) return false;

            const matchCategory =
                selectedCategoryId === "all" || menu.catagory_id === selectedCategoryId;

            const keyword = search.trim().toLowerCase();
            const matchSearch =
                keyword.length === 0 || menu.food_name.toLowerCase().includes(keyword);

            return matchCategory && matchSearch;
        });
    }, [menus, selectedCategoryId, search]);

    const activeOrder = useMemo(() => {
        if (!tableDetail?.orders) return null;

        return (
            tableDetail.orders.find(
                (order) =>
                    (order.order_status === "waiting" || order.order_status === "preparing") &&
                    order.items.length > 0
            ) || null
        );
    }, [tableDetail]);

    const subtotal = useMemo(() => {
        if (!activeOrder) return 0;

        return activeOrder.items.reduce((sum, item) => {
            return sum + item.quantity * item.unit_price;
        }, 0);
    }, [activeOrder]);

    async function closeEmptyOrder(orderId: number, tableId: number) {
        await updateOrderStatus(orderId, "cancelled");
        await updateTableStatus(tableId, false);
    }

    async function handleAddMenu(menu: Menu) {
        if (!selectedTableId) {
            alert("กรุณาเลือกโต๊ะก่อน");
            return;
        }

        setActionLoading(true);
        setError("");

        try {
            if (activeOrder) {
                const existingItem = activeOrder.items.find((item) => item.menu_id === menu.menu_id);

                if (existingItem) {
                    await updateOrderItem(
                        existingItem.order_item_id,
                        existingItem.quantity + 1,
                        existingItem.note || null
                    );
                } else {
                    await addOrderItem(activeOrder.order_id, menu.menu_id, 1, null);
                }
            } else {
                const created = await createOrder(selectedTableId);
                await updateTableStatus(selectedTableId, true);
                await addOrderItem(created.data.order_id, menu.menu_id, 1, null);
            }

            await Promise.all([refreshSelectedTable(), loadTablesOnly()]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เพิ่มเมนูไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleIncreaseItem(item: TableDetailItem) {
        setActionLoading(true);
        setError("");

        try {
            await updateOrderItem(item.order_item_id, item.quantity + 1, item.note || null);
            await refreshSelectedTable();
        } catch (err) {
            setError(err instanceof Error ? err.message : "เพิ่มจำนวนไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDecreaseItem(item: TableDetailItem) {
        setActionLoading(true);
        setError("");

        try {
            const isLastItem =
                !!activeOrder &&
                !!selectedTableId &&
                activeOrder.items.length === 1 &&
                item.quantity === 1;

            if (item.quantity <= 1) {
                await deleteOrderItem(item.order_item_id);

                if (isLastItem && activeOrder && selectedTableId) {
                    await closeEmptyOrder(activeOrder.order_id, selectedTableId);
                }
            } else {
                await updateOrderItem(item.order_item_id, item.quantity - 1, item.note || null);
            }

            await Promise.all([refreshSelectedTable(), loadTablesOnly()]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "ลดจำนวนไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDeleteItem(item: TableDetailItem) {
        setActionLoading(true);
        setError("");

        try {
            const isLastItem =
                !!activeOrder &&
                !!selectedTableId &&
                activeOrder.items.length === 1;

            await deleteOrderItem(item.order_item_id);

            if (isLastItem && activeOrder && selectedTableId) {
                await closeEmptyOrder(activeOrder.order_id, selectedTableId);
            }

            await Promise.all([refreshSelectedTable(), loadTablesOnly()]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "ลบรายการไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateOrderStatus(nextStatus: OrderStatus) {
        if (!activeOrder || !selectedTableId || activeOrder.items.length === 0) return;

        setActionLoading(true);
        setError("");

        try {
            await updateOrderStatus(activeOrder.order_id, nextStatus);

            if (nextStatus === "completed" || nextStatus === "cancelled") {
                await updateTableStatus(selectedTableId, false);
            } else {
                await updateTableStatus(selectedTableId, true);
            }

            await Promise.all([refreshSelectedTable(), loadTablesOnly()]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เปลี่ยนสถานะออเดอร์ไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <div className="pos-page">
            <div className="pos-shell">
                <aside className="pos-sidebar card">
                    <div className="sidebar-head">
                        <h1 className="brand-title">Cafe POS</h1>
                        <p className="brand-subtitle">เลือกโต๊ะเพื่อเริ่มขาย</p>
                    </div>

                    <TableList
                        tables={tables}
                        selectedTableId={selectedTableId}
                        onSelect={loadSelectedTable}
                        loading={loading}
                    />
                </aside>

                <main className="pos-content card">
                    <div className="content-head">
                        <div>
                            <h2 className="section-title">เมนูอาหาร</h2>
                            <p className="section-subtitle">เลือกหมวดหมู่และค้นหาเมนู</p>
                        </div>

                        <input
                            className="search-input"
                            placeholder="ค้นหาเมนู"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <CategoryBar
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        onChange={setSelectedCategoryId}
                    />

                    <MenuGrid
                        menus={filteredMenus}
                        onAdd={handleAddMenu}
                        disabled={actionLoading}
                        loading={loading}
                    />
                </main>

                <OrderPanel
                    selectedTable={selectedTable}
                    selectedTableId={selectedTableId}
                    detailLoading={detailLoading}
                    activeOrder={activeOrder}
                    subtotal={subtotal}
                    actionLoading={actionLoading}
                    onIncrease={handleIncreaseItem}
                    onDecrease={handleDecreaseItem}
                    onDelete={handleDeleteItem}
                    onUpdateStatus={handleUpdateOrderStatus}
                />
            </div>

            {error && <p className="global-error">{error}</p>}
        </div>
    );
}
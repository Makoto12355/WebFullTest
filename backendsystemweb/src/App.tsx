import { useEffect, useMemo, useState } from "react";
import SummaryCards from "./components/SummaryCards";
import CategoriesTab from "./features/categories/CategoriesTab";
import MenusTab from "./features/menus/MenusTab";
import OrdersTab from "./features/orders/OrdersTab";
import TablesTab from "./features/tables/TablesTab";
import {
    apiFetch,
    type ApiResult,
    type CafeTable,
    type Category,
    type Menu,
    type Order
} from "./lib/api";

type TabKey = "categories" | "menus" | "tables" | "orders";

export default function App() {
    const [activeTab, setActiveTab] = useState<TabKey>("categories");
    const [categories, setCategories] = useState<Category[]>([]);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [tables, setTables] = useState<CafeTable[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadAll() {
        setLoading(true);
        setError("");

        try {
            const [categoriesRes, menusRes, tablesRes, ordersRes] = await Promise.all([
                apiFetch<ApiResult<Category[]>>("/categories"),
                apiFetch<ApiResult<Menu[]>>("/menus"),
                apiFetch<ApiResult<CafeTable[]>>("/tables"),
                apiFetch<ApiResult<Order[]>>("/orders")
            ]);

            setCategories(categoriesRes.data || []);
            setMenus(menusRes.data || []);
            setTables(tablesRes.data || []);
            setOrders(ordersRes.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAll();
    }, []);

    const uncategorizedExists = useMemo(
        () => categories.some((item) => Number(item.catagory_id) === 1000),
        [categories]
    );

    return (
        <div className="page-shell">
            <div className="page-container">
                <header className="topbar">
                    <div>
                        <h1 className="brand-title">Backend System</h1>
                        <p className="brand-subtitle">ระบบจัดการหลังบ้านสำหรับหมวดหมู่ เมนู โต๊ะ และออเดอร์</p>
                    </div>

                    <button className="button button--outline" onClick={loadAll}>
                        รีเฟรชข้อมูล
                    </button>
                </header>

                <SummaryCards categories={categories} menus={menus} tables={tables} orders={orders} />

                {!uncategorizedExists && (
                    <div className="warning-box">
                        ยังไม่พบหมวดหมู่ <strong>Uncategorized</strong> (id 1000) ในระบบ ควรสร้างไว้ก่อน
                    </div>
                )}

                <section className="card">
                    <div className="tabs">
                        <button
                            className={`tab-button ${activeTab === "categories" ? "tab-button--active" : ""}`}
                            onClick={() => setActiveTab("categories")}
                        >
                            หมวดหมู่
                        </button>

                        <button
                            className={`tab-button ${activeTab === "menus" ? "tab-button--active" : ""}`}
                            onClick={() => setActiveTab("menus")}
                        >
                            เมนู
                        </button>

                        <button
                            className={`tab-button ${activeTab === "tables" ? "tab-button--active" : ""}`}
                            onClick={() => setActiveTab("tables")}
                        >
                            โต๊ะ
                        </button>

                        <button
                            className={`tab-button ${activeTab === "orders" ? "tab-button--active" : ""}`}
                            onClick={() => setActiveTab("orders")}
                        >
                            ออเดอร์
                        </button>
                    </div>

                    <div className="tab-panel">
                        {error && <p className="error-text">{error}</p>}
                        {loading ? (
                            <div className="loading-box">กำลังโหลดข้อมูล...</div>
                        ) : (
                            <>
                                {activeTab === "categories" && (
                                    <CategoriesTab categories={categories} reload={loadAll} />
                                )}

                                {activeTab === "menus" && (
                                    <MenusTab menus={menus} categories={categories} reload={loadAll} />
                                )}

                                {activeTab === "tables" && (
                                    <TablesTab tables={tables} reload={loadAll} />
                                )}

                                {activeTab === "orders" && (
                                    <OrdersTab orders={orders} reload={loadAll} />
                                )}
                            </>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
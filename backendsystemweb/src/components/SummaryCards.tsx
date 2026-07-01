import type { Category, Menu, CafeTable, Order } from "../lib/api";

type Props = {
    categories: Category[];
    menus: Menu[];
    tables: CafeTable[];
    orders: Order[];
};

export default function SummaryCards({ categories, menus, tables, orders }: Props) {
    const availableMenus = menus.filter((item) => item.is_available).length;
    const occupiedTables = tables.filter((item) => item.is_occupied).length;
    const waitingOrders = orders.filter((item) => item.order_status === "waiting").length;

    const cards = [
        { label: "หมวดหมู่", value: categories.length },
        { label: "เมนูทั้งหมด", value: menus.length },
        { label: "เมนูพร้อมขาย", value: availableMenus },
        { label: "โต๊ะใช้งานอยู่", value: occupiedTables },
        { label: "ออเดอร์รอดำเนินการ", value: waitingOrders }
    ];

    return (
        <div className="summary-grid">
            {cards.map((card) => (
                <div key={card.label} className="card summary-card">
                    <p className="summary-card__label">{card.label}</p>
                    <p className="summary-card__value">{card.value}</p>
                </div>
            ))}
        </div>
    );
}
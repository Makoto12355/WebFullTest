import { apiFetch, type ApiResult, type Order, type OrderStatus } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";

type Props = {
    orders: Order[];
    reload: () => Promise<void>;
};

const statuses: OrderStatus[] = ["waiting", "preparing", "completed", "cancelled"];

export default function OrdersTab({ orders, reload }: Props) {
    async function updateStatus(orderId: number, status: OrderStatus) {
        try {
            await apiFetch<ApiResult<Order>>(`/orders/${orderId}/status`, {
                method: "PUT",
                body: JSON.stringify({ order_status: status })
            });
            await reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
    }

    return (
        <div className="card table-card">
            <div className="card-head">
                <h3 className="card-title">รายการออเดอร์</h3>
            </div>

            <div className="table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Bill No</th>
                            <th>Table</th>
                            <th>Status</th>
                            <th>Ordered At</th>
                            <th>เปลี่ยนสถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((item) => (
                            <tr key={item.order_id}>
                                <td>{item.bill_no || "-"}</td>
                                <td>{item.table_id}</td>
                                <td>
                                    <StatusBadge value={item.order_status} />
                                </td>
                                <td>{item.ordered_at || "-"}</td>
                                <td>
                                    <select
                                        className="select select--small"
                                        value={item.order_status}
                                        onChange={(e) => updateStatus(item.order_id, e.target.value as OrderStatus)}
                                    >
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}

                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="empty-text">
                                    ยังไม่มีข้อมูล
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
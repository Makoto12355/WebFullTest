import { useState } from "react";
import { apiFetch, type ApiResult, type Order, type OrderStatus } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";

type Props = {
    orders: Order[];
    reload: () => Promise<void>;
};

const statusOptionsMap: Record<OrderStatus, OrderStatus[]> = {
    waiting: ["waiting", "preparing", "cancelled"],
    preparing: ["waiting", "preparing", "completed", "cancelled"],
    completed: ["completed"],
    cancelled: ["cancelled"]
};

export default function OrdersTab({ orders, reload }: Props) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

    async function handleStatusChange(
        orderId: number,
        currentStatus: OrderStatus,
        nextStatus: OrderStatus
    ) {
        if (currentStatus === "completed" || currentStatus === "cancelled") {
            return;
        }

        if (currentStatus === nextStatus) {
            return;
        }

        try {
            setLoadingId(orderId);

            await apiFetch<ApiResult<Order>>(`/orders/${orderId}/status`, {
                method: "PUT",
                body: JSON.stringify({ order_status: nextStatus })
            });

            await reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : "เปลี่ยนสถานะไม่สำเร็จ");
        } finally {
            setLoadingId(null);
        }
    }

    return (
        <>
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
                        {orders.map((item) => {
                            const isLocked =
                                item.order_status === "completed" ||
                                item.order_status === "cancelled";

                            return (
                                <tr key={item.order_id}>
                                    <td>{item.bill_no || "-"}</td>
                                    <td>โต๊ะ {item.table_no ?? item.table_id}</td>
                                    <td>
                                        <StatusBadge value={item.order_status} />
                                    </td>
                                    <td>{item.ordered_at || "-"}</td>
                                    <td>
                                        <select
                                            className="select"
                                            value={item.order_status}
                                            disabled={isLocked || loadingId === item.order_id}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    item.order_id,
                                                    item.order_status,
                                                    e.target.value as OrderStatus
                                                )
                                            }
                                        >
                                            {statusOptionsMap[item.order_status].map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}

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
        </>
    );
}
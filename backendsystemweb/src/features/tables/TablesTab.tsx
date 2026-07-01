import { useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import {
    apiFetch,
    type ApiResult,
    type CafeTable,
    type TableDetailResponse
} from "../../lib/api";

type Props = {
    tables: CafeTable[];
    reload: () => Promise<void>;
};

export default function TablesTab({ tables, reload }: Props) {
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");
    const [tableDetail, setTableDetail] = useState<TableDetailResponse | null>(null);

    async function createTable() {
        try {
            await apiFetch<ApiResult<CafeTable>>("/tables", {
                method: "POST",
                body: JSON.stringify({ is_occupied: false })
            });
            await reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
    }

    async function toggleTable(item: CafeTable) {
        try {
            await apiFetch<ApiResult<CafeTable>>(`/tables/${item.table_id}/status`, {
                method: "PUT",
                body: JSON.stringify({ is_occupied: !item.is_occupied })
            });
            await reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
    }

    async function deleteTable(id: number) {
        const confirmed = window.confirm(`ต้องการลบโต๊ะ ${id} ใช่ไหม`);
        if (!confirmed) return;

        try {
            await apiFetch<ApiResult<CafeTable>>(`/tables/${id}`, {
                method: "DELETE"
            });
            await reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
    }

    async function openDetail(tableId: number) {
        setSelectedTableId(tableId);
        setDetailLoading(true);
        setDetailError("");
        setTableDetail(null);

        try {
            const result = await apiFetch<ApiResult<TableDetailResponse>>(`/tables/${tableId}/detail`);
            setTableDetail(result.data);
        } catch (err) {
            setDetailError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setDetailLoading(false);
        }
    }

    function closeDetail() {
        setSelectedTableId(null);
        setDetailError("");
        setTableDetail(null);
    }

    return (
        <>
            <div className="card table-card">
                <div className="card-head card-head--between">
                    <h3 className="card-title">จัดการโต๊ะ</h3>
                    <button className="button button--primary" onClick={createTable}>
                        เพิ่มโต๊ะ
                    </button>
                </div>

                <div className="table-grid">
                    {tables.map((item) => (
                        <div key={item.table_id} className="table-box">
                            <div>
                                <p className="table-box__label">โต๊ะ</p>
                                <p className="table-box__number">#{item.table_no}</p>
                            </div>

                            <StatusBadge value={String(item.is_occupied)} />

                            <div className="table-box__actions">
                                <button className="button button--outline" onClick={() => openDetail(item.table_id)}>
                                    ดูรายละเอียด
                                </button>

                                <button className="button button--outline" onClick={() => toggleTable(item)}>
                                    เปลี่ยนสถานะ
                                </button>

                                <button className="button button--danger" onClick={() => deleteTable(item.table_id)}>
                                    ลบ
                                </button>
                            </div>
                        </div>
                    ))}

                    {tables.length === 0 && <p className="empty-text">ยังไม่มีข้อมูลโต๊ะ</p>}
                </div>
            </div>

            {selectedTableId !== null && (
                <div className="modal-overlay" onClick={closeDetail}>
                    <div className="modal-card modal-card--wide" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div>
                                <h3 className="modal-title">
                                    รายละเอียดโต๊ะ {tableDetail?.table?.table_no ? `#${tableDetail.table.table_no}` : ""}
                                </h3>
                                <p className="modal-subtitle">ดูออเดอร์และรายการอาหารของโต๊ะนี้</p>
                            </div>

                            <button
                                type="button"
                                className="button button--outline button--small"
                                onClick={closeDetail}
                            >
                                ปิด
                            </button>
                        </div>

                        {detailLoading && <div className="loading-box">กำลังโหลดข้อมูล...</div>}

                        {!detailLoading && detailError && <p className="error-text">{detailError}</p>}

                        {!detailLoading && !detailError && tableDetail && (
                            <div className="table-detail-layout">
                                <div className="table-detail-summary">
                                    <div className="detail-pill">
                                        <span className="detail-pill__label">เลขโต๊ะ</span>
                                        <strong>#{tableDetail.table.table_no}</strong>
                                    </div>

                                    <div className="detail-pill">
                                        <span className="detail-pill__label">สถานะโต๊ะ</span>
                                        <StatusBadge value={String(tableDetail.table.is_occupied)} />
                                    </div>

                                    <div className="detail-pill">
                                        <span className="detail-pill__label">จำนวนออเดอร์</span>
                                        <strong>{tableDetail.orders.length}</strong>
                                    </div>
                                </div>

                                {tableDetail.orders.length === 0 ? (
                                    <div className="card-sub-panel">
                                        <p className="empty-text">โต๊ะนี้ยังไม่มีรายการออเดอร์</p>
                                    </div>
                                ) : (
                                    <div className="orders-detail-list">
                                        {tableDetail.orders.map((order) => (
                                            <div key={order.order_id} className="order-detail-card">
                                                <div className="order-detail-card__head">
                                                    <div>
                                                        <p className="order-detail-card__title">
                                                            {order.bill_no || `Order #${order.order_id}`}
                                                        </p>
                                                        <p className="order-detail-card__time">
                                                            {order.ordered_at || "-"}
                                                        </p>
                                                    </div>

                                                    <StatusBadge value={order.order_status} />
                                                </div>

                                                <div className="table-wrap">
                                                    <table className="data-table">
                                                        <thead>
                                                            <tr>
                                                                <th>เมนู</th>
                                                                <th>จำนวน</th>
                                                                <th>ราคา/หน่วย</th>
                                                                <th>หมายเหตุ</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.items.map((item) => (
                                                                <tr key={item.order_item_id}>
                                                                    <td>{item.menu?.food_name || `Menu #${item.menu_id}`}</td>
                                                                    <td>{item.quantity}</td>
                                                                    <td>{item.unit_price}</td>
                                                                    <td>{item.note || "-"}</td>
                                                                </tr>
                                                            ))}

                                                            {order.items.length === 0 && (
                                                                <tr>
                                                                    <td colSpan={4} className="empty-text">
                                                                        ไม่มีรายการอาหารในออเดอร์นี้
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
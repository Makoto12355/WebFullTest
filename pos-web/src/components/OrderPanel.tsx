import type { CafeTable, OrderStatus, TableDetailOrder, TableDetailItem } from "../types/pos";
import StatusBadge from "./StatusBadge";
import OrderItemRow from "./OrderItemRow";

type Props = {
    selectedTable: CafeTable | null;
    selectedTableId: number | null;
    detailLoading: boolean;
    activeOrder: TableDetailOrder | null;
    subtotal: number;
    actionLoading: boolean;
    onIncrease: (item: TableDetailItem) => void;
    onDecrease: (item: TableDetailItem) => void;
    onDelete: (item: TableDetailItem) => void;
    onUpdateStatus: (status: OrderStatus) => void;
};

export default function OrderPanel({
    selectedTable,
    selectedTableId,
    detailLoading,
    activeOrder,
    subtotal,
    actionLoading,
    onIncrease,
    onDecrease,
    onDelete,
    onUpdateStatus
}: Props) {
    const canChangeOrderStatus = !!activeOrder && activeOrder.items.length > 0;
    const tableLabel = selectedTable
        ? selectedTable.table_no ?? selectedTable.table_id
        : null;

    return (
        <aside className="pos-order card">
            <div className="content-head">
                <div>
                    <h2 className="section-title">รายการสั่ง</h2>
                    <p className="section-subtitle">
                        {tableLabel ? `โต๊ะ ${tableLabel}` : "ยังไม่ได้เลือกโต๊ะ"}
                    </p>
                </div>
            </div>

            {detailLoading ? (
                <p className="muted-text">กำลังโหลดรายละเอียดโต๊ะ...</p>
            ) : !selectedTableId ? (
                <div className="empty-box">กรุณาเลือกโต๊ะก่อน</div>
            ) : !activeOrder ? (
                <div className="empty-box">โต๊ะนี้ยังไม่มีออเดอร์ที่กำลังใช้งาน</div>
            ) : (
                <>
                    <div className="order-meta">
                        <div className="meta-chip">
                            Bill: {activeOrder.bill_no || activeOrder.order_id}
                        </div>
                        <StatusBadge type="order" value={activeOrder.order_status} />
                    </div>

                    <div className="order-items">
                        {activeOrder.items.map((item) => (
                            <OrderItemRow
                                key={item.order_item_id}
                                item={item}
                                disabled={actionLoading}
                                onIncrease={onIncrease}
                                onDecrease={onDecrease}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>

                    <div className="summary-box">
                        <div className="summary-row">
                            <span>ยอดรวมสินค้า</span>
                            <strong>฿{subtotal}</strong>
                        </div>

                        <div className="summary-row summary-row--total">
                            <span>รวมสุทธิ</span>
                            <strong>฿{subtotal}</strong>
                        </div>
                    </div>

                    <div className="order-actions-stack">
                        <div className="order-actions-grid">
                            <button
                                className="secondary-button"
                                onClick={() => onUpdateStatus("waiting")}
                                disabled={actionLoading || !canChangeOrderStatus}
                            >
                                Waiting
                            </button>

                            <button
                                className="secondary-button"
                                onClick={() => onUpdateStatus("preparing")}
                                disabled={actionLoading || !canChangeOrderStatus}
                            >
                                Preparing
                            </button>

                            <button
                                className="danger-button"
                                onClick={() => onUpdateStatus("cancelled")}
                                disabled={actionLoading || !canChangeOrderStatus}
                            >
                                Cancel
                            </button>
                        </div>

                        <button
                            className="primary-button order-complete-button"
                            onClick={() => onUpdateStatus("completed")}
                            disabled={actionLoading || !canChangeOrderStatus}
                        >
                            Complete
                        </button>
                    </div>
                </>
            )}
        </aside>
    );
}
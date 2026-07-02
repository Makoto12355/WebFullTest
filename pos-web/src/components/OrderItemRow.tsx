import type { TableDetailItem } from "../types/pos";

type Props = {
    item: TableDetailItem;
    disabled: boolean;
    onIncrease: (item: TableDetailItem) => void;
    onDecrease: (item: TableDetailItem) => void;
    onDelete: (item: TableDetailItem) => void;
};

export default function OrderItemRow({
    item,
    disabled,
    onIncrease,
    onDecrease,
    onDelete
}: Props) {
    return (
        <div className="order-item">
            <div className="order-item-main">
                <p className="order-item-name">
                    {item.menu?.food_name || `Menu #${item.menu_id}`}
                </p>
                <p className="order-item-note">{item.note || "-"}</p>
            </div>

            <div className="order-item-side">
                <p className="order-item-price">฿{item.unit_price * item.quantity}</p>

                <div className="qty-controls">
                    <button className="qty-button" onClick={() => onDecrease(item)} disabled={disabled}>
                        -
                    </button>

                    <span className="qty-value">{item.quantity}</span>

                    <button className="qty-button" onClick={() => onIncrease(item)} disabled={disabled}>
                        +
                    </button>

                    <button className="delete-button" onClick={() => onDelete(item)} disabled={disabled}>
                        ลบ
                    </button>
                </div>
            </div>
        </div>
    );
}
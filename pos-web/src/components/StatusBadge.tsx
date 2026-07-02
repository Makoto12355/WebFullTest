import type { OrderStatus } from "../types/pos";

type Props =
    | { type: "table"; value: boolean }
    | { type: "menu"; value: boolean }
    | { type: "order"; value: OrderStatus };

export default function StatusBadge(props: Props) {
    if (props.type === "table") {
        const isOccupied = props.value;

        return (
            <span
                className={`status-badge ${isOccupied ? "status-badge--red" : "status-badge--green"
                    }`}
            >
                {isOccupied ? "ไม่พร้อมใช้งาน" : "พร้อมใช้งาน"}
            </span>
        );
    }

    if (props.type === "menu") {
        const isAvailable = props.value;

        return (
            <span
                className={`status-badge ${isAvailable ? "status-badge--green" : "status-badge--red"
                    }`}
            >
                {isAvailable ? "พร้อมขาย" : "ไม่พร้อมขาย"}
            </span>
        );
    }

    const map: Record<OrderStatus, { label: string; cls: string }> = {
        waiting: { label: "Waiting", cls: "status-badge--yellow" },
        preparing: { label: "Preparing", cls: "status-badge--blue" },
        completed: { label: "Complete", cls: "status-badge--green" },
        cancelled: { label: "Cancelled", cls: "status-badge--red" }
    };

    const config = map[props.value];

    return <span className={`status-badge ${config.cls}`}>{config.label}</span>;
}
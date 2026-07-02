type Props = {
    value: string;
    type?: "menu" | "table" | "order";
};

export default function StatusBadge({ value, type = "order" }: Props) {
    let label = value;
    let className = "status-badge";

    if (type === "table") {
        const isOccupied = value === "true";
        label = isOccupied ? "ไม่พร้อมใช้งาน" : "พร้อมใช้งาน";
        className += isOccupied
            ? " status-badge--red"
            : " status-badge--green";
    } else if (type === "menu") {
        const isAvailable = value === "true";
        label = isAvailable ? "พร้อมขาย" : "ไม่พร้อมขาย";
        className += isAvailable
            ? " status-badge--green"
            : " status-badge--red";
    } else {
        if (value === "waiting") {
            label = "รอรับออเดอร์";
            className += " status-badge--yellow";
        } else if (value === "preparing") {
            label = "กำลังทำ";
            className += " status-badge--blue";
        } else if (value === "completed") {
            label = "เสร็จแล้ว";
            className += " status-badge--green";
        } else if (value === "cancelled") {
            label = "ยกเลิก";
            className += " status-badge--red";
        }
    }

    return <span className={className}>{label}</span>;
}
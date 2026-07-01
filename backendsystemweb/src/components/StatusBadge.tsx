type Props = {
    value: string | boolean | null | undefined;
};

export default function StatusBadge({ value }: Props) {
    const normalized = String(value ?? "").toLowerCase();

    let className = "status-badge";
    let label = String(value ?? "-");

    if (normalized === "completed") {
        className += " status-badge--green";
        label = "completed";
    } else if (normalized === "waiting") {
        className += " status-badge--yellow";
        label = "waiting";
    } else if (normalized === "preparing") {
        className += " status-badge--blue";
        label = "preparing";
    } else if (normalized === "cancelled") {
        className += " status-badge--red";
        label = "cancelled";
    } else if (normalized === "true") {
        className += " status-badge--green";
        label = "พร้อมขาย";
    } else if (normalized === "false") {
        className += " status-badge--gray";
        label = "ไม่พร้อมขาย";
    } else {
        className += " status-badge--gray";
    }

    return <span className={className}>{label}</span>;
}
import type { CafeTable } from "../types/pos";
import StatusBadge from "./StatusBadge";

type Props = {
    tables: CafeTable[];
    selectedTableId: number | null;
    onSelect: (tableId: number) => void;
    loading: boolean;
};

export default function TableList({
    tables,
    selectedTableId,
    onSelect,
    loading
}: Props) {
    if (loading) {
        return <p className="muted-text">กำลังโหลดโต๊ะ...</p>;
    }

    if (tables.length === 0) {
        return <div className="empty-box">ยังไม่มีโต๊ะในระบบ</div>;
    }

    return (
        <div className="table-list">
            {tables.map((table) => {
                const isActive = selectedTableId === table.table_id;
                const tableLabel = table.table_no ?? table.table_id;

                return (
                    <button
                        key={table.table_id}
                        className={`table-button ${isActive ? "table-button--active" : ""}`}
                        onClick={() => onSelect(table.table_id)}
                    >
                        <div className="table-button__left">
                            <strong>โต๊ะ {tableLabel}</strong>
                        </div>

                        <StatusBadge type="table" value={table.is_occupied} />
                    </button>
                );
            })}
        </div>
    );
}
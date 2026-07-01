import StatusBadge from "../../components/StatusBadge";
import { apiFetch, type ApiResult, type CafeTable } from "../../lib/api";

type Props = {
    tables: CafeTable[];
    reload: () => Promise<void>;
};

export default function TablesTab({ tables, reload }: Props) {
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

    return (
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
    );
}
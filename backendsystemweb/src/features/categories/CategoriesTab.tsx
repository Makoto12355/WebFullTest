import { useState } from "react";
import { apiFetch, type ApiResult, type Category } from "../../lib/api";

type Props = {
    categories: Category[];
    reload: () => Promise<void>;
};

export default function CategoriesTab({ categories, reload }: Props) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await apiFetch<ApiResult<Category>>("/categories", {
                method: "POST",
                body: JSON.stringify({ catagory_name: name })
            });
            setName("");
            await reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        const confirmed = window.confirm(`ต้องการลบ category ${id} ใช่ไหม`);
        if (!confirmed) return;

        try {
            await apiFetch<ApiResult<Category>>(`/categories/${id}`, {
                method: "DELETE"
            });
            await reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
    }

    return (
        <div className="section-grid">
            <div className="card form-card">
                <div className="card-head">
                    <h3 className="card-title">เพิ่มหมวดหมู่</h3>
                </div>

                <form className="form-grid" onSubmit={handleCreate}>
                    <div className="field">
                        <label className="label">ชื่อหมวดหมู่</label>
                        <input
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="เช่น drinks"
                        />
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <button className="button button--primary" type="submit" disabled={loading || !name.trim()}>
                        {loading ? "กำลังบันทึก..." : "เพิ่มหมวดหมู่"}
                    </button>
                </form>
            </div>

            <div className="card table-card">
                <div className="card-head">
                    <h3 className="card-title">รายการหมวดหมู่</h3>
                </div>

                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ชื่อหมวดหมู่</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((item) => (
                                <tr key={item.catagory_id}>
                                    <td>{item.catagory_name}</td>
                                    <td>
                                        <button
                                            className="button button--danger button--small"
                                            onClick={() => handleDelete(item.catagory_id)}
                                            disabled={item.catagory_id == 1000}
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="empty-text">
                                        ยังไม่มีข้อมูล
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
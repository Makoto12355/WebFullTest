import { useState, type FormEvent } from "react";
import { apiFetch, type ApiResult, type Category } from "../../lib/api";

type Props = {
    categories: Category[];
    reload: () => Promise<void>;
};

export default function CategoriesTab({ categories, reload }: Props) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    async function handleCreate(e: FormEvent) {
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

    function openEditModal(category: Category) {
        setEditingCategoryId(category.catagory_id);
        setEditingName(category.catagory_name);
        setEditError("");
        setIsEditModalOpen(true);
    }

    function closeEditModal() {
        setIsEditModalOpen(false);
        setEditingCategoryId(null);
        setEditingName("");
        setEditError("");
    }

    async function handleEditSubmit(e: FormEvent) {
        e.preventDefault();

        if (!editingCategoryId) return;

        setEditLoading(true);
        setEditError("");

        try {
            await apiFetch<ApiResult<Category>>(`/categories/${editingCategoryId}`, {
                method: "PUT",
                body: JSON.stringify({ catagory_name: editingName })
            });

            await reload();
            closeEditModal();
        } catch (err) {
            setEditError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setEditLoading(false);
        }
    }

    return (
        <>
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
                                        <td className="action-group">
                                            <button
                                                className="button button--outline button--small"
                                                onClick={() => openEditModal(item)}
                                            >
                                                แก้ไข
                                            </button>
                                            {item.catagory_id !== 1000 ? (
                                                <>

                                                    <button
                                                        className="button button--danger button--small"
                                                        onClick={() => handleDelete(item.catagory_id)}
                                                    >
                                                        ลบ
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="system-label">ค่าเริ่มต้น</span>
                                            )}
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

            {isEditModalOpen && (
                <div className="modal-overlay" onClick={closeEditModal}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div>
                                <h3 className="modal-title">แก้ไขชื่อหมวดหมู่</h3>
                                <p className="modal-subtitle">เปลี่ยนชื่อหมวดหมู่แล้วบันทึกลงระบบ</p>
                            </div>

                            <button
                                type="button"
                                className="button button--outline button--small"
                                onClick={closeEditModal}
                            >
                                ปิด
                            </button>
                        </div>

                        <form className="form-grid" onSubmit={handleEditSubmit}>
                            <div className="field">
                                <label className="label">ชื่อหมวดหมู่ใหม่</label>
                                <input
                                    className="input"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    placeholder="เช่น bakery"
                                />
                            </div>

                            {editError && <p className="error-text">{editError}</p>}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="button button--outline"
                                    onClick={closeEditModal}
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    className="button button--primary"
                                    type="submit"
                                    disabled={editLoading || !editingName.trim()}
                                >
                                    {editLoading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
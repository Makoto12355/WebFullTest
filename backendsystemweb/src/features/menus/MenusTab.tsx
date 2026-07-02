import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
    type FormEvent
} from "react";
import StatusBadge from "../../components/StatusBadge";
import { apiFetch, type ApiResult, type Category, type Menu } from "../../lib/api";
import { getMenuImageUrl, uploadMenuImage } from "../../lib/uploadMenuImage";

type Props = {
    menus: Menu[];
    categories: Category[];
    reload: () => Promise<void>;
};

type ModalMode = "create" | "edit";

const initialForm = {
    food_name: "",
    price: "",
    catagory_id: "",
    is_available: true,
    image_path: ""
};

export default function MenusTab({ menus, categories, reload }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>("create");
    const [editingMenuId, setEditingMenuId] = useState<number | null>(null);

    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [isDragging, setIsDragging] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [imageUploadError, setImageUploadError] = useState("");

    useEffect(() => {
        if (categories.length > 0 && !form.catagory_id) {
            const fallback =
                categories.find((item) => Number(item.catagory_id) === 1000)?.catagory_id ??
                categories[0].catagory_id;

            setForm((prev) => ({ ...prev, catagory_id: String(fallback) }));
        }
    }, [categories, form.catagory_id]);

    function resetForm() {
        const fallback =
            categories.find((item) => Number(item.catagory_id) === 1000)?.catagory_id ??
            categories[0]?.catagory_id ??
            "";

        setForm({
            ...initialForm,
            catagory_id: String(fallback)
        });

        setEditingMenuId(null);
        setError("");
        setImageUploadError("");
        setImagePreviewUrl("");
        setIsDragging(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    function openCreateModal() {
        resetForm();
        setModalMode("create");
        setIsModalOpen(true);
    }

    function openEditModal(menu: Menu) {
        setModalMode("edit");
        setEditingMenuId(menu.menu_id);
        setForm({
            food_name: menu.food_name,
            price: String(menu.price),
            catagory_id: String(menu.catagory_id),
            is_available: menu.is_available,
            image_path: menu.image_path || ""
        });
        setImagePreviewUrl(getMenuImageUrl(menu.image_path));
        setImageUploadError("");
        setError("");
        setIsDragging(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setError("");
        setImageUploadError("");
        setIsDragging(false);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                food_name: form.food_name,
                price: Number(form.price),
                catagory_id: Number(form.catagory_id),
                is_available: form.is_available,
                image_path: form.image_path || null
            };

            if (modalMode === "create") {
                await apiFetch<ApiResult<Menu>>("/menus", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
            } else {
                if (!editingMenuId) {
                    throw new Error("ไม่พบ menu ที่ต้องการแก้ไข");
                }

                await apiFetch<ApiResult<Menu>>(`/menus/${editingMenuId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
            }

            await reload();
            closeModal();
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    }

    async function handleUploadFile(file: File) {
        setUploadingImage(true);
        setImageUploadError("");

        try {
            const result = await uploadMenuImage(file);
            setForm((prev) => ({
                ...prev,
                image_path: result.filePath
            }));
            setImagePreviewUrl(result.publicUrl);
        } catch (err) {
            setImageUploadError(err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ");
        } finally {
            setUploadingImage(false);
        }
    }

    function onFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        handleUploadFile(file);
    }

    function onDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(true);
    }

    function onDragLeave(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);
    }

    function onDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        handleUploadFile(file);
    }

    function openFileDialog() {
        fileInputRef.current?.click();
    }

    function clearImage() {
        setForm((prev) => ({
            ...prev,
            image_path: ""
        }));
        setImagePreviewUrl("");
        setImageUploadError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    async function toggleAvailability(item: Menu) {
        try {
            await apiFetch<ApiResult<Menu>>(`/menus/${item.menu_id}`, {
                method: "PUT",
                body: JSON.stringify({
                    food_name: item.food_name,
                    price: item.price,
                    catagory_id: item.catagory_id,
                    is_available: !item.is_available,
                    image_path: item.image_path || null
                })
            });

            await reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
    }

    async function handleDelete(id: number) {
        const confirmed = window.confirm(`ต้องการลบ menu ${id} ใช่ไหม`);
        if (!confirmed) return;

        try {
            await apiFetch<ApiResult<Menu>>(`/menus/${id}`, {
                method: "DELETE"
            });
            await reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
    }

    return (
        <>
            <div className="card table-card">
                <div className="card-head card-head--between">
                    <div>
                        <h3 className="card-title">รายการเมนู</h3>
                        <p className="card-subtitle">จัดการเมนู ราคา รูปภาพ และสถานะการขาย</p>
                    </div>

                    <button className="button button--primary" onClick={openCreateModal}>
                        เพิ่มเมนู
                    </button>
                </div>

                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ชื่อเมนู</th>
                                <th>ราคา</th>
                                <th>หมวด</th>
                                <th>รูป</th>
                                <th>สถานะ</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menus.map((item) => {
                                const category = categories.find((c) => c.catagory_id === item.catagory_id);
                                const imageUrl = getMenuImageUrl(item.image_path);

                                return (
                                    <tr key={item.menu_id}>
                                        <td>{item.food_name}</td>
                                        <td>{item.price}</td>
                                        <td>{category?.catagory_name || item.catagory_id}</td>
                                        <td>
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item.food_name}
                                                    className="menu-table-image"
                                                />
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td>
                                            <StatusBadge value={String(item.is_available)} type="menu" />
                                        </td>
                                        <td className="action-group">
                                            <button
                                                className="button button--outline button--small"
                                                onClick={() => openEditModal(item)}
                                            >
                                                แก้ไข
                                            </button>

                                            <button
                                                className="button button--outline button--small"
                                                onClick={() => toggleAvailability(item)}
                                            >
                                                สลับสถานะ
                                            </button>

                                            <button
                                                className="button button--danger button--small"
                                                onClick={() => handleDelete(item.menu_id)}
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {menus.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="empty-text">
                                        ยังไม่มีข้อมูล
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div>
                                <h3 className="modal-title">
                                    {modalMode === "create" ? "เพิ่มเมนู" : "แก้ไขเมนู"}
                                </h3>
                                <p className="modal-subtitle">
                                    {modalMode === "create"
                                        ? "กรอกข้อมูลเมนูแล้วบันทึกลงระบบ"
                                        : "แก้ข้อมูลเมนูแล้วบันทึกการเปลี่ยนแปลง"}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="button button--outline button--small"
                                onClick={closeModal}
                            >
                                ปิด
                            </button>
                        </div>

                        <form className="form-grid" onSubmit={handleSubmit}>
                            <div className="field">
                                <label className="label">ชื่อเมนู</label>
                                <input
                                    className="input"
                                    value={form.food_name}
                                    onChange={(e) => setForm((prev) => ({ ...prev, food_name: e.target.value }))}
                                    placeholder="เช่น ลาเต้เย็น"
                                />
                            </div>

                            <div className="field">
                                <label className="label">ราคา</label>
                                <input
                                    className="input"
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                                    placeholder="70"
                                />
                            </div>

                            <div className="field">
                                <label className="label">หมวดหมู่</label>
                                <select
                                    className="select"
                                    value={form.catagory_id}
                                    onChange={(e) => setForm((prev) => ({ ...prev, catagory_id: e.target.value }))}
                                >
                                    {categories.map((item) => (
                                        <option key={item.catagory_id} value={item.catagory_id}>
                                            {item.catagory_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field">
                                <label className="label">รูปเมนู</label>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden-file-input"
                                    onChange={onFileChange}
                                />

                                <div
                                    className={`upload-dropzone ${isDragging ? "upload-dropzone--dragging" : ""}`}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    onClick={openFileDialog}
                                >
                                    <p className="upload-dropzone__title">
                                        {uploadingImage ? "กำลังอัปโหลดรูป..." : "ลากรูปมาวาง หรือกดเพื่อเลือกไฟล์"}
                                    </p>
                                    <p className="upload-dropzone__hint">รองรับ JPG, PNG, WEBP ไม่เกิน 5MB</p>
                                </div>

                                {imageUploadError && <p className="error-text">{imageUploadError}</p>}

                                {form.image_path && (
                                    <div className="upload-meta">
                                        <p className="upload-meta__path">image_path: {form.image_path}</p>
                                        <button
                                            type="button"
                                            className="button button--outline button--small"
                                            onClick={clearImage}
                                        >
                                            ล้างรูป
                                        </button>
                                    </div>
                                )}

                                {imagePreviewUrl && (
                                    <div className="image-preview-box">
                                        <img src={imagePreviewUrl} alt="preview" className="image-preview-box__img" />
                                    </div>
                                )}
                            </div>

                            <label className="checkbox-row">
                                <input
                                    type="checkbox"
                                    checked={form.is_available}
                                    onChange={(e) => setForm((prev) => ({ ...prev, is_available: e.target.checked }))}
                                />
                                พร้อมขาย
                            </label>

                            {error && <p className="error-text">{error}</p>}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="button button--outline"
                                    onClick={closeModal}
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    className="button button--primary"
                                    type="submit"
                                    disabled={loading || uploadingImage}
                                >
                                    {loading
                                        ? "กำลังบันทึก..."
                                        : modalMode === "create"
                                            ? "เพิ่มเมนู"
                                            : "บันทึกการแก้ไข"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
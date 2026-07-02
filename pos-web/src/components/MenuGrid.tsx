import type { Menu } from "../types/pos";
import MenuCard from "./MenuCard";

type Props = {
    menus: Menu[];
    onAdd: (menu: Menu) => void;
    disabled: boolean;
    loading: boolean;
};

export default function MenuGrid({ menus, onAdd, disabled, loading }: Props) {
    if (loading) {
        return <p className="muted-text">กำลังโหลดเมนู...</p>;
    }

    if (menus.length === 0) {
        return <div className="empty-box">ไม่พบเมนูที่ค้นหา</div>;
    }

    return (
        <div className="menu-grid">
            {menus.map((menu) => (
                <MenuCard key={menu.menu_id} menu={menu} onAdd={onAdd} disabled={disabled} />
            ))}
        </div>
    );
}
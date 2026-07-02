import type { Menu } from "../types/pos";
import StatusBadge from "./StatusBadge";

type Props = {
    menu: Menu;
    onAdd: (menu: Menu) => void;
    disabled: boolean;
};

export default function MenuCard({ menu, onAdd, disabled }: Props) {
    const imageSrc =
        menu.image_path && /^https?:\/\//.test(menu.image_path) ? menu.image_path : null;

    return (
        <div className="menu-card">
            <div className="menu-image-wrap">
                {imageSrc ? (
                    <img src={imageSrc} alt={menu.food_name} className="menu-image" />
                ) : (
                    <div className="menu-image menu-image--placeholder">No image</div>
                )}
            </div>

            <div className="menu-card-body">
                <div className="menu-card-row">
                    <p className="menu-name">{menu.food_name}</p>
                    <StatusBadge type="menu" value={menu.is_available} />
                </div>
                <p className="menu-price">฿{menu.price}</p>
            </div>

            <button
                className="primary-button"
                onClick={() => onAdd(menu)}
                disabled={disabled || !menu.is_available}
            >
                เพิ่ม
            </button>
        </div>
    );
}
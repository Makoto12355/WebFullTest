import type { Category } from "../types/pos";

type Props = {
    categories: Category[];
    selectedCategoryId: number | "all";
    onChange: (value: number | "all") => void;
};

export default function CategoryBar({
    categories,
    selectedCategoryId,
    onChange
}: Props) {
    return (
        <div className="category-bar">
            <button
                className={`category-chip ${selectedCategoryId === "all" ? "category-chip--active" : ""}`}
                onClick={() => onChange("all")}
            >
                ทั้งหมด
            </button>

            {categories.map((category) => (
                <button
                    key={category.catagory_id}
                    className={`category-chip ${selectedCategoryId === category.catagory_id ? "category-chip--active" : ""
                        }`}
                    onClick={() => onChange(category.catagory_id)}
                >
                    {category.catagory_name}
                </button>
            ))}
        </div>
    );
}
import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("menu")
            .select("*")
            .order("menu_id", { ascending: true });

        if (error) {
            return res.status(500).json({
                success: false,
                message: "ดึงข้อมูล menu ไม่สำเร็จ",
                error: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "ดึงข้อมูล menu สำเร็จ",
            data: data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("menu")
            .select("*")
            .eq("menu_id", id)
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "ดึงข้อมูล menu ไม่สำเร็จ",
                error: error.message
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ menu ที่ต้องการ"
            });
        }

        return res.status(200).json({
            success: true,
            message: "ดึงข้อมูล menu สำเร็จ",
            data: data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const { food_name, price, is_available, catagory_id } = req.body;

        if (!food_name || typeof food_name !== "string") {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ food_name"
            });
        }

        if (price === undefined || Number.isNaN(Number(price))) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ price ให้ถูกต้อง"
            });
        }

        if (!catagory_id || Number.isNaN(Number(catagory_id))) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ catagory_id ให้ถูกต้อง"
            });
        }

        const { data: categoryData, error: categoryError } = await supabase
            .from("category")
            .select("catagory_id")
            .eq("catagory_id", catagory_id)
            .single();

        if (categoryError || !categoryData) {
            return res.status(400).json({
                success: false,
                message: "ไม่พบ category ที่ต้องการใช้งาน"
            });
        }

        const { data, error } = await supabase
            .from("menu")
            .insert([
                {
                    food_name: food_name.trim(),
                    price: Number(price),
                    is_available: typeof is_available === "boolean" ? is_available : true,
                    catagory_id: finalCategoryId
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "เพิ่ม menu ไม่สำเร็จ",
                error: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "เพิ่ม menu สำเร็จ",
            data: data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { food_name, price, is_available, catagory_id } = req.body;

        if (!food_name || typeof food_name !== "string") {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ food_name"
            });
        }

        if (price === undefined || Number.isNaN(Number(price))) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ price ให้ถูกต้อง"
            });
        }

        const finalCategoryId =
            catagory_id === undefined || catagory_id === null || catagory_id === ""
                ? 1000
                : Number(catagory_id);

        if (Number.isNaN(finalCategoryId)) {
            return res.status(400).json({
                success: false,
                message: "catagory_id ไม่ถูกต้อง"
            });
        }

        const { data: categoryData, error: categoryError } = await supabase
            .from("category")
            .select("catagory_id")
            .eq("catagory_id", finalCategoryId)
            .single();

        if (categoryError || !categoryData) {
            return res.status(400).json({
                success: false,
                message: "ไม่พบ category ที่ต้องการใช้งาน"
            });
        }

        const { data, error } = await supabase
            .from("menu")
            .update({
                food_name: food_name.trim(),
                price: Number(price),
                is_available: Boolean(is_available),
                catagory_id: Number(catagory_id)
            })
            .eq("menu_id", id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "แก้ไข menu ไม่สำเร็จ",
                error: error.message
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ menu ที่ต้องการแก้ไข"
            });
        }

        return res.status(200).json({
            success: true,
            message: "แก้ไข menu สำเร็จ",
            data: data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("menu")
            .delete()
            .eq("menu_id", id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "ลบ menu ไม่สำเร็จ",
                error: error.message
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ menu ที่ต้องการลบ"
            });
        }

        return res.status(200).json({
            success: true,
            message: "ลบ menu สำเร็จ",
            data: data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
});

export default router;
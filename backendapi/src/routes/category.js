import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("category")
            .select("*")
            .order("catagory_id", { ascending: true });

        if (error) {
            return res.status(500).json({
                success: false,
                message: "ดึงข้อมูล category ไม่สำเร็จ",
                error: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "ดึงข้อมูล category สำเร็จ",
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
        const { catagory_name } = req.body;

        if (!catagory_name || typeof catagory_name !== "string") {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ catagory_name"
            });
        }

        const { data, error } = await supabase
            .from("category")
            .insert([{ catagory_name: catagory_name.trim() }])
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "เพิ่ม category ไม่สำเร็จ",
                error: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "เพิ่ม category สำเร็จ",
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
        const { catagory_name } = req.body;

        if (!catagory_name || typeof catagory_name !== "string") {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ catagory_name"
            });
        }

        const { data, error } = await supabase
            .from("category")
            .update({ catagory_name: catagory_name.trim() })
            .eq("catagory_id", id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "แก้ไข category ไม่สำเร็จ",
                error: error.message
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ category ที่ต้องการแก้ไข"
            });
        }

        return res.status(200).json({
            success: true,
            message: "แก้ไข category สำเร็จ",
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
        const sourceCategoryId = Number(id);
        const uncategorizedId = 1000;

        if (Number.isNaN(sourceCategoryId)) {
            return res.status(400).json({
                success: false,
                message: "id ไม่ถูกต้อง"
            });
        }

        if (sourceCategoryId === uncategorizedId) {
            return res.status(400).json({
                success: false,
                message: "ไม่สามารถลบ Uncategorized ได้"
            });
        }

        const { data: sourceCategory, error: sourceCategoryError } = await supabase
            .from("category")
            .select("catagory_id, catagory_name")
            .eq("catagory_id", sourceCategoryId)
            .single();

        if (sourceCategoryError || !sourceCategory) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ category ที่ต้องการลบ"
            });
        }

        const { data: uncategorizedCategory, error: uncategorizedError } = await supabase
            .from("category")
            .select("catagory_id")
            .eq("catagory_id", uncategorizedId)
            .single();

        if (uncategorizedError || !uncategorizedCategory) {
            return res.status(500).json({
                success: false,
                message: "ไม่พบ Uncategorized ในระบบ"
            });
        }

        const { error: moveError } = await supabase
            .from("menu")
            .update({ catagory_id: uncategorizedId })
            .eq("catagory_id", sourceCategoryId);

        if (moveError) {
            return res.status(500).json({
                success: false,
                message: "ย้าย menu ไป Uncategorized ไม่สำเร็จ",
                error: moveError.message
            });
        }

        const { data: deletedCategory, error: deleteError } = await supabase
            .from("category")
            .delete()
            .eq("catagory_id", sourceCategoryId)
            .select()
            .single();

        if (deleteError) {
            return res.status(500).json({
                success: false,
                message: "ลบ category ไม่สำเร็จ",
                error: deleteError.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "ย้าย menu ไป Uncategorized และลบ category สำเร็จ",
            data: deletedCategory
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
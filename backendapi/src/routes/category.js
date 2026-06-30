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

        const { data, error } = await supabase
            .from("category")
            .delete()
            .eq("catagory_id", id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "ลบ category ไม่สำเร็จ",
                error: error.message
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ category ที่ต้องการลบ"
            });
        }

        return res.status(200).json({
            success: true,
            message: "ลบ category สำเร็จ",
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
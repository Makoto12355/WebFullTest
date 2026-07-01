import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("tb_data")
            .select("*")
            .order("table_id", { ascending: true });

        if (error) {
            return res.status(500).json({
                success: false,
                message: "ดึงข้อมูลโต๊ะไม่สำเร็จ",
                error: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "ดึงข้อมูลโต๊ะสำเร็จ",
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
            .from("tb_data")
            .select("*")
            .eq("table_id", id)
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "ดึงข้อมูลโต๊ะไม่สำเร็จ",
                error: error.message
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบโต๊ะที่ต้องการ"
            });
        }

        return res.status(200).json({
            success: true,
            message: "ดึงข้อมูลโต๊ะสำเร็จ",
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
        const { is_occupied } = req.body;

        const { data, error } = await supabase
            .from("tb_data")
            .insert([
                {
                    is_occupied: typeof is_occupied === "boolean" ? is_occupied : false
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "เพิ่มโต๊ะไม่สำเร็จ",
                error: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "เพิ่มโต๊ะสำเร็จ",
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
        const { is_occupied } = req.body;

        if (typeof is_occupied !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ is_occupied ให้เป็น true หรือ false"
            });
        }

        const { data, error } = await supabase
            .from("tb_data")
            .update({ is_occupied: is_occupied })
            .eq("table_id", id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "แก้ไขโต๊ะไม่สำเร็จ",
                error: error.message
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบโต๊ะที่ต้องการแก้ไข"
            });
        }

        return res.status(200).json({
            success: true,
            message: "แก้ไขโต๊ะสำเร็จ",
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

router.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { is_occupied } = req.body;

        if (typeof is_occupied !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ is_occupied ให้เป็น true หรือ false"
            });
        }

        const { data, error } = await supabase
            .from("tb_data")
            .update({ is_occupied: is_occupied })
            .eq("table_id", id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "เปลี่ยนสถานะโต๊ะไม่สำเร็จ",
                error: error.message
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบโต๊ะที่ต้องการเปลี่ยนสถานะ"
            });
        }

        return res.status(200).json({
            success: true,
            message: "เปลี่ยนสถานะโต๊ะสำเร็จ",
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
            .from("tb_data")
            .delete()
            .eq("table_id", id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "ลบโต๊ะไม่สำเร็จ",
                error: error.message
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบโต๊ะที่ต้องการลบ"
            });
        }

        return res.status(200).json({
            success: true,
            message: "ลบโต๊ะสำเร็จ",
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

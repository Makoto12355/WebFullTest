import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

async function generateNextTableNo() {
    const { data, error } = await supabase
        .from("tb_data")
        .select("table_no")
        .eq("is_active", true)
        .order("table_no", { ascending: true });

    if (error) {
        throw error;
    }

    let nextTableNo = 1;

    for (const row of data || []) {
        if (row.table_no === nextTableNo) {
            nextTableNo += 1;
        } else if (row.table_no > nextTableNo) {
            break;
        }
    }

    return nextTableNo;
}

router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("tb_data")
            .select("*")
            .eq("is_active", true)
            .order("table_no", { ascending: true });

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
        const tableId = Number(id);

        if (Number.isNaN(tableId)) {
            return res.status(400).json({
                success: false,
                message: "table_id ไม่ถูกต้อง"
            });
        }

        const { data, error } = await supabase
            .from("tb_data")
            .select("*")
            .eq("table_id", tableId)
            .eq("is_active", true)
            .maybeSingle();

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
        const nextTableNo = await generateNextTableNo();

        const { data, error } = await supabase
            .from("tb_data")
            .insert([
                {
                    table_no: nextTableNo,
                    is_active: true,
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
        const tableId = Number(id);
        const { is_occupied } = req.body;

        if (Number.isNaN(tableId)) {
            return res.status(400).json({
                success: false,
                message: "table_id ไม่ถูกต้อง"
            });
        }

        if (typeof is_occupied !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ is_occupied ให้เป็น true หรือ false"
            });
        }

        const { data, error } = await supabase
            .from("tb_data")
            .update({ is_occupied: is_occupied })
            .eq("table_id", tableId)
            .eq("is_active", true)
            .select()
            .maybeSingle();

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
        const tableId = Number(id);
        const { is_occupied } = req.body;

        if (Number.isNaN(tableId)) {
            return res.status(400).json({
                success: false,
                message: "table_id ไม่ถูกต้อง"
            });
        }

        if (typeof is_occupied !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ is_occupied ให้เป็น true หรือ false"
            });
        }

        const { data, error } = await supabase
            .from("tb_data")
            .update({ is_occupied: is_occupied })
            .eq("table_id", tableId)
            .eq("is_active", true)
            .select()
            .maybeSingle();

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
        const tableId = Number(id);

        if (Number.isNaN(tableId)) {
            return res.status(400).json({
                success: false,
                message: "table_id ไม่ถูกต้อง"
            });
        }

        const { data: tableData, error: tableError } = await supabase
            .from("tb_data")
            .select("*")
            .eq("table_id", tableId)
            .eq("is_active", true)
            .maybeSingle();

        if (tableError) {
            return res.status(500).json({
                success: false,
                message: "ตรวจสอบโต๊ะไม่สำเร็จ",
                error: tableError.message
            });
        }

        if (!tableData) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบโต๊ะที่ต้องการลบ"
            });
        }

        const { data: activeOrders, error: orderError } = await supabase
            .from("orders")
            .select("order_id, order_status")
            .eq("table_id", tableId)
            .in("order_status", ["waiting", "preparing"]);

        if (orderError) {
            return res.status(500).json({
                success: false,
                message: "ตรวจสอบออเดอร์ของโต๊ะไม่สำเร็จ",
                error: orderError.message
            });
        }

        if (activeOrders && activeOrders.length > 0) {
            return res.status(400).json({
                success: false,
                message: "ไม่สามารถลบโต๊ะได้ เพราะยังมีออเดอร์ที่ยังไม่เสร็จ"
            });
        }

        const { data, error } = await supabase
            .from("tb_data")
            .update({
                is_active: false,
                is_occupied: false
            })
            .eq("table_id", tableId)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "ปิดใช้งานโต๊ะไม่สำเร็จ",
                error: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "ปิดใช้งานโต๊ะสำเร็จ",
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
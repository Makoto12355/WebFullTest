import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

function formatBillDate(dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

async function generateBillNo(dateInput) {
  const billDate = formatBillDate(dateInput);
  const prefix = `B${billDate}-`;

  const { data, error } = await supabase
    .from("orders")
    .select("bill_no")
    .like("bill_no", `${prefix}%`)
    .order("bill_no", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  let nextNumber = 1;

  if (data && data.length > 0 && data[0].bill_no) {
    const match = data[0].bill_no.match(/-(\d+)$/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("order_id", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "ดึงข้อมูล orders ไม่สำเร็จ",
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูล orders สำเร็จ",
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
      .from("orders")
      .select("*")
      .eq("order_id", id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "ดึงข้อมูล order ไม่สำเร็จ",
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ order ที่ต้องการ"
      });
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูล order สำเร็จ",
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
    const { table_id, order_status, ordered_at } = req.body;

    if (!table_id || Number.isNaN(Number(table_id))) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ table_id ให้ถูกต้อง"
      });
    }

    const finalStatus = order_status || "waiting";
    const allowedStatuses = ["waiting", "preparing", "completed", "cancelled"];

    if (!allowedStatuses.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "order_status ไม่ถูกต้อง"
      });
    }

    const { data: tableData, error: tableError } = await supabase
      .from("tb_data")
      .select("table_id")
      .eq("table_id", Number(table_id))
      .single();

    if (tableError || !tableData) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบโต๊ะที่ต้องการใช้งาน"
      });
    }

    const billNo = await generateBillNo(ordered_at || new Date());

    const insertPayload = {
      table_id: Number(table_id),
      order_status: finalStatus,
      bill_no: billNo
    };

    if (ordered_at) {
      insertPayload.ordered_at = ordered_at;
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "เพิ่ม order ไม่สำเร็จ",
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "เพิ่ม order สำเร็จ",
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
    const { order_status } = req.body;
    const allowedStatuses = ["waiting", "preparing", "completed", "cancelled"];

    if (!order_status || !allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ order_status ให้ถูกต้อง"
      });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ order_status: order_status })
      .eq("order_id", id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "เปลี่ยนสถานะ order ไม่สำเร็จ",
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ order ที่ต้องการเปลี่ยนสถานะ"
      });
    }

    return res.status(200).json({
      success: true,
      message: "เปลี่ยนสถานะ order สำเร็จ",
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

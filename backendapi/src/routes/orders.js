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

async function attachTableNoToOrders(orders) {
  if (!orders || orders.length === 0) {
    return [];
  }

  const tableIds = [
    ...new Set(
      orders
        .map((order) => Number(order.table_id))
        .filter((tableId) => !Number.isNaN(tableId))
    )
  ];

  if (tableIds.length === 0) {
    return orders.map((order) => ({
      ...order,
      table_no: null
    }));
  }

  const { data: tableRows, error: tableError } = await supabase
    .from("tb_data")
    .select("table_id, table_no")
    .in("table_id", tableIds);

  if (tableError) {
    throw tableError;
  }

  const tableNoMap = new Map(
    (tableRows || []).map((row) => [row.table_id, row.table_no ?? null])
  );

  return orders.map((order) => ({
    ...order,
    table_no: tableNoMap.get(order.table_id) ?? null
  }));
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

    const formattedData = await attachTableNoToOrders(data || []);

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูล orders สำเร็จ",
      data: formattedData
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

    const [formattedOrder] = await attachTableNoToOrders([data]);

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูล order สำเร็จ",
      data: formattedOrder
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
      .select("table_id, table_no")
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

    const nextOccupied =
      finalStatus === "completed" || finalStatus === "cancelled" ? false : true;

    await supabase
      .from("tb_data")
      .update({ is_occupied: nextOccupied })
      .eq("table_id", Number(table_id));

    const [formattedOrder] = await attachTableNoToOrders([data]);

    return res.status(201).json({
      success: true,
      message: "เพิ่ม order สำเร็จ",
      data: formattedOrder
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

    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: "order_status ไม่ถูกต้อง"
      });
    }

    const { data: currentOrder, error: currentOrderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", id)
      .single();

    if (currentOrderError || !currentOrder) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ order ที่ต้องการ"
      });
    }

    if (
      currentOrder.order_status === "completed" ||
      currentOrder.order_status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "order นี้ถูกปิดสถานะแล้ว ไม่สามารถแก้ไขได้อีก"
      });
    }

    const transitionMap = {
      waiting: ["waiting", "preparing", "cancelled"],
      preparing: ["waiting", "preparing", "completed", "cancelled"]
    };

    const allowedNextStatuses = transitionMap[currentOrder.order_status] || [];

    if (!allowedNextStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: `ไม่สามารถเปลี่ยนสถานะจาก ${currentOrder.order_status} เป็น ${order_status} ได้`
      });
    }

    const { count, error: countError } = await supabase
      .from("order_item")
      .select("*", { count: "exact", head: true })
      .eq("order_id", id);

    if (countError) {
      return res.status(500).json({
        success: false,
        message: "ตรวจสอบรายการอาหารไม่สำเร็จ",
        error: countError.message
      });
    }

    if (order_status === "completed" && (count || 0) === 0) {
      return res.status(400).json({
        success: false,
        message: "ไม่สามารถ complete order ที่ไม่มีรายการอาหารได้"
      });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ order_status })
      .eq("order_id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "เปลี่ยนสถานะ order ไม่สำเร็จ",
        error: error.message
      });
    }

    const nextOccupied =
      order_status === "completed" || order_status === "cancelled" ? false : true;

    const { error: tableUpdateError } = await supabase
      .from("tb_data")
      .update({ is_occupied: nextOccupied })
      .eq("table_id", currentOrder.table_id);

    if (tableUpdateError) {
      return res.status(500).json({
        success: false,
        message: "เปลี่ยนสถานะโต๊ะไม่สำเร็จ",
        error: tableUpdateError.message
      });
    }

    const [formattedOrder] = await attachTableNoToOrders([data]);

    return res.status(200).json({
      success: true,
      message: "เปลี่ยนสถานะ order สำเร็จ",
      data: formattedOrder
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
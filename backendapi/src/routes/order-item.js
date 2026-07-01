import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

router.get("/orders/:id/items", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("order_id")
      .eq("order_id", Number(id))
      .maybeSingle();

    if (orderError) {
      return res.status(500).json({
        success: false,
        message: "ตรวจสอบ order ไม่สำเร็จ",
        error: orderError.message
      });
    }

    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ order ที่ต้องการ"
      });
    }

    const { data, error } = await supabase
      .from("order_item")
      .select(`
        order_item_id,
        order_id,
        menu_id,
        quantity,
        unit_price,
        note,
        menu:menu_id (
          food_name,
          image_path,
          catagory_id
        )
      `)
      .eq("order_id", Number(id))
      .order("order_item_id", { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "ดึงรายการ order_item ไม่สำเร็จ",
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "ดึงรายการ order_item สำเร็จ",
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

router.post("/orders/:id/items", async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_id, quantity, note } = req.body;

    if (!menu_id || Number.isNaN(Number(menu_id))) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ menu_id ให้ถูกต้อง"
      });
    }

    if (!quantity || Number.isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ quantity ให้ถูกต้อง"
      });
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("order_id, order_status")
      .eq("order_id", Number(id))
      .maybeSingle();

    if (orderError) {
      return res.status(500).json({
        success: false,
        message: "ตรวจสอบ order ไม่สำเร็จ",
        error: orderError.message
      });
    }

    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ order ที่ต้องการ"
      });
    }

    if (["completed", "cancelled"].includes(orderData.order_status)) {
      return res.status(400).json({
        success: false,
        message: "ไม่สามารถเพิ่มรายการใน order ที่ปิดแล้วได้"
      });
    }

    const { data: menuData, error: menuError } = await supabase
      .from("menu")
      .select("menu_id, price, is_available")
      .eq("menu_id", Number(menu_id))
      .maybeSingle();

    if (menuError) {
      return res.status(500).json({
        success: false,
        message: "ตรวจสอบ menu ไม่สำเร็จ",
        error: menuError.message
      });
    }

    if (!menuData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ menu ที่ต้องการ"
      });
    }

    if (!menuData.is_available) {
      return res.status(400).json({
        success: false,
        message: "menu นี้ไม่พร้อมขาย"
      });
    }

    const { data, error } = await supabase
      .from("order_item")
      .insert([
        {
          order_id: Number(id),
          menu_id: Number(menu_id),
          quantity: Number(quantity),
          unit_price: Number(menuData.price),
          note: note ? String(note).trim() : null
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "เพิ่ม order_item ไม่สำเร็จ",
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "เพิ่ม order_item สำเร็จ",
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

router.put("/order-items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, note } = req.body;

    if (!quantity || Number.isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ quantity ให้ถูกต้อง"
      });
    }

    const { data: existingItem, error: existingItemError } = await supabase
      .from("order_item")
      .select("order_item_id, order_id")
      .eq("order_item_id", Number(id))
      .maybeSingle();

    if (existingItemError) {
      return res.status(500).json({
        success: false,
        message: "ตรวจสอบ order_item ไม่สำเร็จ",
        error: existingItemError.message
      });
    }

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ order_item ที่ต้องการแก้ไข"
      });
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("order_id, order_status")
      .eq("order_id", existingItem.order_id)
      .maybeSingle();

    if (orderError) {
      return res.status(500).json({
        success: false,
        message: "ตรวจสอบ order ไม่สำเร็จ",
        error: orderError.message
      });
    }

    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ order ของรายการนี้"
      });
    }

    if (["completed", "cancelled"].includes(orderData.order_status)) {
      return res.status(400).json({
        success: false,
        message: "ไม่สามารถแก้ไขรายการใน order ที่ปิดแล้วได้"
      });
    }

    const { data, error } = await supabase
      .from("order_item")
      .update({
        quantity: Number(quantity),
        note: note ? String(note).trim() : null
      })
      .eq("order_item_id", Number(id))
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "แก้ไข order_item ไม่สำเร็จ",
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ order_item ที่ต้องการแก้ไข"
      });
    }

    return res.status(200).json({
      success: true,
      message: "แก้ไข order_item สำเร็จ",
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

router.delete("/order-items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existingItem, error: existingItemError } = await supabase
      .from("order_item")
      .select("order_item_id, order_id")
      .eq("order_item_id", Number(id))
      .maybeSingle();

    if (existingItemError) {
      return res.status(500).json({
        success: false,
        message: "ตรวจสอบ order_item ไม่สำเร็จ",
        error: existingItemError.message
      });
    }

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ order_item ที่ต้องการลบ"
      });
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("order_id, order_status")
      .eq("order_id", existingItem.order_id)
      .maybeSingle();

    if (orderError) {
      return res.status(500).json({
        success: false,
        message: "ตรวจสอบ order ไม่สำเร็จ",
        error: orderError.message
      });
    }

    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ order ของรายการนี้"
      });
    }

    if (["completed", "cancelled"].includes(orderData.order_status)) {
      return res.status(400).json({
        success: false,
        message: "ไม่สามารถลบรายการใน order ที่ปิดแล้วได้"
      });
    }

    const { data, error } = await supabase
      .from("order_item")
      .delete()
      .eq("order_item_id", Number(id))
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "ลบ order_item ไม่สำเร็จ",
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ order_item ที่ต้องการลบ"
      });
    }

    return res.status(200).json({
      success: true,
      message: "ลบ order_item สำเร็จ",
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

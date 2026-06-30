import { supabase } from "./config/supabase.js";

async function testConnection() {
  console.log("กำลังเชื่อมต่อ Supabase...");

  const { data, error } = await supabase
    .from("category")
    .select("*")
    .order("catagory_id", { ascending: true });

  if (error) {
    console.error("เชื่อมต่อไม่สำเร็จ");
    console.error(error);
    return;
  }

  console.log("เชื่อมต่อสำเร็จ");
  console.table(data);
}

testConnection();
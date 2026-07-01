import { supabase } from "./supabase";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type UploadMenuImageResult = {
    filePath: string;
    publicUrl: string;
};

export async function uploadMenuImage(file: File): Promise<UploadMenuImageResult> {
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("รองรับเฉพาะไฟล์ JPG, PNG และ WEBP");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("ไฟล์ใหญ่เกิน 5MB");
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const filePath = `menus/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("menu-images").getPublicUrl(filePath);

    return {
        filePath,
        publicUrl: data.publicUrl
    };
}

export function getMenuImageUrl(imagePath?: string | null) {
    if (!imagePath) return "";

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    const { data } = supabase.storage.from("menu-images").getPublicUrl(imagePath);
    return data.publicUrl;
}
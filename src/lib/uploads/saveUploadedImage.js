import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
};

export class UploadError extends Error {
    constructor(message, status = 400) {
        super(message);

        this.name = "UploadError";
        this.status = status;
    }
}

function startsWithBytes(buffer, bytes) {
    if (buffer.length < bytes.length) {
        return false;
    }

    return bytes.every((byte, index) => buffer[index] === byte);
}

function isValidImageContent(buffer, mimeType) {
    if (mimeType === "image/png") {
        return startsWithBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    }

    if (mimeType === "image/jpeg") {
        return startsWithBytes(buffer, [0xff, 0xd8, 0xff]);
    }

    if (mimeType === "image/webp") {
        if (buffer.length < 12) {
            return false;
        }

        return (
            buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
            buffer.subarray(8, 12).toString("ascii") === "WEBP"
        );
    }

    return false;
}

export async function saveUploadedImage(file, { folder, maxFileSize = DEFAULT_MAX_FILE_SIZE }) {
    if (!/^[a-z0-9-]+$/.test(folder)) {
        throw new Error("نام پوشه آپلود معتبر نیست");
    }

    if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
        throw new UploadError("فایل تصویر ارسال نشده است");
    }

    const extension = allowedImageTypes[file.type];

    if (!extension) {
        throw new UploadError("فقط تصاویر PNG، JPG و WebP مجاز هستند");
    }

    if (file.size <= 0) {
        throw new UploadError("فایل انتخاب‌شده خالی است");
    }

    if (file.size > maxFileSize) {
        throw new UploadError("حجم تصویر نمی‌تواند بیشتر از ۵ مگابایت باشد", 413);
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (!isValidImageContent(fileBuffer, file.type)) {
        throw new UploadError("محتوای فایل با فرمت تصویر مطابقت ندارد");
    }

    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;

    const uploadDirectory = path.join(process.cwd(), "public", "uploads", folder);

    await mkdir(uploadDirectory, {
        recursive: true,
    });

    await writeFile(path.join(uploadDirectory, fileName), fileBuffer, {
        flag: "wx",
    });

    return {
        url: `/uploads/${folder}/${fileName}`,
        fileName,
        mimeType: file.type,
        size: file.size,
    };
}

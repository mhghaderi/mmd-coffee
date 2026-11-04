import connectToDB from "@/lib/db/connectToDB";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import User from "@/models/User";

function cleanText(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function PATCH(request) {
    const authentication = await requireAuthenticatedUser();
    if (!authentication.ok) return authentication.response;

    try {
        await connectToDB();
        const body = await request.json();
        const name = cleanText(body.name, 80);
        const phone = cleanText(body.phone, 20);

        if (name.length < 2) {
            return Response.json({ success: false, message: "نام و نام خانوادگی معتبر نیست" }, { status: 400 });
        }

        if (phone && (phone.length < 7 || phone.length > 20)) {
            return Response.json({ success: false, message: "شماره تماس معتبر نیست" }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(authentication.user.id, { $set: { name, phone } }, { returnDocument: 'after', runValidators: true }).select("name email phone role avatar isActive emailVerified").lean();
        return Response.json({ success: true, data: user });
    } catch (error) {
        console.error("UPDATE USER PROFILE ERROR:", error);
        return Response.json({ success: false, message: "ذخیره اطلاعات حساب انجام نشد" }, { status: 500 });
    }
}

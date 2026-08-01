import connectToDB from "@/lib/db/connectToDB";
import SiteContent from "@/models/SiteContent";

function serialize(value) {
    return value ? JSON.parse(JSON.stringify(value)) : null;
}

export default async function getSiteContent() {
    await connectToDB();

    const content = await SiteContent.findOneAndUpdate(
        { key: "main" },
        { $setOnInsert: { key: "main" } },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        },
    ).lean();

    return serialize(content);
}

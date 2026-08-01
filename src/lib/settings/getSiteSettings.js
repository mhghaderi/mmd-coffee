import connectToDB from "@/lib/db/connectToDB";
import SiteSettings from "@/models/SiteSettings";

function serializeSettings(settings) {
    if (!settings) {
        return null;
    }

    return JSON.parse(JSON.stringify(settings));
}

export default async function getSiteSettings() {
    await connectToDB();

    const settings = await SiteSettings.findOneAndUpdate(
        { key: "main" },
        { $setOnInsert: { key: "main" } },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        },
    ).lean();

    return serializeSettings(settings);
}

import Counter from "@/models/Counter";

export default async function createTicketNumber() {
    const counter = await Counter.findOneAndUpdate(
        {
            key: "ticket-number",
        },
        {
            $inc: {
                sequence: 1,
            },
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        },
    ).lean();

    return `TKT-${String(counter.sequence).padStart(6, "0")}`;
}

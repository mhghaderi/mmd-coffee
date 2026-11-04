import Counter from "@/models/Counter";

export default async function createTicketNumber() {
    try {
        const counter = await Counter.findOneAndUpdate(
            { key: "ticket-number" },
            { $inc: { sequence: 1 } },
            { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
        ).lean();

        if (counter && counter.sequence) {
            return `TKT-${String(counter.sequence).padStart(6, "0")}`;
        }
    } catch (e) {}
    return `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
}

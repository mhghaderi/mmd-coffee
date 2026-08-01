import { FiMessageCircle } from "react-icons/fi";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export default function TicketConversation({ messages }) {
    if (!messages?.length) {
        return (
            <div className="rounded-[1.75rem] border border-dashed border-coffee-200 bg-white p-12 text-center">
                <FiMessageCircle className="mx-auto text-4xl text-coffee-300" />
                <p className="mt-4 text-sm font-black text-coffee-800">پیامی ثبت نشده است</p>
            </div>
        );
    }

    return (
        <section className="space-y-4 rounded-[1.75rem] border border-coffee-100 bg-white p-5 sm:p-6">
            <h2 className="text-base font-black text-coffee-950">گفتگو</h2>

            <div className="space-y-4">
                {messages.map((item) => {
                    const isAdmin = item.senderRole === "admin";

                    return (
                        <article key={item._id} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 ${isAdmin ? "bg-coffee-900 text-white" : "bg-cream-100 text-coffee-900"}`}>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-xs font-black text-current">{item.sender?.name || (isAdmin ? "مدیر" : "کاربر")}</p>
                                    <span className={`text-[9px] ${isAdmin ? "text-white/45" : "text-coffee-400"}`}>
                                        {dateFormatter.format(new Date(item.createdAt))}
                                    </span>
                                </div>
                                <p className={`mt-2 whitespace-pre-line text-xs leading-7 ${isAdmin ? "text-white/75" : "text-coffee-600"}`}>{item.message}</p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

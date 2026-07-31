import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  actionTitle,
  actionHref,
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <span className="inline-flex rounded-full border border-caramel-200 bg-caramel-50 px-3 py-1.5 text-xs font-bold text-caramel-700">
            {eyebrow}
          </span>
        )}

        <h2 className="mt-4 text-3xl font-black leading-tight text-coffee-950 sm:text-4xl">
          {title}
        </h2>

        {description && (
          <p className="mt-3 text-sm leading-8 text-coffee-500 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {actionTitle && actionHref && (
        <Link
          href={actionHref}
          className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-coffee-700 transition hover:text-caramel-600"
        >
          {actionTitle}

          <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
        </Link>
      )}
    </div>
  );
}
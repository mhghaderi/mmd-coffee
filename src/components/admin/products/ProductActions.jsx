"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiTrash2,
  FiCheckCircle,
  FiEdit3,
  FiFileText,
  FiLoader,
  FiMoreVertical,
  FiRotateCcw,
  FiX,
} from "react-icons/fi";

const actionConfigurations = {
  publish: {
    title: "انتشار محصول",
    description:
      "این محصول در سایت نمایش داده می‌شود و امکان سفارش آن فعال خواهد شد.",
    confirmTitle: "انتشار محصول",
    method: "PATCH",
    body: {
      status: "published",
      isAvailable: true,
    },
    className:
      "bg-emerald-600 hover:bg-emerald-700",
  },

  draft: {
    title: "انتقال به پیش‌نویس",
    description:
      "محصول از سایت عمومی پنهان می‌شود، اما اطلاعات آن در پنل باقی می‌ماند.",
    confirmTitle: "انتقال به پیش‌نویس",
    method: "PATCH",
    body: {
      status: "draft",
      isAvailable: false,
    },
    className:
      "bg-amber-600 hover:bg-amber-700",
  },

  delete: {
    title: "حذف محصول",
    description:
      "محصول برای همیشه از سیستم حذف خواهد شد.",
    confirmTitle: "حذف محصول",
    method: "DELETE",
    body: null,
    className:
      "bg-red-600 hover:bg-red-700",
  },
};

export default function ProductActions({
  product,
}) {
  const router = useRouter();
  const menuRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [selectedAction, setSelectedAction] =
    useState(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setSelectedAction(null);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  const action =
    selectedAction &&
    actionConfigurations[selectedAction];

  const executeAction = async () => {
    if (!action || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/products/${product._id}`,
        {
          method: action.method,

          headers:
            action.body !== null
              ? {
                  "Content-Type":
                    "application/json",
                }
              : undefined,

          body:
            action.body !== null
              ? JSON.stringify(action.body)
              : undefined,
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(
          result.message ||
            "انجام عملیات با خطا مواجه شد",
        );

        return;
      }

      setSelectedAction(null);
      setIsMenuOpen(false);

      router.refresh();
    } catch (error) {
      console.error(
        "PRODUCT ACTION ERROR:",
        error,
      );

      setErrorMessage(
        "ارتباط با سرور برقرار نشد",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        ref={menuRef}
        className="relative"
      >
        <button
          type="button"
          aria-label={`عملیات ${product.name}`}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          onClick={() =>
            setIsMenuOpen((current) => !current)
          }
          className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-500 transition hover:bg-cream-100 hover:text-coffee-950"
        >
          <FiMoreVertical />
        </button>

        <div
          role="menu"
          className={`absolute left-0 top-[calc(100%+8px)] z-30 w-52 origin-top-left rounded-2xl border border-coffee-100 bg-white p-2 shadow-[0_20px_60px_rgba(48,32,26,0.18)] transition ${
            isMenuOpen
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
          }`}
        >
          <Link
            href={`/admin/products/${product._id}/edit`}
            role="menuitem"
            className="flex h-11 items-center gap-3 rounded-xl px-3 text-xs font-bold text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
          >
            <FiEdit3 />
            ویرایش محصول
          </Link>

          {product.status === "draft" && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setSelectedAction("publish");
                setIsMenuOpen(false);
              }}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-right text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              <FiCheckCircle />
              انتشار محصول
            </button>
          )}

          {product.status === "published" && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setSelectedAction("draft");
                setIsMenuOpen(false);
              }}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-right text-xs font-bold text-amber-700 transition hover:bg-amber-50"
            >
              <FiFileText />
              انتقال به پیش‌نویس
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setSelectedAction("delete");
              setIsMenuOpen(false);
            }}
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-right text-xs font-bold text-red-600 transition hover:bg-red-50"
          >
            <FiTrash2 />
            حذف محصول
          </button>
        </div>
      </div>

      {action && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-action-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="بستن پنجره تأیید"
            onClick={() => {
              if (!isSubmitting) {
                setSelectedAction(null);
              }
            }}
            className="absolute inset-0 bg-coffee-950/45 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-coffee-100 bg-white p-6 shadow-2xl">
            <button
              type="button"
              aria-label="بستن"
              disabled={isSubmitting}
              onClick={() =>
                setSelectedAction(null)
              }
              className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-xl text-coffee-400 transition hover:bg-coffee-100 hover:text-coffee-900"
            >
              <FiX />
            </button>

            <h2
              id="product-action-title"
              className="pl-10 text-xl font-black text-coffee-950"
            >
              {action.title}
            </h2>

            <p className="mt-4 text-sm leading-8 text-coffee-500">
              {action.description}
            </p>

            <div className="mt-5 rounded-xl bg-cream-50 p-4">
              <p className="text-xs text-coffee-400">
                محصول انتخاب‌شده
              </p>

              <p className="mt-1 text-sm font-black text-coffee-950">
                {product.name}
              </p>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold leading-6 text-red-700"
              >
                {errorMessage}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  setSelectedAction(null)
                }
                className="h-12 flex-1 rounded-xl border border-coffee-100 text-xs font-bold text-coffee-600 transition hover:bg-cream-100 disabled:opacity-50"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={executeAction}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${action.className}`}
              >
                {isSubmitting && (
                  <FiLoader className="animate-spin" />
                )}

                {isSubmitting
                  ? "در حال انجام"
                  : action.confirmTitle}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
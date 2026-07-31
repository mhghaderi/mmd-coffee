"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiCheckCircle,
  FiImage,
  FiLoader,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 8;

const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

const inputClassName =
  "h-13 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

function parseGallery(value) {
  if (!value) {
    return [];
  }

  return [
    ...new Set(
      value
        .split(/[\n,،]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function validateFile(file) {
  if (!allowedTypes.includes(file.type)) {
    return "فقط تصاویر PNG، JPG و WebP مجاز هستند";
  }

  if (file.size <= 0) {
    return "فایل انتخاب‌شده خالی است";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "حجم هر تصویر باید کمتر از ۵ مگابایت باشد";
  }

  return null;
}

async function uploadImage(file) {
  const validationError = validateFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    "/api/uploads/products",
    {
      method: "POST",
      body: formData,
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "آپلود تصویر انجام نشد",
    );
  }

  return result.data.url;
}

export default function ProductImageUploader({
  productName,
  image,
  gallery,
  onImageChange,
  onGalleryChange,
  errorMessage,
}) {
  const mainInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [isMainUploading, setIsMainUploading] =
    useState(false);

  const [
    isGalleryUploading,
    setIsGalleryUploading,
  ] = useState(false);

  const [galleryProgress, setGalleryProgress] =
    useState({
      completed: 0,
      total: 0,
    });

  const [uploadError, setUploadError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [
    mainPreviewFailed,
    setMainPreviewFailed,
  ] = useState(false);

  const galleryItems = useMemo(
    () => parseGallery(gallery),
    [gallery],
  );

  useEffect(() => {
    setMainPreviewFailed(false);
  }, [image]);

  const clearMessages = () => {
    setUploadError("");
    setSuccessMessage("");
  };

  const handleMainFile = async (file) => {
    if (!file || isMainUploading) {
      return;
    }

    clearMessages();
    setIsMainUploading(true);

    try {
      const uploadedUrl =
        await uploadImage(file);

      onImageChange(uploadedUrl);

      setSuccessMessage(
        "تصویر اصلی با موفقیت آپلود شد",
      );
    } catch (error) {
      setUploadError(
        error.message ||
          "آپلود تصویر اصلی انجام نشد",
      );
    } finally {
      setIsMainUploading(false);

      if (mainInputRef.current) {
        mainInputRef.current.value = "";
      }
    }
  };

  const handleGalleryFiles = async (
    selectedFiles,
  ) => {
    if (
      !selectedFiles.length ||
      isGalleryUploading
    ) {
      return;
    }

    clearMessages();

    const availableSlots =
      MAX_GALLERY_IMAGES -
      galleryItems.length;

    if (availableSlots <= 0) {
      setUploadError(
        "حداکثر ۸ تصویر در گالری قابل ثبت است",
      );

      return;
    }

    if (
      selectedFiles.length >
      availableSlots
    ) {
      setUploadError(
        `فقط ${availableSlots.toLocaleString(
          "fa-IR",
        )} تصویر دیگر می‌توانی اضافه کنی`,
      );

      return;
    }

    setIsGalleryUploading(true);
    setGalleryProgress({
      completed: 0,
      total: selectedFiles.length,
    });

    const uploadedUrls = [];
    const failedFiles = [];

    for (
      let index = 0;
      index < selectedFiles.length;
      index += 1
    ) {
      const file = selectedFiles[index];

      try {
        const uploadedUrl =
          await uploadImage(file);

        uploadedUrls.push(uploadedUrl);
      } catch (error) {
        failedFiles.push({
          name: file.name,
          message: error.message,
        });
      }

      setGalleryProgress({
        completed: index + 1,
        total: selectedFiles.length,
      });
    }

    if (uploadedUrls.length > 0) {
      const nextGallery = [
        ...galleryItems,
        ...uploadedUrls,
      ];

      onGalleryChange(
        [...new Set(nextGallery)].join("\n"),
      );
    }

    if (failedFiles.length > 0) {
      setUploadError(
        `${failedFiles.length.toLocaleString(
          "fa-IR",
        )} تصویر آپلود نشد`,
      );
    } else {
      setSuccessMessage(
        "تصاویر گالری با موفقیت آپلود شدند",
      );
    }

    setIsGalleryUploading(false);

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const removeGalleryImage = (
    imagePath,
  ) => {
    const nextGallery = galleryItems.filter(
      (item) => item !== imagePath,
    );

    onGalleryChange(nextGallery.join("\n"));
  };

  return (
    <div className="space-y-7">
      {(uploadError || errorMessage) && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-700"
        >
          <FiAlertCircle className="mt-0.5 shrink-0" />

          <p className="leading-6">
            {uploadError || errorMessage}
          </p>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-700"
        >
          <FiCheckCircle className="mt-0.5 shrink-0" />

          <p className="leading-6">
            {successMessage}
          </p>
        </div>
      )}

      {/* Main image */}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px]">
        <div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-coffee-900">
                تصویر اصلی محصول
              </h3>

              <p className="mt-1 text-xs leading-6 text-coffee-400">
                تصویر دوربری‌شده با پس‌زمینه شفاف
                بهترین نتیجه را دارد.
              </p>
            </div>

            {image && (
              <button
                type="button"
                onClick={() => onImageChange("")}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-100"
              >
                <FiTrash2 />
                حذف تصویر
              </button>
            )}
          </div>

          <input
            ref={mainInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const file =
                event.target.files?.[0];

              handleMainFile(file);
            }}
          />

          <button
            type="button"
            disabled={isMainUploading}
            onClick={() =>
              mainInputRef.current?.click()
            }
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();

              const file =
                event.dataTransfer.files?.[0];

              handleMainFile(file);
            }}
            className="mt-4 flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-coffee-200 bg-cream-50 px-5 text-center transition hover:border-caramel-400 hover:bg-caramel-50 disabled:cursor-wait disabled:opacity-60"
          >
            {isMainUploading ? (
              <>
                <FiLoader className="animate-spin text-3xl text-caramel-600" />

                <p className="mt-4 text-sm font-black text-coffee-900">
                  در حال آپلود تصویر
                </p>
              </>
            ) : (
              <>
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-coffee-700 shadow-sm">
                  <FiUploadCloud size={24} />
                </span>

                <p className="mt-4 text-sm font-black text-coffee-900">
                  تصویر را انتخاب یا اینجا رها کن
                </p>

                <p className="mt-2 text-xs text-coffee-400">
                  PNG، JPG یا WebP تا ۵ مگابایت
                </p>
              </>
            )}
          </button>

          <div className="mt-5">
            <label
              htmlFor="manual-product-image"
              className="mb-2 block text-xs font-bold text-coffee-600"
            >
              یا مسیر تصویر را دستی وارد کن
            </label>

            <input
              id="manual-product-image"
              type="text"
              dir="ltr"
              value={image}
              onChange={(event) =>
                onImageChange(event.target.value)
              }
              placeholder="/images/product/latte.webp"
              className={`${inputClassName} text-left`}
            />
          </div>
        </div>

        {/* Main preview */}

        <div>
          <p className="mb-2 text-sm font-bold text-coffee-800">
            پیش‌نمایش تصویر
          </p>

          <div className="relative aspect-square overflow-hidden rounded-2xl border border-coffee-100 bg-cream-100">
            {image && !mainPreviewFailed ? (
              <img
                src={image}
                alt={
                  productName
                    ? `پیش‌نمایش ${productName}`
                    : "پیش‌نمایش محصول"
                }
                onError={() =>
                  setMainPreviewFailed(true)
                }
                className="size-full object-contain p-5"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center px-5 text-center text-coffee-300">
                <FiImage size={32} />

                <p className="mt-3 text-xs leading-6">
                  هنوز تصویر معتبری انتخاب نشده است.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}

      <div className="border-t border-coffee-100 pt-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-black text-coffee-900">
              گالری محصول
            </h3>

            <p className="mt-1 text-xs leading-6 text-coffee-400">
              حداکثر ۸ تصویر برای نمایش جزئیات
              محصول
            </p>
          </div>

          <p className="text-xs font-bold text-coffee-400">
            {galleryItems.length.toLocaleString(
              "fa-IR",
            )}{" "}
            از{" "}
            {MAX_GALLERY_IMAGES.toLocaleString(
              "fa-IR",
            )}
          </p>
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const files = Array.from(
              event.target.files || [],
            );

            handleGalleryFiles(files);
          }}
        />

        <button
          type="button"
          disabled={
            isGalleryUploading ||
            galleryItems.length >=
              MAX_GALLERY_IMAGES
          }
          onClick={() =>
            galleryInputRef.current?.click()
          }
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();

            const files = Array.from(
              event.dataTransfer.files || [],
            );

            handleGalleryFiles(files);
          }}
          className="mt-4 flex min-h-28 w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-coffee-200 bg-cream-50 px-5 transition hover:border-caramel-400 hover:bg-caramel-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGalleryUploading ? (
            <>
              <FiLoader className="animate-spin text-caramel-600" />

              <span className="text-sm font-bold text-coffee-700">
                آپلود{" "}
                {galleryProgress.completed.toLocaleString(
                  "fa-IR",
                )}{" "}
                از{" "}
                {galleryProgress.total.toLocaleString(
                  "fa-IR",
                )}
              </span>
            </>
          ) : (
            <>
              <FiUploadCloud className="text-xl text-coffee-600" />

              <span className="text-sm font-bold text-coffee-700">
                انتخاب تصاویر گالری
              </span>
            </>
          )}
        </button>

        {galleryItems.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {galleryItems.map(
              (galleryImage, index) => (
                <div
                  key={galleryImage}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-coffee-100 bg-cream-100"
                >
                  <img
                    src={galleryImage}
                    alt={`تصویر گالری ${
                      index + 1
                    }`}
                    className="size-full object-contain p-3"
                  />

                  <button
                    type="button"
                    aria-label={`حذف تصویر گالری ${
                      index + 1
                    }`}
                    onClick={() =>
                      removeGalleryImage(
                        galleryImage,
                      )
                    }
                    className="absolute left-2 top-2 flex size-9 items-center justify-center rounded-xl bg-white/90 text-red-600 opacity-100 shadow-sm backdrop-blur transition hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <FiTrash2 />
                  </button>

                  <span className="absolute bottom-2 right-2 rounded-lg bg-coffee-950/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                    تصویر{" "}
                    {(index + 1).toLocaleString(
                      "fa-IR",
                    )}
                  </span>
                </div>
              ),
            )}
          </div>
        )}

        <div className="mt-5">
          <label
            htmlFor="manual-product-gallery"
            className="mb-2 block text-xs font-bold text-coffee-600"
          >
            مسیرهای گالری
          </label>

          <textarea
            id="manual-product-gallery"
            rows={4}
            dir="ltr"
            value={gallery}
            onChange={(event) =>
              onGalleryChange(event.target.value)
            }
            placeholder={
              "/uploads/products/image-1.webp\n/uploads/products/image-2.webp"
            }
            className="w-full resize-y rounded-xl border border-coffee-100 bg-cream-50 px-4 py-3 text-left text-sm leading-7 text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100"
          />
        </div>
      </div>
    </div>
  );
}
"use client";

import swal from "sweetalert";

const baseOptions = {
    buttons: false,
    timer: 1800,
};

export function notifySuccess(title, text = "") {
    return swal({
        ...baseOptions,
        title,
        text,
        icon: "success",
    });
}

export function notifyError(title, text = "") {
    return swal({
        ...baseOptions,
        title,
        text,
        icon: "error",
        timer: 2600,
    });
}

export function notifyInfo(title, text = "") {
    return swal({
        ...baseOptions,
        title,
        text,
        icon: "info",
    });
}

export function notifyWarning(title, text = "") {
    return swal({
        ...baseOptions,
        title,
        text,
        icon: "warning",
        timer: 2400,
    });
}

export function confirmAction({
    title,
    text = "",
    confirmText = "بله",
    cancelText = "انصراف",
    dangerMode = false,
} = {}) {
    return swal({
        title,
        text,
        icon: dangerMode ? "warning" : "info",
        buttons: {
            cancel: cancelText,
            confirm: confirmText,
        },
        dangerMode,
    });
}

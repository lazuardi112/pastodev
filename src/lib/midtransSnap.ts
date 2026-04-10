declare global {
  interface Window {
    snap?: {
      pay?: (
        token: string,
        opts?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
      embed?: (
        containerId: string,
        opts: {
          embedId: string;
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

const SNAP_SANDBOX = "https://app.sandbox.midtrans.com/snap/snap.js";
const SNAP_PROD = "https://app.midtrans.com/snap/snap.js";

export function loadMidtransSnap(clientKey: string, isProduction: boolean): Promise<void> {
  if (!clientKey) return Promise.reject(new Error("Client key Midtrans tidak di-set"));
  if (typeof window === "undefined") return Promise.resolve();
  if (window.snap) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-midtrans-snap="1"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Gagal memuat Snap")));
      return;
    }
    const s = document.createElement("script");
    s.src = isProduction ? SNAP_PROD : SNAP_SANDBOX;
    s.async = true;
    s.setAttribute("data-client-key", clientKey);
    s.setAttribute("data-midtrans-snap", "1");
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Gagal memuat Snap Midtrans"));
    document.body.appendChild(s);
  });
}

type SnapHandlers = {
  onSuccess?: (result?: unknown) => void;
  onPending?: (result?: unknown) => void;
  onError?: (result?: unknown) => void;
  onClose?: () => void;
};

/** True jika embed dipanggil (QRIS di dalam halaman/modal). */
export function snapEmbed(containerId: string, token: string, handlers: SnapHandlers): boolean {
  const embed = window.snap?.embed;
  if (typeof embed !== "function") {
    return false;
  }
  embed(containerId, {
    embedId: token,
    onSuccess: handlers.onSuccess,
    onPending: handlers.onPending,
    onError: handlers.onError,
    onClose: handlers.onClose,
  });
  return true;
}

export function snapPay(token: string, handlers: SnapHandlers) {
  if (!window.snap?.pay) {
    handlers.onError?.();
    return;
  }
  window.snap.pay(token, {
    onSuccess: handlers.onSuccess,
    onPending: handlers.onPending,
    onError: handlers.onError,
    onClose: handlers.onClose,
  });
}

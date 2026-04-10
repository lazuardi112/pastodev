import { useEffect, useRef } from "react";
import { QrCode, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { transactionService } from "@/services/api";

type QrisPayDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrString: string | null;
  transactionId: number | null;
  amountLabel: string;
  orderHint?: string;
  expiryHint?: string | null;
  onSuccess?: () => void;
  onFailed?: () => void;
  /** Polling GET /api/transactions/:id untuk status success | failed */
  enablePoll?: boolean;
};

export function QrisPayDialog({
  open,
  onOpenChange,
  qrString,
  transactionId,
  amountLabel,
  orderHint,
  expiryHint,
  onSuccess,
  onFailed,
  enablePoll = true,
}: QrisPayDialogProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open || !enablePoll || !transactionId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const tick = async () => {
      try {
        const res = await transactionService.getById(transactionId);
        const st = String(res.data?.data?.status ?? "").toLowerCase();
        if (st === "success") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          onOpenChange(false);
          onSuccess?.();
        } else if (st === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          onFailed?.();
        }
      } catch {
        /* network */
      }
    };

    intervalRef.current = setInterval(tick, 3000);
    tick();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, enablePoll, transactionId, onOpenChange, onSuccess, onFailed]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-border/50 p-0 gap-0 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <DialogHeader className="p-6 pb-2 text-left space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <QrCode className="h-6 w-6 text-primary" />
            Bayar dengan QRIS
          </DialogTitle>
          <DialogDescription>
            Scan kode berikut dengan e-wallet atau m-banking Anda. Nominal:{" "}
            <span className="font-semibold text-foreground">{amountLabel}</span>
            {orderHint ? (
              <>
                {" "}
                · Order <span className="font-mono text-xs">{orderHint}</span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-4">
          <div className="flex justify-center rounded-2xl border border-dashed border-primary/30 bg-muted/30 p-4">
            {qrString ? (
              <div className="bg-white p-3 rounded-xl shadow-inner">
                <QRCode value={qrString} size={220} level="M" />
              </div>
            ) : (
              <div className="h-[220px] w-[220px] flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            )}
          </div>
          {expiryHint ? (
            <p className="text-center text-xs text-muted-foreground">Berlaku hingga: {expiryHint}</p>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Menunggu konfirmasi Midtrans… Status diperbarui otomatis setelah pembayaran.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

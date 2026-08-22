import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONES: Record<ToastTone, { icon: typeof Info; className: string }> = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/[0.09] text-emerald-200",
  },
  error: {
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/[0.09] text-amber-200",
  },
  info: {
    icon: Info,
    className: "border-luxury-gold/30 bg-luxury-gold/[0.09] text-luxury-champagne",
  },
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, tone, message }]);
      // Errors linger — they usually need reading twice.
      setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4000);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Bottom on mobile (thumb reach), top-right on desktop. */}
      <div
        aria-live="polite"
        className="fixed z-[100] inset-x-4 bottom-4 sm:inset-x-auto sm:right-6 sm:top-6 sm:bottom-auto sm:w-80 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map(({ id, tone, message }) => {
          const { icon: Icon, className } = TONES[tone];
          return (
            <div
              key={id}
              role="status"
              className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/40 ${className}`}
            >
              <Icon size={15} className="mt-0.5 flex-shrink-0" />
              <p className="text-[12px] leading-relaxed flex-1 min-w-0 break-words">
                {message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Dismiss"
                className="text-current/50 hover:text-current transition-colors flex-shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>.");
  return context;
}

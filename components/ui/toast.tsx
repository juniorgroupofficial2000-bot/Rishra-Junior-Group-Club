"use client";

import { cn } from "@/lib/cn";
import { transitionNormal } from "@/lib/motion";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Button } from "./button";

type ToastVariant = "info" | "success" | "warning" | "danger";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (input: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: TriangleAlert,
} as const;

const styles: Record<ToastVariant, string> = {
  info: "border-ink-200 bg-surface-raised",
  success: "border-lotus-100 bg-lotus-50",
  warning: "border-marigold-100 bg-marigold-50",
  danger: "border-alta-100 bg-alta-50",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const reduceMotion = useReducedMotion();

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((input: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { ...input, id }]);
    window.setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-toast)] flex flex-col items-center gap-2 p-4 sm:items-end"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence>
          {items.map((item) => {
            const Icon = icons[item.variant];
            return (
              <motion.div
                key={item.id}
                role="status"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                transition={transitionNormal}
                className={cn(
                  "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-md",
                  styles[item.variant],
                )}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-700" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                  {item.description ? (
                    <p className="mt-0.5 text-sm text-ink-600">{item.description}</p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ModalVariant = "success" | "error" | "info" | "warning";

type AlertOptions = {
  title?: string;
  message: string;
  variant?: ModalVariant;
  confirmText?: string;
};

type ConfirmOptions = AlertOptions & {
  cancelText?: string;
};

type ModalRequest = {
  id: number;
  title: string;
  message: string;
  variant: ModalVariant;
  confirmText: string;
  cancelText: string | null;
  resolve: (value: boolean) => void;
};

type ModalApi = {
  /** Replaces window.alert. Resolves once the user dismisses the dialog. */
  alert: (options: AlertOptions | string) => Promise<void>;
  /** Replaces window.confirm. Resolves true when confirmed, false when cancelled. */
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  /** Shorthands for the common notification cases. */
  success: (message: string, title?: string) => Promise<void>;
  error: (message: string, title?: string) => Promise<void>;
  info: (message: string, title?: string) => Promise<void>;
};

const ModalContext = createContext<ModalApi | null>(null);

const VARIANT_STYLES: Record<
  ModalVariant,
  { label: string; dot: string; confirm: string }
> = {
  success: {
    label: "Success",
    dot: "bg-[var(--accent)]",
    confirm: "btn-primary",
  },
  error: {
    label: "Error",
    dot: "bg-[var(--danger)]",
    confirm: "btn-primary",
  },
  warning: {
    label: "Confirm",
    dot: "bg-[var(--danger)]",
    confirm: "btn-primary",
  },
  info: {
    label: "Notice",
    dot: "bg-[var(--faint)]",
    confirm: "btn-primary",
  },
};

const DEFAULT_TITLES: Record<ModalVariant, string> = {
  success: "Success",
  error: "Something went wrong",
  warning: "Please confirm",
  info: "Notice",
};

export default function ModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Queued so two notifications in a row don't overwrite each other.
  const [queue, setQueue] = useState<ModalRequest[]>([]);
  const nextId = useRef(0);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  const current = queue[0] ?? null;

  const push = useCallback(
    (options: ConfirmOptions, withCancel: boolean) =>
      new Promise<boolean>((resolve) => {
        const variant = options.variant ?? "info";

        setQueue((prev) => [
          ...prev,
          {
            id: nextId.current++,
            title: options.title ?? DEFAULT_TITLES[variant],
            message: options.message,
            variant,
            confirmText: options.confirmText ?? (withCancel ? "Confirm" : "OK"),
            cancelText: withCancel ? options.cancelText ?? "Cancel" : null,
            resolve,
          },
        ]);
      }),
    []
  );

  const close = useCallback((result: boolean) => {
    setQueue((prev) => {
      const [head, ...rest] = prev;
      head?.resolve(result);
      return rest;
    });
  }, []);

  // Escape dismisses (as cancel); focus the primary button when a dialog opens.
  useEffect(() => {
    if (!current) return;

    confirmButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, close]);

  const api = useMemo<ModalApi>(() => {
    const normalise = (options: AlertOptions | string): AlertOptions =>
      typeof options === "string" ? { message: options } : options;

    const alert = async (options: AlertOptions | string) => {
      await push(normalise(options), false);
    };

    return {
      alert,
      confirm: (options) =>
        push(
          { variant: "warning", ...(typeof options === "string" ? { message: options } : options) },
          true
        ),
      success: (message, title) =>
        alert({ message, title, variant: "success" }),
      error: (message, title) => alert({ message, title, variant: "error" }),
      info: (message, title) => alert({ message, title, variant: "info" }),
    };
  }, [push]);

  const styles = current ? VARIANT_STYLES[current.variant] : null;

  return (
    <ModalContext.Provider value={api}>
      {children}

      {current && styles && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/25 p-4"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`modal-title-${current.id}`}
            aria-describedby={`modal-message-${current.id}`}
            onClick={(event) => event.stopPropagation()}
            className="animate-modal-in w-full max-w-[420px] rounded-[var(--radius)] border border-[var(--border)] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
              />
              <span className="eyebrow">{styles.label}</span>
            </div>

            <h2
              id={`modal-title-${current.id}`}
              className="mt-3 text-xl"
            >
              {current.title}
            </h2>

            <p
              id={`modal-message-${current.id}`}
              className="muted mt-2 break-words text-[15px] leading-relaxed"
            >
              {current.message}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              {current.cancelText && (
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="btn"
                >
                  {current.cancelText}
                </button>
              )}

              <button
                ref={confirmButtonRef}
                type="button"
                onClick={() => close(true)}
                className={`btn ${styles.confirm}`}
              >
                {current.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalApi {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used inside a ModalProvider");
  }

  return context;
}

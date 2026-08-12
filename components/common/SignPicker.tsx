"use client";

import { useEffect } from "react";

type Sign = {
  id: string;
  name: string;
  modelLabel: string;
  imagePath: string;
};

type SignPickerProps = {
  open: boolean;
  title: string;
  confirmText: string;
  signs: Sign[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  onCancel: () => void;
  onConfirm: () => void;
  required?: number;
};

export default function SignPicker({
  open,
  title,
  confirmText,
  signs,
  selected,
  onChange,
  onCancel,
  onConfirm,
  required = 5,
}: SignPickerProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange((prev) => prev.filter((value) => value !== id));
    } else if (selected.length < required) {
      onChange((prev) => [...prev, id]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/25 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="animate-modal-in flex max-h-[85vh] w-full max-w-3xl flex-col rounded-[var(--radius)] border border-[var(--border)] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <h2 className="text-lg">{title}</h2>
          <span className="tag">
            {selected.length}/{required} selected
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {signs.length === 0 ? (
            <p className="muted py-8 text-center text-[15px]">
              No unused signs available.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {signs.map((sign) => {
                const isSelected = selected.includes(sign.id);

                return (
                  <button
                    key={sign.id}
                    type="button"
                    onClick={() => toggle(sign.id)}
                    aria-pressed={isSelected}
                    className="rounded-[var(--radius-sm)] border p-3 text-center transition"
                    style={{
                      borderColor: isSelected
                        ? "var(--accent)"
                        : "var(--border)",
                      background: isSelected
                        ? "color-mix(in srgb, var(--accent) 6%, #ffffff)"
                        : "#ffffff",
                    }}
                  >
                    <img
                      src={sign.imagePath}
                      alt=""
                      className="mx-auto h-16 w-16 rounded-[var(--radius-sm)] border border-[var(--border)] object-cover"
                    />
                    <div className="mt-2 text-[15px] font-medium">
                      {sign.name}
                    </div>
                    <div className="faint text-[12px]">{sign.modelLabel}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] px-6 py-4">
          <button type="button" onClick={onCancel} className="btn">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={selected.length !== required}
            className="btn btn-primary"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

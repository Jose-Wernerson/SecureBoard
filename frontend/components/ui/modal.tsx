"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  size?: "md" | "lg";
};

const sizeClassName = {
  md: "max-w-xl",
  lg: "max-w-4xl",
} as const;

export function Modal({ open, title, description, children, footer, onClose, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm" onClick={onClose}>
      <div
        aria-modal="true"
        className={cn(
          "relative w-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(9,16,28,0.98),_rgba(13,24,39,0.98))] p-6 shadow-2xl shadow-black/40",
          sizeClassName[size],
        )}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">SecureBoard</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{title}</h2>
            {description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{description}</p> : null}
          </div>

          <button className="rounded-2xl p-2 text-slate-400 transition hover:bg-white/8 hover:text-white" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">{children}</div>

        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}
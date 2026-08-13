"use client";

import {
  createContext, useCallback, useContext, useEffect, useState, type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const font = "var(--font-inter), Inter, sans-serif";

export interface TourStep {
  /** CSS selector for the element to spotlight, e.g. '[data-tour="nav-hr"]'. */
  target: string;
  title: string;
  body: string;
  /** Optional side effect fired when the step activates — e.g. open a nav
   *  dropdown so its mini-tabs render before the tour spotlights them. */
  onEnter?: () => void;
}

interface TourContextValue {
  /** Begin a tour. No-op if one is already running. */
  startTour: (steps: TourStep[]) => void;
  stopTour: () => void;
  active: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside <TourProvider>");
  return ctx;
}

/**
 * A lightweight guided product tour. Dims the screen, cuts a spotlight around
 * the current step's target element (matched by CSS selector, usually a
 * `data-tour="…"` marker) and shows a tooltip with Back / Next / Skip. Custom
 * built (no external tour library) so it inherits the app's look and the CSP.
 */
export function TourProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const startTour = useCallback((s: TourStep[]) => {
    if (!s.length) return;
    setSteps(s);
    setIndex(0);
  }, []);
  const stopTour = useCallback(() => {
    setSteps(null);
    setIndex(0);
    setRect(null);
  }, []);

  const step = steps ? steps[index] : null;

  // Fire the step's optional side effect (e.g. open a nav dropdown so its
  // mini-tabs render) when the step becomes active.
  useEffect(() => {
    step?.onEnter?.();
  }, [step]);

  // Locate and keep tracking the target element (it can move as the page
  // scrolls the element into view, or a dropdown opens).
  useEffect(() => {
    if (!step) return;
    let raf = 0;
    let scrolled = false;
    const measure = () => {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (el) {
        if (!scrolled) { el.scrollIntoView({ block: "center", behavior: "smooth" }); scrolled = true; }
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null); // target absent: fall back to a centred tooltip
      }
    };
    measure();
    const onChange = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    const poll = window.setInterval(measure, 350);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
      window.clearInterval(poll);
      cancelAnimationFrame(raf);
    };
  }, [step]);

  useEffect(() => {
    if (!steps) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopTour();
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, steps.length - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [steps, stopTour]);

  const next = () => {
    if (!steps) return;
    if (index >= steps.length - 1) stopTour();
    else setIndex((i) => i + 1);
  };
  const back = () => setIndex((i) => Math.max(0, i - 1));

  return (
    <TourContext.Provider value={{ startTour, stopTour, active: !!steps }}>
      {children}
      {steps && step && typeof document !== "undefined" &&
        createPortal(
          <TourOverlay
            step={step}
            rect={rect}
            index={index}
            total={steps.length}
            onNext={next}
            onBack={back}
            onSkip={stopTour}
          />,
          document.body,
        )}
    </TourContext.Provider>
  );
}

const PAD = 6;
const TIP_W = 320;

function TourOverlay({
  step, rect, index, total, onNext, onBack, onSkip,
}: {
  step: TourStep;
  rect: DOMRect | null;
  index: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const last = index === total - 1;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  // Tooltip placement: below the target if there's room, otherwise above.
  // Horizontally centred on the target (clamped to the viewport) so wide
  // targets like the full-width sub-nav don't pin the tip to the far left.
  let tipStyle: React.CSSProperties;
  if (rect) {
    const below = rect.bottom + 200 < vh;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - TIP_W / 2, 12),
      vw - TIP_W - 12,
    );
    tipStyle = below
      ? { top: rect.bottom + 14, left }
      : { top: rect.top - 14, left, transform: "translateY(-100%)" };
  } else {
    tipStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  return (
    <div className="fixed inset-0 z-[9998]" style={{ fontFamily: font }}>
      {/* Click-blocker so the app can't be interacted with mid-tour. */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      {rect ? (
        <div
          className="pointer-events-none absolute rounded-[8px] ring-2 ring-[#00C3ED] transition-all duration-200"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(8,19,64,0.65)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#081340]/65" />
      )}

      {/* Tooltip */}
      <div
        className="fixed w-[320px] rounded-[12px] border border-[#DAE0EF] bg-white p-5 shadow-[0_24px_48px_-12px_rgba(8,19,64,0.4)]"
        style={tipStyle}
      >
        <button
          onClick={onSkip}
          aria-label="End tour"
          className="absolute right-3 top-3 cursor-pointer border-none bg-transparent p-1 text-[#8B93AD] hover:text-[#081340]"
        >
          <X size={16} />
        </button>
        <p className="m-0 mb-1 text-[11px] font-bold uppercase tracking-[0.6px] text-[#00C3ED]">
          Step {index + 1} of {total}
        </p>
        <h3 className="m-0 mb-2 pr-5 text-[16px] font-bold text-[#081340]">{step.title}</h3>
        <p className="m-0 mb-4 text-[13px] leading-[1.6] text-[#70768E]">{step.body}</p>

        {/* Progress dots */}
        <div className="mb-4 flex gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{ background: i <= index ? "#00C3ED" : "#DAE0EF" }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="cursor-pointer border-none bg-transparent text-[13px] font-semibold text-[#70768E] hover:text-[#081340]"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button
                onClick={onBack}
                className="h-9 cursor-pointer rounded-[8px] border border-[#DAE0EF] bg-white px-4 text-[13px] font-semibold text-[#081340]"
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="h-9 cursor-pointer rounded-[8px] border-none bg-[#081340] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#00C3ED]"
            >
              {last ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

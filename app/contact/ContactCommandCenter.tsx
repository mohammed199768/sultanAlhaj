"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  emailHref,
  formspreeEndpoint,
  profile,
  whatsappHref,
} from "@/lib/data/profile";

type FormStatus = "idle" | "submitting" | "success" | "error";
type VisualVariant = "name" | "company" | "message" | "sending" | "success";

interface MessageValues {
  name: string;
  company: string;
  contact: string;
  message: string;
}

interface ContactActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  emphasis?: boolean;
}

interface OrbitActionItem extends ContactActionItem {
  angle: number;
  radius: string;
  duration: string;
}

type OrbitStyle = CSSProperties & Record<"--orbit-start" | "--orbit-end" | "--orbit-radius" | "--orbit-duration" | "--counter-start" | "--counter-end", string>;

const emptyMessage: MessageValues = {
  name: "",
  company: "",
  contact: "",
  message: "",
};

const formSteps = [
  { label: "Person name", shortLabel: "Name", visual: "name" },
  { label: "Company name", shortLabel: "Company", visual: "company" },
  { label: "Message", shortLabel: "Message", visual: "message" },
] as const;

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-display text-[0.66rem] uppercase tracking-[0.18em] text-champagne/80"
    >
      {children}
    </label>
  );
}

function StepVisual({ variant }: { variant: VisualVariant }) {
  if (variant === "company") {
    return (
      <svg viewBox="0 0 160 120" className="step-visual" aria-hidden>
        <rect x="34" y="30" width="92" height="68" rx="16" />
        <path d="M55 98V48h50v50" />
        <path d="M55 61h50M55 74h50M70 48V30h20v18" />
        <circle className="step-visual-pulse" cx="116" cy="37" r="6" />
      </svg>
    );
  }

  if (variant === "message") {
    return (
      <svg viewBox="0 0 160 120" className="step-visual" aria-hidden>
        <rect x="32" y="34" width="96" height="58" rx="16" />
        <path d="M38 42l42 30 42-30" />
        <path className="step-visual-line" d="M55 78h34" />
        <path className="step-visual-line step-visual-line-late" d="M55 88h50" />
        <circle cx="124" cy="31" r="5" />
      </svg>
    );
  }

  if (variant === "sending") {
    return (
      <svg viewBox="0 0 160 120" className="step-visual step-visual-sending" aria-hidden>
        <circle cx="80" cy="60" r="32" />
        <path className="step-visual-orbit" d="M34 60a46 22 0 1 0 92 0a46 22 0 1 0-92 0" />
        <path d="M67 62l37-20-13 39-10-15-14 11z" />
      </svg>
    );
  }

  if (variant === "success") {
    return (
      <svg viewBox="0 0 160 120" className="step-visual" aria-hidden>
        <circle cx="80" cy="60" r="38" />
        <path className="step-visual-check" d="M61 61l13 13 28-31" />
        <path className="step-visual-line" d="M48 98h64" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 160 120" className="step-visual" aria-hidden>
      <circle cx="80" cy="48" r="19" />
      <path d="M46 98c7-23 25-34 34-34s27 11 34 34" />
      <path className="step-visual-line" d="M43 28h74" />
      <circle className="step-visual-pulse" cx="116" cy="28" r="5" />
    </svg>
  );
}

function StepProgress({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Message progress">
      {formSteps.map((item, index) => (
        <li
          key={item.label}
          className={cn(
            "relative overflow-hidden rounded-full border px-3 py-2 text-center font-display text-[0.6rem] uppercase tracking-[0.13em]",
            index <= step
              ? "border-champagne/45 bg-champagne/12 text-champagne"
              : "border-steel-400/20 bg-ink/35 text-haze/55"
          )}
          aria-current={index === step ? "step" : undefined}
        >
          {index === step ? (
            <span className="absolute inset-y-0 left-0 w-1/3 bg-champagne/10" aria-hidden />
          ) : null}
          <span className="relative">{item.shortLabel}</span>
        </li>
      ))}
    </ol>
  );
}

function SendingState() {
  return (
    <div className="p-6 md:p-8" role="status" aria-live="polite">
      <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center">
        <div className="rounded-[1.25rem] border border-champagne/25 bg-champagne/10 p-4">
          <StepVisual variant="sending" />
        </div>
        <div>
          <p className="eyebrow">Sending message</p>
          <h2 className="mt-3 text-2xl font-semibold text-mist-300 md:text-3xl">
            Sending your brief...
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-mist/78">
            Preparing your message for delivery. Almost there.
          </p>
          <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-steel-400/15">
            <span className="sending-rail block h-full w-1/3 rounded-full bg-champagne" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div
      className="p-6 md:p-8"
      role="status"
      aria-live="polite"
    >
      <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center">
        <div className="rounded-[1.25rem] border border-champagne/30 bg-champagne/10 p-4">
          <StepVisual variant="success" />
        </div>
        <div>
          <p className="eyebrow">Message received</p>
          <h2 className="mt-3 text-2xl font-semibold text-mist-300 md:text-3xl">
            Message sent.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-mist/82">
            Message sent. Sultan will get back to you soon.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="btn-primary mt-7 min-h-11"
          >
            Send another message
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<MessageValues>(emptyMessage);
  const [status, setStatus] = useState<FormStatus>("idle");

  const isCurrentStepValid =
    step === 0
      ? values.name.trim().length > 1
      : step === 1
        ? values.company.trim().length > 1
        : values.message.trim().length > 4;
  const isFinalStep = step === formSteps.length - 1;
  const visual = formSteps[step].visual as VisualVariant;

  const updateValue = (field: keyof MessageValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (status === "error") setStatus("idle");
  };

  const resetForm = () => {
    setValues(emptyMessage);
    setStep(0);
    setStatus("idle");
  };

  const goNext = () => {
    if (!isCurrentStepValid) return;
    setStep((current) => Math.min(current + 1, formSteps.length - 1));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFinalStep) {
      goNext();
      return;
    }
    if (!isCurrentStepValid || status === "submitting") return;

    setStatus("submitting");
    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          company: values.company,
          contact: values.contact,
          message: values.message,
          _subject: "New Sultan Shadi contact request",
        }),
      });

      if (!response.ok) throw new Error("Formspree request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "submitting") return <SendingState />;
  if (status === "success") return <SuccessState onReset={resetForm} />;

  return (
    <form onSubmit={handleSubmit} className="p-5 md:p-7">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_22rem] md:items-start">
        <div>
          <p className="eyebrow">Message form</p>
          <h2 className="mt-3 text-2xl font-semibold text-mist-300 md:text-3xl">
            {step === 0 ? "Start with your name" : step === 1 ? "Where is this going?" : "Shape the brief"}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-haze/74">
            {step === 0
              ? "A simple introduction keeps the conversation human."
              : step === 1
                ? "Share the company or project context and a reply channel if you prefer."
                : "A short, specific message is enough to open the right conversation."}
          </p>
        </div>
        <StepProgress step={step} />
      </div>

      <div className="mt-7 grid gap-5 rounded-[1.35rem] border border-steel-400/18 bg-mist-300/[0.035] p-4 md:grid-cols-[12rem_minmax(0,1fr)] md:p-5">
        <div className="rounded-[1.1rem] border border-champagne/20 bg-champagne/[0.08] p-4">
          <StepVisual variant={visual} />
        </div>

        <div className="min-h-[11.5rem]">
          {step === 0 ? (
            <div className="grid gap-3">
              <FieldLabel htmlFor="contact-name">Person name</FieldLabel>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={values.name}
                onChange={(event) => updateValue("name", event.target.value)}
                className="min-h-12 rounded-2xl border border-steel-400/25 bg-ink/72 px-4 text-base text-mist-300 outline-none transition-colors placeholder:text-haze/45 focus:border-champagne"
                placeholder="Your name"
              />
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4">
              <div className="grid gap-3">
                <FieldLabel htmlFor="contact-company">Company name</FieldLabel>
                <input
                  id="contact-company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  required
                  value={values.company}
                  onChange={(event) => updateValue("company", event.target.value)}
                  className="min-h-12 rounded-2xl border border-steel-400/25 bg-ink/72 px-4 text-base text-mist-300 outline-none transition-colors placeholder:text-haze/45 focus:border-champagne"
                  placeholder="Company or project"
                />
              </div>
              <div className="grid gap-3">
                <FieldLabel htmlFor="contact-reply">Email or phone</FieldLabel>
                <input
                  id="contact-reply"
                  name="contact"
                  type="text"
                  autoComplete="email"
                  value={values.contact}
                  onChange={(event) => updateValue("contact", event.target.value)}
                  className="min-h-12 rounded-2xl border border-steel-400/25 bg-ink/72 px-4 text-base text-mist-300 outline-none transition-colors placeholder:text-haze/45 focus:border-champagne"
                  placeholder="Optional reply contact"
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-3">
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={4}
                value={values.message}
                onChange={(event) => updateValue("message", event.target.value)}
                className="min-h-32 resize-y rounded-2xl border border-steel-400/25 bg-ink/72 px-4 py-3 text-base leading-7 text-mist-300 outline-none transition-colors placeholder:text-haze/45 focus:border-champagne"
                placeholder="Tell Sultan what you want to build."
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          disabled={step === 0}
          className="btn-ghost min-h-11 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="min-h-5 max-w-xs text-sm text-haze/70" aria-live="polite">
            {status === "error"
              ? "Something went wrong. Please try again or contact Sultan directly by email."
              : `Step ${step + 1} of ${formSteps.length}`}
          </p>
          {isFinalStep ? (
            <button
              type="submit"
              disabled={!isCurrentStepValid}
              className="btn-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Send className="h-4 w-4" aria-hidden />
              Send brief
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!isCurrentStepValid}
              className="btn-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function FormModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    html.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-navy-900/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close message form"
      />
      <div className="contact-modal-panel relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-t-[1.5rem] border border-steel-400/25 bg-[linear-gradient(145deg,rgba(0,4,25,0.98),rgba(7,23,57,0.98)_56%,rgba(24,40,60,0.95))] shadow-2xl shadow-navy-900/60 sm:rounded-[1.5rem]">
        <div className="flex items-center justify-between gap-4 border-b border-steel-400/18 px-5 py-4 md:px-7">
          <div>
            <p className="font-display text-[0.62rem] uppercase tracking-[0.22em] text-champagne/75">
              Contact Sultan
            </p>
            <h2 id="contact-form-title" className="mt-1 text-xl font-semibold text-mist-300">
              Message command panel
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close message form"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-champagne/25 bg-champagne/10 text-champagne transition-colors hover:bg-champagne hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <MessageForm />
      </div>
    </div>
  );
}

function ActionIcon({ icon: Icon, emphasis }: { icon: LucideIcon; emphasis?: boolean }) {
  return (
    <span
      className={cn(
        "flex h-11 w-11 flex-none items-center justify-center rounded-full border transition-colors duration-200",
        emphasis
          ? "border-champagne bg-champagne text-ink"
          : "border-champagne/35 bg-champagne/12 text-champagne"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}

function ActionContent({ action }: { action: ContactActionItem }) {
  return (
    <>
      <ActionIcon icon={action.icon} emphasis={action.emphasis} />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[0.62rem] uppercase tracking-[0.16em] text-mist-300">
          {action.label}
        </span>
      </span>
      <ArrowUpRight
        className="h-4 w-4 flex-none text-haze/55 transition-colors duration-200 group-hover:text-champagne"
        aria-hidden
      />
    </>
  );
}

function MobileAction({ action }: { action: ContactActionItem }) {
  const className = cn(
    "group flex min-h-[4.75rem] min-w-0 items-center gap-3 rounded-[1rem] border border-steel-400/20 bg-mist-300/[0.055] p-3 text-left shadow-xl shadow-navy-900/20 backdrop-blur-md transition duration-200 hover:border-champagne/45 hover:bg-mist-300/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne",
    action.emphasis && "border-champagne/40 bg-champagne/12"
  );

  if (action.href) {
    return (
      <a
        href={action.href}
        target={action.external ? "_blank" : undefined}
        rel={action.external ? "noopener noreferrer" : undefined}
        className={className}
        aria-label={action.label}
      >
        <ActionContent action={action} />
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      className={className}
      aria-label={action.label}
    >
      <ActionContent action={action} />
    </button>
  );
}

function orbitNodeStyle(action: OrbitActionItem): OrbitStyle {
  return {
    "--orbit-start": `${action.angle}deg`,
    "--orbit-end": `${action.angle + 360}deg`,
    "--orbit-radius": action.radius,
    "--orbit-duration": action.duration,
    "--counter-start": `${-action.angle}deg`,
    "--counter-end": `${-action.angle - 360}deg`,
  };
}

function OrbitNode({ action }: { action: OrbitActionItem }) {
  const Icon = action.icon;
  const className = cn(
    "orbit-node-control group absolute left-0 top-0 z-20 flex h-16 w-16 items-center justify-center rounded-full border border-steel-400/25 bg-ink/78 text-champagne shadow-2xl shadow-navy-900/35 backdrop-blur-md transition-colors duration-200 hover:border-champagne/55 hover:bg-champagne hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne",
    action.emphasis && "h-[4.6rem] w-[4.6rem] border-champagne/55 bg-champagne/16"
  );
  const children = (
    <span className="orbit-node-face flex h-full w-full items-center justify-center">
      <Icon className="h-5 w-5" aria-hidden />
      <span className="sr-only">{action.label}</span>
    </span>
  );

  if (action.href) {
    return (
      <div className="orbit-node" style={orbitNodeStyle(action)}>
        <a
          href={action.href}
          target={action.external ? "_blank" : undefined}
          rel={action.external ? "noopener noreferrer" : undefined}
          className={className}
          aria-label={action.label}
          title={action.label}
        >
          {children}
        </a>
      </div>
    );
  }

  return (
    <div className="orbit-node" style={orbitNodeStyle(action)}>
      <button
        type="button"
        onClick={action.onClick}
        className={className}
        aria-label={action.label}
        title={action.label}
      >
        {children}
      </button>
    </div>
  );
}

function ContactCore({ onSendMessage }: { onSendMessage: () => void }) {
  return (
    <div className="absolute left-1/2 top-1/2 z-10 flex h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-champagne/30 bg-ink/88 p-6 text-center shadow-2xl shadow-navy-900/45 backdrop-blur-md">
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-champagne/45 bg-steel-900">
        <Image
          src="/sultan.jpeg"
          alt="Sultan Shadi portrait"
          fill
          sizes="80px"
          className="object-cover"
          priority
        />
      </div>
      <p className="mt-5 font-display text-[0.64rem] uppercase tracking-[0.18em] text-champagne/80">
        Contact Sultan
      </p>
      <h2 className="mt-2 text-xl font-semibold leading-tight text-mist-300">
        Campaign command center
      </h2>
      <button
        type="button"
        onClick={onSendMessage}
        className="mt-5 rounded-full border border-champagne/35 bg-champagne/12 px-4 py-2 font-display text-[0.6rem] uppercase tracking-[0.16em] text-champagne transition-colors hover:bg-champagne hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
      >
        Message
      </button>
    </div>
  );
}

function ContactSculpture({
  actions,
  onSendMessage,
}: {
  actions: OrbitActionItem[];
  onSendMessage: () => void;
}) {
  return (
    <div className="relative hidden min-h-[38rem] min-w-0 lg:block">
      <div className="orbit-stage absolute left-1/2 top-1/2 aspect-square w-[min(42rem,49vw)] -translate-x-[46%] -translate-y-1/2">
        <div className="absolute inset-[1.5%] rounded-full border border-champagne/16" />
        <div className="absolute inset-[9%] rounded-full border border-dashed border-champagne/24" />
        <div className="absolute inset-[23%] rounded-full border border-steel-400/18" />
        <div className="absolute inset-[35%] rounded-full border border-champagne/14" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(227,195,157,0.15),rgba(7,23,57,0.15)_34%,transparent_66%)]" />
        <span className="absolute left-1/2 top-1/2 h-px w-[42%] origin-left -rotate-12 bg-gradient-to-r from-champagne/24 to-transparent" aria-hidden />
        <span className="absolute left-1/2 top-1/2 h-px w-[35%] origin-left rotate-[142deg] bg-gradient-to-r from-steel-400/18 to-transparent" aria-hidden />

        <ContactCore onSendMessage={onSendMessage} />

        {actions.map((action) => (
          <OrbitNode key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}

function MobileContactCore() {
  return (
    <div className="rounded-[1.5rem] border border-champagne/25 bg-ink/76 p-5 text-center shadow-2xl shadow-navy-900/35 backdrop-blur-md">
      <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-champagne/45 bg-steel-900">
        <Image
          src="/sultan.jpeg"
          alt="Sultan Shadi portrait"
          fill
          sizes="80px"
          className="object-cover"
          priority
        />
      </div>
      <p className="mt-4 font-display text-[0.64rem] uppercase tracking-[0.18em] text-champagne/80">
        Contact Sultan
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-mist-300">
        Campaign command center
      </h2>
      <p className="mt-3 inline-flex items-center gap-2 text-sm text-haze/72">
        <MapPin className="h-3.5 w-3.5 text-champagne" aria-hidden />
        Amman / Jordan and Saudi markets
      </p>
    </div>
  );
}

export default function ContactCommandCenter() {
  const [formOpen, setFormOpen] = useState(false);
  const linkedInHref = profile.linkedin;

  const openForm = useCallback(() => setFormOpen(true), []);

  const mobileActions = useMemo<ContactActionItem[]>(() => {
    const actions: ContactActionItem[] = [
      {
        id: "email",
        label: "Email",
        icon: Mail,
        href: emailHref,
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        icon: MessageCircle,
        href: whatsappHref,
        external: true,
      },
      {
        id: "phone",
        label: "Phone",
        icon: Phone,
        href: `tel:${profile.phoneJordan}`,
      },
      {
        id: "send",
        label: "Message",
        icon: Send,
        onClick: openForm,
        emphasis: true,
      },
    ];

    if (linkedInHref) {
      actions.push({
        id: "linkedin",
        label: "LinkedIn",
        icon: Linkedin,
        href: linkedInHref,
        external: true,
      });
    }

    return actions;
  }, [linkedInHref, openForm]);

  const orbitActions = useMemo<OrbitActionItem[]>(() => {
    const outer = "clamp(11rem,16vw,15.25rem)";
    const inner = "clamp(9.5rem,13.2vw,12.5rem)";
    const actions: OrbitActionItem[] = [
      {
        id: "email",
        label: "Email",
        icon: Mail,
        href: emailHref,
        angle: 220,
        radius: outer,
        duration: "42s",
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        icon: MessageCircle,
        href: whatsappHref,
        external: true,
        angle: 318,
        radius: outer,
        duration: "48s",
      },
      {
        id: "phone",
        label: "Phone",
        icon: Phone,
        href: `tel:${profile.phoneJordan}`,
        angle: 145,
        radius: inner,
        duration: "52s",
      },
    ];

    if (linkedInHref) {
      actions.push({
        id: "linkedin",
        label: "LinkedIn",
        icon: Linkedin,
        href: linkedInHref,
        external: true,
        angle: 270,
        radius: inner,
        duration: "56s",
      });
    }

    actions.push({
      id: "send",
      label: "Message",
      icon: Send,
      onClick: openForm,
      emphasis: true,
      angle: 42,
      radius: inner,
      duration: "46s",
    });

    return actions;
  }, [linkedInHref, openForm]);

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-ink pt-24 text-mist-300 md:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,#000419_0%,#071739_48%,#18283c_100%)]"
      />
      <section className="shell relative flex min-h-[calc(100dvh-7rem)] items-center pb-20 pt-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(31rem,1fr)] xl:grid-cols-[minmax(0,0.72fr)_minmax(38rem,1fr)]">
          <div className="contact-copy min-w-0 max-w-3xl">
            <p className="contact-kicker eyebrow">Contact Sultan</p>
            <h1 className="mt-5 max-w-[9.5ch] font-display text-[clamp(2.25rem,12vw,4.25rem)] font-extrabold uppercase leading-[0.95] tracking-normal text-mist-300 lg:text-[clamp(3.5rem,5.6vw,6.25rem)]">
              <span className="contact-title-line block">Let&rsquo;s build</span>
              <span className="contact-title-line block">the next</span>
              <span className="contact-title-line block text-champagne">campaign</span>
            </h1>
            <span className="contact-live-line mt-6 block h-px w-48 origin-left bg-gradient-to-r from-champagne via-champagne/35 to-transparent" aria-hidden />
            <p className="contact-lede mt-7 max-w-2xl text-base leading-8 text-mist/82 md:text-lg md:leading-8">
              Reach Sultan directly for marketing strategy, healthcare campaigns,
              brand activations, and digital growth across Jordan and Saudi markets.
            </p>
            <p className="contact-meta mt-4 font-display text-[0.62rem] uppercase tracking-[0.18em] text-haze/65">
              Amman, Jordan / Jordan and Saudi markets
            </p>

            <div className="contact-actions mt-9 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openForm}
                className="btn-primary min-h-12 px-7"
              >
                Send a message
                <Send className="h-4 w-4" aria-hidden />
              </button>
              <a href={emailHref} className="btn-ghost min-h-12 px-7">
                Email Sultan
                <Mail className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>

          <ContactSculpture actions={orbitActions} onSendMessage={openForm} />

          <div className="lg:hidden">
            <MobileContactCore />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {mobileActions.slice(0, 4).map((action) => (
                <MobileAction key={action.id} action={action} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <FormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <style jsx global>{`
        @keyframes contact-copy-in {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes contact-soft-drift {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-5px);
          }
        }

        @keyframes contact-line-live {
          0%,
          100% {
            transform: scaleX(0.42);
            opacity: 0.42;
          }
          50% {
            transform: scaleX(1);
            opacity: 0.9;
          }
        }

        @keyframes contact-node-orbit {
          from {
            transform: rotate(var(--orbit-start));
          }
          to {
            transform: rotate(var(--orbit-end));
          }
        }

        @keyframes contact-node-counter {
          from {
            transform: rotate(var(--counter-start));
          }
          to {
            transform: rotate(var(--counter-end));
          }
        }

        @keyframes contact-modal-in {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes sending-rail {
          from {
            transform: translateX(-110%);
          }
          to {
            transform: translateX(310%);
          }
        }

        @keyframes step-pulse {
          0%,
          100% {
            opacity: 0.42;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.18);
          }
        }

        @keyframes step-line {
          0% {
            stroke-dashoffset: 32;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        .contact-kicker,
        .contact-title-line,
        .contact-live-line,
        .contact-lede,
        .contact-meta,
        .contact-actions {
          opacity: 0;
          animation: contact-copy-in 720ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .contact-kicker {
          animation-delay: 70ms;
        }

        .contact-title-line:nth-child(1) {
          animation-delay: 150ms;
        }

        .contact-title-line:nth-child(2) {
          animation-delay: 230ms;
        }

        .contact-title-line:nth-child(3) {
          animation-delay: 310ms;
        }

        .contact-live-line {
          animation:
            contact-copy-in 720ms cubic-bezier(0.16, 1, 0.3, 1) 380ms forwards,
            contact-line-live 6.5s ease-in-out 1.3s infinite;
        }

        .contact-lede {
          animation-delay: 470ms;
        }

        .contact-meta {
          animation-delay: 540ms;
        }

        .contact-actions {
          animation-delay: 610ms;
        }

        .contact-copy {
          animation: contact-soft-drift 8s ease-in-out 1.2s infinite alternate;
        }

        .orbit-node {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 20;
          height: 0;
          width: 0;
          transform: rotate(var(--orbit-start));
          animation: contact-node-orbit var(--orbit-duration) linear infinite;
        }

        .orbit-node-control {
          transform: translateX(var(--orbit-radius)) translate(-50%, -50%);
        }

        .orbit-node-face {
          transform: rotate(var(--counter-start));
          animation: contact-node-counter var(--orbit-duration) linear infinite;
        }

        .orbit-stage:hover .orbit-node,
        .orbit-stage:hover .orbit-node-face {
          animation-play-state: paused;
        }

        .contact-modal-panel {
          animation: contact-modal-in 260ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sending-rail {
          animation: sending-rail 1.55s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .step-visual {
          height: auto;
          width: 100%;
          fill: none;
          stroke: var(--champagne);
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 3;
        }

        .step-visual-pulse {
          fill: var(--champagne);
          stroke: none;
          transform-box: fill-box;
          transform-origin: center;
          animation: step-pulse 2.4s ease-in-out infinite;
        }

        .step-visual-line,
        .step-visual-check,
        .step-visual-orbit {
          stroke-dasharray: 32;
          animation: step-line 2.6s ease-in-out infinite alternate;
        }

        .step-visual-line-late {
          animation-delay: 300ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-kicker,
          .contact-title-line,
          .contact-live-line,
          .contact-lede,
          .contact-meta,
          .contact-actions,
          .contact-copy,
          .orbit-node,
          .orbit-node-face,
          .contact-modal-panel,
          .sending-rail,
          .step-visual-pulse,
          .step-visual-line,
          .step-visual-check,
          .step-visual-orbit {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .orbit-node {
            transform: rotate(var(--orbit-start)) !important;
          }

          .orbit-node-face {
            transform: rotate(var(--counter-start)) !important;
          }
        }
      `}</style>
    </main>
  );
}

"use client";

type ChatFabButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        d="M5 5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-8l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        d="M6 6l12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ChatFabButton({
  isOpen,
  onClick,
}: ChatFabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F54029] text-white shadow-[0_10px_24px_rgba(15,23,42,0.28)] transition-transform duration-200 hover:scale-105 hover:brightness-105"
    >
      {isOpen ? <CloseIcon /> : <ChatIcon />}
    </button>
  );
}

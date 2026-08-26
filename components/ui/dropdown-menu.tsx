import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
}

const DropdownContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ open: false, setOpen: () => {} });

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  asChild,
  children,
  className,
  ...props
}: {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  const { open, setOpen } = React.useContext(DropdownContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        setOpen(!open);
      },
    });
  }

  return (
    <button
      type="button"
      className={cn("inline-flex items-center justify-center", className)}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  align = "right",
  className,
  children,
}: {
  align?: "left" | "right" | "center";
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = React.useContext(DropdownContext);

  if (!open) return null;

  const alignStyles = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[240px] rounded-xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-100",
        alignStyles[align],
        className
      )}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  key?: React.Key;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
  disabled,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownContext);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onClick?.();
          setOpen(false);
        }
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 text-left",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-slate-200", className)} />;
}

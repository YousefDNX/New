import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { playClickSound } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "bg-gradient-primary text-primary-foreground shadow-glow hover:brightness-110",
        soft: "bg-accent text-accent-foreground hover:bg-accent/80",
        "pill-cyan":
          "rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 text-slate-950 font-semibold shadow-lg shadow-teal-500/25 border border-teal-300/40 hover:brightness-110 active:scale-[0.98]",
        "pill-pink":
          "rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-semibold shadow-lg shadow-rose-500/25 border border-rose-300/40 hover:brightness-110 active:scale-[0.98]",
        "pill-glass":
          "rounded-full bg-surface/75 backdrop-blur-md border border-border hover:bg-surface-2 text-foreground font-medium shadow-sm active:scale-[0.98]",
        "pill-outline":
          "rounded-full border border-primary/30 hover:bg-primary/10 text-foreground font-medium transition-all active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playClickSound();
      onClick?.(e);
    };
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

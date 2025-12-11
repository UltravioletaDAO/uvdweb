import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-ultraviolet text-white hover:bg-ultraviolet-light shadow-lg hover:shadow-ultraviolet/25",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-600/25",
        outline:
          "border border-white/20 bg-transparent hover:bg-white/10 hover:text-white text-gray-300 backdrop-blur-sm",
        secondary:
          "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/5",
        ghost: "hover:bg-white/10 hover:text-white text-gray-400",
        link: "text-ultraviolet underline-offset-4 hover:underline",
        glow: "bg-gradient-to-r from-ultraviolet to-cyan-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] border border-white/20 hover:brightness-110",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

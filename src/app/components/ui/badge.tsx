import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        destructive: "bg-destructive/10 text-destructive",
        outline: "border border-border text-muted-foreground",
        // Status badges - Subtle professional colors
        free: "bg-emerald-500/10 text-emerald-400",
        paid: "bg-amber-500/10 text-amber-400",
        checked: "bg-cyan-500/10 text-primary",
        registered: "bg-zinc-500/10 text-muted-foreground",
        // Role badges - Clean minimal
        admin: "bg-purple-500/10 text-purple-400",
        staff: "bg-blue-500/10 text-blue-400",
        dj: "bg-pink-500/10 text-pink-400",
        promoter: "bg-orange-500/10 text-orange-400",
        external: "bg-secondary/10 text-indigo-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

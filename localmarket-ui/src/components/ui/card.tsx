import * as React from "react";
import { cn } from "@/lib/utils";

// ======================
// CARD ROOT
// ======================
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm";
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex min-h-[220px] flex-col overflow-hidden rounded-3xl bg-card text-sm text-card-foreground ring-1 ring-border/50",

        "shadow-sm transition-all duration-300 hover:shadow-xl",

        // smaller card variant
        "data-[size=sm]:min-h-[180px]",

        className,
      )}
      {...props}
    />
  );
}

// ======================
// HEADER
// ======================
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex-shrink-0 px-4 pt-4",
        "group-data-[size=sm]/card:px-3",
        className,
      )}
      {...props}
    />
  );
}

// ======================
// TITLE
// ======================
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base font-medium leading-snug break-words",
        "group-data-[size=sm]/card:text-sm",
        className,
      )}
      {...props}
    />
  );
}

// ======================
// DESCRIPTION
// ======================
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground break-words", className)}
      {...props}
    />
  );
}

// ======================
// CONTENT
// ======================
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        // removed scroll + fixed behavior
        "flex-1 px-4 py-2",

        // allow long text wrapping
        "break-words",

        "group-data-[size=sm]/card:px-3",
        className,
      )}
      {...props}
    />
  );
}

// ======================
// FOOTER
// ======================
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex-shrink-0 border-t bg-muted/50 p-4",
        "group-data-[size=sm]/card:p-3",
        className,
      )}
      {...props}
    />
  );
}

// ======================
// EXPORTS
// ======================
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

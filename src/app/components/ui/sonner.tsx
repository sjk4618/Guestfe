"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ position = "top-center", ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--width": "400px",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          padding: "16px 20px",
          fontSize: "16px",
          minHeight: "60px",
          backgroundColor: "#f0f0f0",
          color: "#000000",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

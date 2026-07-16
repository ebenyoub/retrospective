import type React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  unstyled?: boolean;
  type?: "submit" | "reset" | "button" | undefined;
}

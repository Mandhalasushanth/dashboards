import React from "react";
import { PrimaryButton, PrimaryButtonProps } from "./PrimaryButton";
import { SecondaryButton, SecondaryButtonProps } from "./SecondaryButton";

export type ButtonVariant = "primary" | "secondary" | "orange";

export interface ButtonProps extends Omit<PrimaryButtonProps, "colorType"> {
  variant?: ButtonVariant;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  ...props
}) => {
  if (variant === "secondary") {
    return <SecondaryButton {...(props as SecondaryButtonProps)} />;
  }
  return (
    <PrimaryButton
      {...props}
      colorType={variant === "orange" ? "orange" : "primary"}
    />
  );
};

export default Button;

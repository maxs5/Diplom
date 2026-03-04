/**
 * Компонент кнопки
 *
 * Пропсы:
 * - variant: 'primary' | 'secondary' | 'ghost' | 'danger' - тип кнопки
 * - size: 'sm' | 'md' | 'lg' - размер кнопки
 * - fullWidth: boolean - во всю ширину контейнера
 * - children: текст/содержимое кнопки
 * - ...rest: остальные атрибуты button
 */

import React from "react";
import "./Button.css";

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...rest
}) {
  const buttonClass = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && "btn-full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClass} {...rest}>
      {children}
    </button>
  );
}

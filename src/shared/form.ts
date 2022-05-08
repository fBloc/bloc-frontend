import React from "react";

/** Event handler that exposes the target element's value as an inferred generic type. */
export function handleValueChange<T>(handler: (value: T) => void) {
  return (event: React.FormEvent<HTMLElement>) => handler((event.target as HTMLInputElement).value as unknown as T);
}

export function handleStringChange(handler: (value: string) => void) {
  return (event: React.FormEvent<HTMLElement>) => handler((event.target as HTMLInputElement).value);
}

export function handleBooleanChange(handler: (checked: boolean) => void) {
  return (event: React.FormEvent<HTMLElement>) => handler((event.target as HTMLInputElement).checked);
}

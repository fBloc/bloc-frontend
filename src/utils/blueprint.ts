/** Event handler that exposes the target element's value as a boolean. */
export function handleBooleanChange(handler: (checked: boolean) => void) {
  return (event: React.FormEvent<HTMLElement>) => handler((event.target as HTMLInputElement).checked);
}

/** Event handler that exposes the target element's value as a string. */
export function handleStringChange(handler: (value: string) => void) {
  return (event: React.FormEvent<HTMLElement>) => handler((event.target as HTMLInputElement).value);
}

/** Event handler that exposes the target element's value as an inferred generic type. */
export function handleValueChange<T>(handler: (value: T) => void) {
  return (event: React.FormEvent<HTMLElement>) => handler((event.target as HTMLInputElement).value as unknown as T);
}

/** Event handler that exposes the target element's value as a number. */
export function handleNumberChange(handler: (value: number) => void) {
  return handleStringChange((value) => handler(+value));
}

export function preventDefault(e: MouseEvent) {
  e.preventDefault();
}

export const stopPropagation: any = (e: MouseEvent) => {
  e.stopPropagation();
};

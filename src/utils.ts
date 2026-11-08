export function isDefined<T>(it: T | null | undefined): it is T {
  return it !== null && it !== undefined;
}

export function assertNotNull<T>(
  value: T | null | undefined,
  errorIfNull: string = 'Expected non null value',
): asserts value is T {
  if (!isDefined(value)) {
    throw new Error(errorIfNull);
  }
}

export function assertTruthy<T>(value: T | null | undefined, errorIfNull: string = 'Expected all value to be truthy') {
  if (!value) {
    throw new Error(errorIfNull);
  }
}

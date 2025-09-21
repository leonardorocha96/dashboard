export function createId(prefix: string): string {
  const random = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now().toString(36);
  return `${prefix}-${timestamp}-${random}`;
}

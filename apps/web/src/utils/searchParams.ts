export function getCurrentPage(searchParams: URLSearchParams): number {
  return Math.max(1, Math.trunc(Number(searchParams.get('page'))) || 1)
}

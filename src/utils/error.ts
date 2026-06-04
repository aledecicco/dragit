/**
 * Creates a user-friendly error message from an arbitrary error object.
 *
 * @param error - The error to analize.
 */
export const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'string' &&
    error === 'Could not fetch a valid release JSON from the remote'
  ) {
    return 'Failed to fetch updates'
  }

  return 'Something went wrong'
}

export type AppError =
  | {
      type: 'gitOperationFailed'
      gitError: GitError
    }
  | { type: 'repoWatcherFailed' }
  | { type: 'updateStorageFailed' }
  | { type: 'serializationFailed' }
  | { type: 'readFileFailed' }

export type GitError =
  | {
      type: 'startCommandFailed'
      command: string
      reason: string
    }
  | {
      type: 'commandFailed'
      command: string
      reason: string
    }
  | {
      type: 'getCommandOutputFailed'
      command: string
      reason: string
    }
  | {
      type: 'parseCommandOutputFailed'
      command: string
    }

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

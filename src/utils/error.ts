import { match, P } from 'ts-pattern'

import { gitOperationFailedToast } from '@/common/Toasts/GitOperationFailed'
import { toast } from '@/lib/Toasts/Toast'
import { getSettings } from '@/state/storage'

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

/**
 * Announces to the user an error resulting from an interaction.
 */
export const announceInteractionError = (
  description: string,
  error: AppError,
) => {
  const settings = getSettings()

  if (settings.showToasts) {
    match(error).with(
      { type: 'gitOperationFailed', gitError: P.select() },
      (e) => {
        toast(gitOperationFailedToast(description, e))
      },
    )
  }
}

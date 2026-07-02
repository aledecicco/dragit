import { match, P } from 'ts-pattern'

import { agentFailedToast } from '@/common/Toasts/AgentFailed'
import { gitOperationFailedToast } from '@/common/Toasts/GitOperationFailed'
import { toast } from '@/lib/Toasts/Toast'
import { getSettings } from '@/state/storage'

export type AppError =
  | {
      type: 'gitOperationFailed'
      gitError: GitError
    }
  | { type: 'agentFailed'; agentError: AgentError }
  | { type: 'repoWatcherFailed'; watcherError: RepoWatcherError }
  | { type: 'updateStorageFailed'; reason: string }
  | { type: 'serializationFailed' }
  | { type: 'readFileFailed'; reason: string }

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

export type AgentError =
  | {
      type: 'notConfigured'
      reason: string
    }
  | { type: 'keychainFailed'; reason: 'string' }
  | { type: 'requestFailed'; reason: 'string' }

export type RepoWatcherError =
  | {
      type: 'setupFailed'
    }
  | {
      type: 'repositoryNotWatched'
    }
  | {
      type: 'watchFolderFailed'
      path: string
    }
  | {
      type: 'unwatchFolderFailed'
      path: string
    }
  | {
      type: 'notADirectory'
      path: string
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
    match(error)
      .with({ type: 'gitOperationFailed', gitError: P.select() }, (e) => {
        toast(gitOperationFailedToast(description, e))
      })
      .with({ type: 'agentFailed', agentError: P.select() }, (e) => {
        toast(agentFailedToast(description, e))
      })
  }
}

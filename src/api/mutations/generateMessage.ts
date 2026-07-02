import { IconInputAi } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'

import type { Action } from '@/state/actions'

import { generatedCommitMessageQuery } from '../queries/generatedMessage'
import { pathMutationKey, useRepositoryMutation } from '../utils'

const generateMessageKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'generate_commit_message',
  }) as const

const generateMessageMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [generateMessageKey(repoPath)],
    mutationFn: (_, context) => {
      return context.client.fetchQuery(generatedCommitMessageQuery(repoPath))
    },
    networkMode: 'always',
  })

const useGenerateCommitMessage = (): Action => {
  const generateMessage = useRepositoryMutation(generateMessageMutation)

  return {
    id: {
      key: 'generate_message',
      operation: 'commit',
    },
    run: async () => {
      await generateMessage.mutateAsync()
    },
    label: {
      idle: 'Generate message',
      running: 'Generating message',
      success: 'Message generated',
      error: 'Failed to generate',
    },
    Glyph: IconInputAi,
  }
}

export { useGenerateCommitMessage, generateMessageKey, generateMessageMutation }

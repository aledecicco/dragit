import { useGenerateCommitMessage } from '@/api/mutations/generateMessage'
import { useSetAiApiKey } from '@/api/mutations/setAiApiKey'
import { interaction } from '@/lib/ActionButton/utils'

export const useGenerateCommitMessageInteraction = () => {
  const generateMessage = useGenerateCommitMessage()

  return interaction({
    action: generateMessage,
    details: 'generate commit message with AI',
  })
}

export const useSetAiApiKeyInteraction = () => {
  const setAiApiKey = useSetAiApiKey()

  return (key: string) =>
    interaction({
      action: setAiApiKey,
      argsRequester: () => key,
      details: 'save API key for AI agent',
    })
}

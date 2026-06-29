import { useCloneRepository } from '@/api/mutations/cloneRepository'
import { useInitRepository } from '@/api/mutations/initRepository'
import { requestRepositoryUrl } from '@/common/RepositoryUrlDialog'
import { interaction } from '@/lib/ActionButton/utils'

export const useInitRepositoryInteraction = () => {
  const initRepository = useInitRepository()
  return interaction({
    action: initRepository,
    details: 'initialize repository',
  })
}

export const useCloneRepositoryInteraction = () => {
  const cloneRepository = useCloneRepository()
  return interaction({
    action: cloneRepository,
    argsRequester: requestRepositoryUrl,
    details: 'clone repository',
  })
}

import { invoke } from '@tauri-apps/api/core'

import { pathMutationKey } from '.'
import { mutationOptions, useRepositoryMutation } from '../utils'

const checkoutLocalKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'checkoutLocal_local_branch',
  }) as const

const checkoutLocal = (path: string) =>
  mutationOptions({
    mutationKey: [checkoutLocalKey(path)],
    mutationFn: (args: { reference: string }) => {
      return invoke('checkoutLocal', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useCheckoutLocal = () => useRepositoryMutation(checkoutLocal)

export { useCheckoutLocal, checkoutLocalKey }

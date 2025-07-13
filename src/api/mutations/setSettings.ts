import { useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Settings } from '../models'
import { mutationOptions } from '../utils'

const setSettingsKey = ['set_settings'] as const

const setSettingsMutation = mutationOptions({
  mutationKey: setSettingsKey,
  mutationFn: (args: { settings: Settings }) => {
    return invoke('set_settings', args)
  },
  networkMode: 'always',
})

// TODO: action?
const useSetSettings = () => useMutation(setSettingsMutation)

export { useSetSettings, setSettingsKey }

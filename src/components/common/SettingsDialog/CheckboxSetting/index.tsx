import * as Ariakit from '@ariakit/react'

import type { Settings } from '@/api/models'
import { useSetSettings } from '@/api/mutations/setSettings'
import { triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/settings'
import { Checkbox, type CheckboxProps } from '@/ui/Form/Checkbox'

type BooleanSettingKey = {
  [K in keyof Settings]: Settings[K] extends boolean ? K : never
}[keyof Settings]

interface CheckboxSettingProps extends CheckboxProps {
  /**
   * The key of the setting this checkbox controls.
   */
  setting: BooleanSettingKey
}

/**
 * A single setting inside the settings dialog that can be toggled on or off.
 */
const CheckboxSetting = (props: CheckboxSettingProps) => {
  const { setting, ...checkboxProps } = props

  const settings = useSettings()
  const setSettings = useSetSettings()

  return (
    <Ariakit.CompositeItem
      render={
        <Checkbox
          {...checkboxProps}
          checked={settings[setting]}
          onChange={(e) => {
            triggerInteraction({
              action: setSettings,
              argsRequester: () => ({
                [setting]: e.target.checked,
              }),
            })
          }}
        />
      }
    />
  )
}

export { CheckboxSetting, type CheckboxSettingProps }

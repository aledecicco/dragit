import * as Ariakit from '@ariakit/react'

import { useSetSettingInteraction } from '@/interactions/storage'
import { triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/storage'
import { Checkbox, type CheckboxProps } from '@/ui/Form/Checkbox'

import type { BooleanSettingKey } from '../utils'

interface CheckboxSettingProps extends CheckboxProps {
  /**
   * The key of the setting this checkbox controls.
   */
  setting?: BooleanSettingKey
}

/**
 * A single setting inside the settings dialog that can be toggled on or off.
 */
const CheckboxSetting = (props: CheckboxSettingProps) => {
  const { setting, ...checkboxProps } = props

  const settings = useSettings()
  const setSettingInteraction = useSetSettingInteraction()

  return (
    <Ariakit.CompositeItem
      render={
        <Checkbox
          {...checkboxProps}
          checked={setting ? settings[setting] : checkboxProps.checked}
          onChange={(e) => {
            checkboxProps.onChange?.(e)

            if (setting) {
              triggerInteraction(
                setSettingInteraction(setting, e.target.checked),
              )
            }
          }}
        />
      }
    />
  )
}

export { CheckboxSetting, type CheckboxSettingProps }

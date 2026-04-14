import { type ComponentProps, useRef } from 'react'
import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'

import type { Settings } from '@/api/models'
import { useSetSettings } from '@/api/mutations/setSettings'
import { triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/settings'
import { EditableText } from '@/ui/EditableText'
import { cn, propsWithCn } from '@/utils/styles'

type StringSettingKey = {
  [K in keyof Settings]: Settings[K] extends string ? K : never
}[keyof Settings]

interface TextSettingProps extends ComponentProps<'div'> {
  /**
   * The label of the setting.
   */
  label: string

  /**
   * The key of the setting this text input controls.
   */
  setting: StringSettingKey

  /**
   * Content to display before the text input.
   */
  contentBefore?: React.ReactNode

  /**
   * Content to display after the text input.
   */
  contentAfter?: React.ReactNode
}

/**
 * A single setting inside the settings dialog that can be edited as text.
 */
const TextSetting = (props: TextSettingProps) => {
  const { label, setting, contentBefore, contentAfter, ...divProps } = props

  const settings = useSettings()
  const setSettings = useSetSettings()

  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <div
      {...propsWithCn(
        divProps,
        'flex flex-row gap-1.5 items-center p-2',
        'text-sm text-light-400',
        'hover:bg-light-950/5 data-focus-visible:bg-light-950/5',
        'hover:data-focus-visible:bg-light-950/10',
      )}
      onClickCapture={(e) => {
        divProps.onCanPlayCapture?.(e)

        buttonRef.current?.focus()
      }}
    >
      {contentBefore}
      <Ariakit.CompositeItem
        render={(props) => (
          <EditableText
            label={label}
            value={settings[setting]}
            setValue={(value) => {
              triggerInteraction({
                action: setSettings,
                argsRequester: () => ({ [setting]: value }),
              })
            }}
            className={cn('max-w-20 border border-dark-50 rounded-md')}
            buttonProps={{
              className: cn('max-w-20'),
              ...props,
              ref: mergeRefs([props.ref, buttonRef]),
            }}
          />
        )}
      />
      {contentAfter}
    </div>
  )
}

export { TextSetting, type TextSettingProps }

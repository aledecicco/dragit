import { type ComponentProps, type ReactNode, useRef } from 'react'
import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'

import { useSetSettings } from '@/api/mutations/setSettings'
import { triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/storage'
import { EditableText, type EditableTextProps } from '@/ui/EditableText'
import { cn, propsWithCn } from '@/utils/styles'

import type { StringSettingKey } from '../utils'

interface TextSettingProps extends Partial<EditableTextProps> {
  /**
   * The label of the setting.
   */
  label: string

  /**
   * The key of the setting this text input controls.
   */
  setting?: StringSettingKey

  /**
   * Content to display before the text input.
   */
  contentBefore?: ReactNode

  /**
   * Content to display after the text input.
   */
  contentAfter?: ReactNode

  /**
   * Extra props for the container.
   */
  divProps?: ComponentProps<'div'>
}

/**
 * A single setting inside the settings dialog that can be edited as text.
 */
const TextSetting = (props: TextSettingProps) => {
  const {
    label,
    setting,
    contentBefore,
    contentAfter,
    divProps,
    ...inputProps
  } = props

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
        divProps?.onClickCapture?.(e)

        buttonRef.current?.focus()
      }}
    >
      {contentBefore}
      <Ariakit.CompositeItem
        render={(props) => (
          <EditableText
            label={label}
            {...propsWithCn(
              inputProps,
              'max-w-20 border border-dark-50 rounded-md',
            )}
            value={setting ? settings[setting] : (inputProps.value ?? '')}
            setValue={(value) => {
              inputProps.setValue?.(value)

              if (setting && value) {
                triggerInteraction({
                  action: setSettings,
                  argsRequester: () => ({ [setting]: value }),
                })
              }
            }}
            buttonProps={{
              className: cn('max-w-20 border border-dark-50 rounded-md'),
              ...props,
              ...inputProps.buttonProps,
              ref: mergeRefs([
                props.ref,
                buttonRef,
                inputProps.buttonProps?.ref,
              ]),
            }}
          />
        )}
      />
      {contentAfter}
    </div>
  )
}

export { TextSetting, type TextSettingProps }

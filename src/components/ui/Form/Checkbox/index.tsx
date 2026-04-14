import { useId, useState } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconCheck, IconX } from '@tabler/icons-react'

import { Icon } from '@/ui/Icon'
import { cn, propsWithCn } from '@/utils/styles'

interface CheckboxProps extends Ariakit.CheckboxProps {
  /**
   * The description of what the checkbox represents.
   */
  label: string

  /**
   * Explanation of the checkbox that gives more context to the user.
   */
  description?: string
}

/**
 * Checkbox component.
 */
const Checkbox = (props: CheckboxProps) => {
  const isComposite = !!Ariakit.useCompositeContext()

  if (isComposite) {
    return <Ariakit.CompositeItem render={<CheckboxInner {...props} />} />
  }

  return <CheckboxInner {...props} />
}

const CheckboxInner = (props: CheckboxProps) => {
  const { label, description, ...checkboxProps } = props
  const checked = checkboxProps.checked ?? false

  const id = useId()
  const [focusVisible, setFocusVisible] = useState(false)

  return (
    <label
      className={cn(
        'group/checkbox relative',
        'flex gap-2 items-center cursor-pointer p-2',
        'hover:bg-light-950/5 data-focus-visible:bg-light-950/5',
        'hover:data-focus-visible:bg-light-950/10',
      )}
      htmlFor={id}
      data-checked={checked}
      data-focus-visible={focusVisible || undefined}
    >
      <Ariakit.VisuallyHidden>
        <Ariakit.Checkbox
          clickOnEnter
          {...propsWithCn(
            checkboxProps,
            'rounded-full border-gray-300 text-blue-600',
          )}
          id={id}
          onFocusVisible={(e) => {
            setFocusVisible(true)
            props.onFocusVisible?.(e)
          }}
          onBlur={(e) => {
            setFocusVisible(false)
            props.onBlur?.(e)
          }}
        />
      </Ariakit.VisuallyHidden>

      <div
        className={cn(
          'w-5 h-5 bg-dark-500 rounded-full',
          'flex items-center justify-center',
          checked && 'bg-primary-600',
          checked
            ? 'group-hover/checkbox:bg-primary-500 group-data-focus-visible/checkbox:bg-primary-500'
            : 'group-hover/checkbox:bg-dark-400 group-data-focus-visible/checkbox:bg-dark-400',
        )}
        data-checked={checked}
      >
        {checked ? (
          <Icon Glyph={IconCheck} className={cn('text-light-100')} />
        ) : (
          <Icon Glyph={IconX} className={cn('text-light-950')} />
        )}
      </div>

      <div className={cn('text-sm text-light-400')}>
        {label}

        {description && (
          <p className={cn('text-xs text-light-900')}>{description}</p>
        )}
      </div>
    </label>
  )
}

export { Checkbox, type CheckboxProps }

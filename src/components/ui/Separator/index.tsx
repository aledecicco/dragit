import * as Ariakit from '@ariakit/react'

import { cn, propsWithCn } from '@/utils/styles'

interface SeparatorProps extends Ariakit.SeparatorProps {
  /**
   * A label to show in the middle of the separator.
   */
  label?: string
}

/**
 * A visual horizontal separator.
 */
const Separator = (props: SeparatorProps) => {
  const { label, ...separatorProps } = props

  return label ? (
    <div
      {...propsWithCn(
        separatorProps,
        'grid grid-cols-[1fr_max-content_20fr] gap-x-2 items-center',
        'text-xs text-light-950',
      )}
    >
      <Ariakit.Separator className={cn('border-t border-light-600/20')} />
      {label}
      <Ariakit.Separator className={cn('border-t border-light-600/20')} />
    </div>
  ) : (
    <Ariakit.Separator
      {...propsWithCn(separatorProps, 'border-t border-light-600/20')}
    />
  )
}

export { Separator, type SeparatorProps }

import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { type LineType, ROW_HEIGHT } from '@/highlighting/utils'
import { propsWithCn } from '@/utils/styles'

interface LineIndicatorProps extends ComponentProps<'div'> {
  /**
   * The type of line being displayed.
   */
  type: LineType

  /**
   * Whether this cell should be empty.
   */
  empty?: boolean
}

/**
 * Displays an indicator of a line's type with the appropriate styling.
 */
const LineIndicator = (props: LineIndicatorProps) => {
  const { type, empty, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'flex flex-row justify-center font-mono',
        'w-4 py-1.25 font-bold',
        match(type)
          .with('added', () => 'bg-success-500/30 text-success-500')
          .with('removed', () => 'bg-danger-600/30 text-danger-600')
          .with('ours', () => 'bg-primary-500/30 text-primary-500')
          .with('theirs', () => 'bg-warning-600/30 text-warning-600')
          .with('unchanged', () => 'bg-dark-600 text-light-950')
          .exhaustive(),
      )}
      style={{ height: ROW_HEIGHT, ...divProps.style }}
    >
      {!empty &&
        match(type)
          .with('added', () => '+')
          .with('removed', () => '-')
          .with('ours', () => '<')
          .with('theirs', () => '>')
          .with('unchanged', () => ' ')
          .exhaustive()}
    </div>
  )
}

export { LineIndicator, type LineIndicatorProps }

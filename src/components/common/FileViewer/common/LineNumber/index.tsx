import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@/utils/styles'

import type { LineType } from '../../utils'

interface LineNumberProps extends ComponentProps<'div'> {
  /**
   * The line number to display.
   */
  lineNumber: number | undefined

  /**
   * The type of the line being displayed.
   */
  type: LineType

  /**
   * Whether to display the number in a faded style.
   */
  faded?: boolean
}

/**
 * Displays a single line number with the appropriate styling based on its type.
 */
const LineNumber = (props: LineNumberProps) => {
  const { lineNumber, type, faded, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'h-6.5 flex flex-row font-mono',
        'text-xs w-15 px-1 py-1.75 overflow-hidden',
        match(type)
          .with('added', () => [
            'bg-success-500/30',
            faded ? 'text-success-700/70' : 'text-success-500',
          ])
          .with('removed', () => [
            'bg-danger-600/30',
            faded ? 'text-danger-800/70' : 'text-danger-600',
          ])
          .with('ours', () => [
            'bg-primary-500/30',
            faded ? 'text-primary-700/70' : 'text-primary-500',
          ])
          .with('theirs', () => [
            'bg-warning-600/30',
            faded ? 'text-warning-800/70' : 'text-warning-600',
          ])
          .with('unchanged', () => [
            'bg-dark-600',
            faded ? 'text-light-950/30' : 'text-light-950',
          ])
          .exhaustive(),
      )}
    >
      {lineNumber}
    </div>
  )
}

export { LineNumber, type LineNumberProps }

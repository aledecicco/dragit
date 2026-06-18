import type { ComponentProps, ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'
import {
  IconAlertHexagonFilled,
  IconCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react'
import { toast as sonnerToast } from 'sonner'
import { match } from 'ts-pattern'

import { DecoratedButton } from '@/lib/DecoratedButton'
import { getSettings } from '@/state/storage'
import { Icon } from '@/ui/Icon'
import { cn, propsWithCn } from '@/utils/styles'
import type { Status } from '@/utils/types'

interface ToastProps extends Omit<ComponentProps<'div'>, 'id'> {
  /**
   * The unique identifier of the toast.
   */
  id: string | number

  /**
   * The title of the toast.
   */
  title: string

  /**
   * The content of the toast.
   */
  description: ReactNode

  /**
   * The type of toast.
   */
  status: Status
}

type ToastArgs = Omit<ToastProps, 'id'>

/**
 * The base toast item.
 */
const Toast = (props: ToastProps) => {
  const { id, title, description, status, ...divProps } = props

  return (
    <Ariakit.Focusable
      onClick={(e) => {
        if (
          e.target instanceof Element &&
          e.target.closest('.prevent-toast-action')
        ) {
          return
        }

        sonnerToast.dismiss(id)
      }}
      render={
        <div
          {...propsWithCn(
            divProps,
            'flex flex-col p-4 gap-3 rounded-md shadow-md w-max max-w-130',
            'border-2 border-dark-50 bg-dark-300',
            '[&:hover:not(:has(.prevent-toast-action:hover))]:bg-dark-200',
            '[&:hover:not(:has(.prevent-toast-action:hover))]:cursor-pointer',
          )}
        >
          <div
            className={cn(
              'grid grid-cols-[max-content_1fr_max-content] items-center gap-1',
              match(status)
                .with('neutral', () => 'text-light-600')
                .with('primary', () => 'text-primary-200/90')
                .with('success', () => 'text-success-200/90')
                .with('warning', () => 'text-warning-200/90')
                .with('danger', () => 'text-danger-200/90')
                .exhaustive(),
            )}
          >
            <Icon
              size="lg"
              Glyph={match(status)
                .with('neutral', () => IconInfoCircle)
                .with('primary', () => IconInfoCircle)
                .with('success', () => IconCheck)
                .with('warning', () => IconAlertHexagonFilled)
                .with('danger', () => IconAlertHexagonFilled)
                .exhaustive()}
            />
            <h3 className="text-md font-semibold">{title}</h3>
            <DecoratedButton
              onClick={() => {
                sonnerToast.dismiss(id)
              }}
              round
              compact
              variant="plain"
              status="neutral"
              size="sm"
              className={cn(
                'prevent-toast-action',
                'text-lg text-light-950',
                '-mt-4 -mr-2',
              )}
              label="Dismiss"
              Glyph={IconX}
            />
          </div>

          <div className={cn('prevent-toast-action', 'text-sm text-light-800')}>
            {description}
          </div>
        </div>
      }
    />
  )
}

/**
 * Show a toast with the given params, if the user has enabled toasts in the settings.
 */
const toast = (props: ToastArgs) => {
  const settings = getSettings()

  if (settings.showToasts) {
    sonnerToast.custom((id) => <Toast id={id} {...props} />)
  }
}

export { toast, type ToastArgs }

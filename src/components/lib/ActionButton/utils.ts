import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconLoader2,
} from '@tabler/icons-react'
import { useMemo, useRef, useState } from 'react'
import { match } from 'ts-pattern'

import type { ButtonStatus } from '@ui/Button'
import type { Glyph } from '@ui/Icon'
import { MS_IN_SECOND } from '@utils/time'

interface ActionDescription {
  Glyph: Glyph
  label: string | { [T in ActionState]: string }
}

interface Action extends ActionDescription {
  run: () => Promise<unknown>
}

type ActionState = 'idle' | 'running' | 'success' | 'error'

interface ActionTracker {
  Glyph: Glyph
  label: string
  buttonStatus: ButtonStatus
  actionState: ActionState
  trackAction: (promise: Promise<unknown>, action: ActionDescription) => void
}

const useActionTracker = (
  mainAction: ActionDescription,
  defaultStatus: ButtonStatus,
): ActionTracker => {
  const [activeAction, setActiveAction] =
    useState<ActionDescription>(mainAction)
  const [actionState, setActionState] = useState<ActionState>('idle')
  const timeoutId = useRef<number>(null)

  const Glyph = useMemo(() => {
    return match(actionState)
      .returnType<Glyph>()
      .with('idle', () => activeAction.Glyph)
      .with('running', () => IconLoader2)
      .with('success', () => IconCircleCheckFilled)
      .with('error', () => IconAlertTriangleFilled)
      .exhaustive()
  }, [actionState, activeAction.Glyph])

  const label = useMemo(() => {
    const label = activeAction.label

    if (typeof label === 'string') {
      return label
    }

    return match(actionState)
      .returnType<string>()
      .with('idle', () => label.idle)
      .with('running', () => label.running)
      .with('success', () => label.success)
      .with('error', () => label.error)
      .exhaustive()
  }, [actionState, activeAction.label])

  const buttonStatus = useMemo(() => {
    return match(actionState)
      .returnType<ButtonStatus>()
      .with('idle', () => defaultStatus)
      .with('running', () => defaultStatus)
      .with('success', () => 'success')
      .with('error', () => 'error')
      .exhaustive()
  }, [actionState, defaultStatus])

  const trackAction = (
    promise: Promise<unknown>,
    action: ActionDescription,
  ) => {
    if (actionState !== 'running') {
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current)
      }

      setActiveAction(action)
      setActionState('running')
      promise
        .then(() => {
          setActionState('success')
        })
        .catch(() => {
          setActionState('error')
        })
        .finally(() => {
          timeoutId.current = setTimeout(() => {
            setActionState('idle')
            setActiveAction(mainAction)
          }, MS_IN_SECOND * 2)
        })
    }
  }

  return { Glyph, label, buttonStatus, actionState, trackAction }
}

export {
  useActionTracker,
  type Action,
  type ActionState,
  type ActionDescription,
  type ActionTracker,
}

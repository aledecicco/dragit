import { useEffect, useRef } from 'react'
import { type AnimationParams, animate, easings } from 'animejs'

import type { ActionStatus } from '@/state/actions'

export const DISAPPEAR_ANIMATION: AnimationParams = {
  opacity: [1, 0],
  translateY: [0, 10],
  duration: 200,
  ease: 'outSine',
}

export const APPEAR_ANIMATION: AnimationParams = {
  opacity: [0, 1],
  translateY: [-10, 0],
  duration: 200,
  ease: 'outSine',
}

export const FADE_IN_ANIMATION: AnimationParams = {
  opacity: 1,
  duration: 200,
  ease: 'outSine',
}

export const SPINNER_ANIMATION: AnimationParams = {
  rotate: [0, 360],
  duration: 900,
  loop: true,
  ease: easings.cubicBezier(0.7, 0.1, 0.5, 0.9),
  loopDelay: 0,
}

/**
 * Utility to animate a spinner icon to spin while an action is in progress.
 * Animates the component that is attached to the returned ref.
 */
export const useAnimateSpinner = (status: ActionStatus) => {
  const iconRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (iconRef.current && status === 'running') {
      animate(iconRef.current, SPINNER_ANIMATION)
    }
  }, [status])

  return iconRef
}

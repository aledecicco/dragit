import type { ComponentProps } from 'react'

import { Separator } from '@/ui/Separator'
import { cn, propsWithCn } from '@/utils/styles'

interface SettingsDialogSectionProps extends ComponentProps<'section'> {
  /**
   * The label of the section.
   */
  label: string
}

/**
 * A single labeled section inside the settings dialog.
 */
const SettingsDialogSection = (props: SettingsDialogSectionProps) => {
  const { label, ...sectionProps } = props

  return (
    <>
      <Separator label={label} className={cn('mb-2 not-first:mt-6')} />

      <section
        {...propsWithCn(sectionProps, 'grid auto-rows-fr')}
        aria-label={`${label}-related settings`}
      />
    </>
  )
}

export { SettingsDialogSection, type SettingsDialogSectionProps }

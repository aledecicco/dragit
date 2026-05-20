import type { ReactNode } from 'react'

import type { ConflictType, FileConflicts } from '@/api/models'
import { cn } from '@/utils/styles'

import { LineIndicator } from '../../common/LineIndicator'
import { LineNumber } from '../../common/LineNumber'

/**
 * Generates the line indicators for a given file conflict.
 *
 * Adds empty indicators when switching between conflict sections.
 */
export const getLineIndicators = (content: FileConflicts): ReactNode => {
  const res: ReactNode[] = []
  let sectionType: ConflictType = 'unchanged'

  content.forEach((line, i) => {
    if (sectionType !== line.type && line.type !== 'unchanged') {
      res.push(
        <LineIndicator
          key={`indicator-${i + 1}`}
          type={line.type}
          className="h-4.5"
          empty
        />,
      )
    }

    res.push(<LineIndicator key={`${i + 1}`} type={line.type} />)
    sectionType = line.type
  })

  res.push(
    <LineIndicator
      key={`${content.length + 1}`}
      type="unchanged"
      className={cn('grow')}
      empty
    />,
  )

  return res
}

/**
 * Generates the line numbers for a given file conflict.
 *
 * Adds empty cells when switching between conflict sections.
 */
export const getLineNumbers = (content: FileConflicts): ReactNode => {
  const res: ReactNode[] = []

  let sectionType: ConflictType = 'unchanged'

  content.forEach((line, i) => {
    if (sectionType !== line.type && line.type !== 'unchanged') {
      res.push(
        <LineNumber
          key={`indicator-${i + 1}`}
          type={line.type}
          className="h-4.5"
          lineNumber={undefined}
        />,
      )
    }

    res.push(
      <LineNumber key={`${i + 1}`} type={line.type} lineNumber={i + 1} />,
    )
    sectionType = line.type
  })

  res.push(
    <LineNumber
      key={`${content.length + 1}`}
      type="unchanged"
      className={cn('grow rounded-bl-sm')}
      lineNumber={content.length + 1}
      faded
    />,
  )

  return res
}

import { IconArchive, IconFiles } from '@tabler/icons-react'

import { ColumnRail, type ColumnRailProps } from '..'

interface LeftColumnRailProps extends Partial<ColumnRailProps> {}

/**
 * The rail indicator of the left column.
 */
const LeftColumnRail = (props: LeftColumnRailProps) => {
  const { ...railProps } = props

  return (
    <ColumnRail
      column="left"
      contents={{
        label: 'changes and stashes',
        glyphs: [IconFiles, IconArchive],
      }}
      acceptedTypes={[
        'not-staged-files',
        'staged-files',
        'worktree',
        'index',
        'stash',
      ]}
      {...railProps}
    />
  )
}

export { LeftColumnRail, type LeftColumnRailProps }

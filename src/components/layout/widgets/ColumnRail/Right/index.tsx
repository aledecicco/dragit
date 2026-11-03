import { IconGitBranch, IconTrash } from '@tabler/icons-react'


import { ColumnRail,type ColumnRailProps } from '..'

interface RightColumnRailProps extends Partial<ColumnRailProps> {}

/**
 * The rail indicator of the right column.
 */
const RightColumnRail = (props: RightColumnRailProps) => {
  const { ...railProps } = props

  return (
    <ColumnRail
      column="right"
      contents={{
        label: 'branches',
        glyphs: [IconGitBranch],
      }}
      whileDragging={{
        label: 'branches and recycling bin',
        glyphs: [IconGitBranch, IconTrash],
      }}
      acceptedTypes={[
        'branch',
        'branches',
        'tag',
        'tags',
        'commit',
        'stash',
        'stashes',
        'not-staged-files',
        'staged-files',
        'worktree',
        'index',
      ]}
      {...railProps}
    />
  )
}

export { RightColumnRail, type RightColumnRailProps }

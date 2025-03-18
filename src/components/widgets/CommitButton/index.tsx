import { IconMessageCheck } from '@tabler/icons-react'

import { useCommitIndex } from '@api/commands'
import { showCommitDialog } from '@lib/CommitDialog'
import { Button, type ButtonProps } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { propsWithCn } from '@utils/styles'
import { useStagedFiles } from '@widgets/FileStatuses/utils'

interface CommitButtonProps extends Partial<ButtonProps> {}

const CommitButton = (props: CommitButtonProps) => {
  const { ...buttonProps } = props

  const staged = useStagedFiles()
  const commit = useCommitIndex()

  return (
    <Button
      variant="primary"
      size="md"
      aria-label="Commit current staged changes"
      {...propsWithCn(buttonProps, 'w-full')}
      disabled={!staged?.length || commit.isPending || buttonProps.disabled}
      onClick={async (e) => {
        showCommitDialog()
        buttonProps.onClick?.(e)
      }}
    >
      <Icon size="lg" Glyph={IconMessageCheck} />
      {commit.isPending ? 'Committing' : 'Commit'}
    </Button>
  )
}

export { CommitButton, type CommitButtonProps }

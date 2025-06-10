import type { ComponentProps } from 'react'

import type { BranchInfo } from '@api/models'
import { useCheckout } from '@api/mutations'
import { useQueryBranches } from '@api/queries'
import { QueryList } from '@lib/QueryList'
import { IconLocationFilled } from '@tabler/icons-react'
import { Accordion } from '@ui/Accordion'
import { AccordionSection } from '@ui/Accordion/Section'
import { Chip } from '@ui/Chip'
import { propsWithCn } from '@utils/styles'
import { idFn, mapFn } from '@utils/types'
import { BranchesListItem } from './Item'

interface BranchesListProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the list of branches in the current repository.
 */
const BranchesList = (props: BranchesListProps) => {
  const { ...divProps } = props
  const branchesQuery = useQueryBranches()
  const checkout = useCheckout()

  return (
    <Accordion {...propsWithCn(divProps, 'overflow-hidden')}>
      <AccordionSection
        defaultOpen
        label="All branches"
        extraInfo={mapFn(branchesQuery.data, (branches) => (
          <Chip size="sm">{branches.length}</Chip>
        ))}
      >
        <QueryList
          name="branches"
          query={branchesQuery}
          getItems={idFn}
          renderItem={(branch: BranchInfo) => (
            <BranchesListItem
              branch={branch}
              contextMenuItems={[
                {
                  label: 'Checkout',
                  Glyph: IconLocationFilled,
                  onClick: () => {
                    checkout.mutateAsync({ reference: branch.name })
                  },
                },
              ]}
            />
          )}
          size="sm"
          itemSize={74}
          options={mapFn(branchesQuery.data, (branches) => ({
            getItemKey: (index: number) => branches[index].name,
          }))}
        />
      </AccordionSection>
    </Accordion>
  )
}

export { BranchesList, type BranchesListProps }

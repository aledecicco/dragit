import type { ComponentProps } from 'react'

import { useQueryBranches } from '@api/queries'
import { QueryList } from '@lib/QueryList'
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

  const virtualizerOptions = mapFn(branchesQuery.data, (branches) => ({
    getItemKey: (index: number) => branches[index].name,
  }))

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
          query={branchesQuery}
          getItems={idFn}
          name="branches"
          size="sm"
          itemSize={74}
          RenderItem={BranchesListItem}
          options={virtualizerOptions}
        />
      </AccordionSection>
    </Accordion>
  )
}

export { BranchesList, type BranchesListProps }

import { Store, useStore } from '@tanstack/react-store'
import { useEffect, useMemo } from 'react'

import type { Reference } from '@api/models'
import { useBranch, useCurrentRef } from '@utils/repository'

interface SelectedRefs {
  reference: Reference | undefined
  baseReference: Reference | undefined
}

const selectedRefs = new Store<SelectedRefs>({
  reference: undefined,
  baseReference: undefined,
})

const useSelectedRefs = () => useStore(selectedRefs)

const changeBaseRef = (baseReference: Reference | undefined) => {
  selectedRefs.setState((state) => ({
    ...state,
    baseReference,
  }))
}

const useReferencesSync = () => {
  const currentRef = useCurrentRef()

  useEffect(() => {
    selectedRefs.setState((oldReferencees) => ({
      reference: currentRef,
      baseReference:
        oldReferencees.baseReference &&
        oldReferencees.baseReference.refName === currentRef?.refName
          ? oldReferencees.reference
          : oldReferencees.baseReference,
    }))
  }, [currentRef])
}

export { useSelectedRefs, changeBaseRef, useReferencesSync, type SelectedRefs }

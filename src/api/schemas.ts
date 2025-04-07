import { BorshSchema } from 'borsher'

import type { FileType, FileTypes } from './models'

export const PAGE_SCHEMA = <T>(ITEM_SCHEMA: BorshSchema<T>) =>
  BorshSchema.Struct({
    items: BorshSchema.Vec(ITEM_SCHEMA),
    hasNext: BorshSchema.bool,
  })

export const CURRENT_DIR_INFO_SCHEMA = BorshSchema.Option(
  BorshSchema.Struct({
    path: BorshSchema.String,
    isRepository: BorshSchema.bool,
    exists: BorshSchema.bool,
  }),
)

export const COMMIT_INFO_SCHEMA = BorshSchema.Struct({
  hash: BorshSchema.String,
  shortHash: BorshSchema.String,
  authorName: BorshSchema.String,
  authorEmail: BorshSchema.String,
  timestamp: BorshSchema.u64,
  message: BorshSchema.Option(BorshSchema.String),
})

export const ANCESTOR_INFO_SCHEMA = BorshSchema.Struct({
  distance: BorshSchema.u64,
  hash: BorshSchema.String,
})

export const COMMON_ANCESTOR_INFO_SCHEMA = BorshSchema.Struct({
  lastCommit: BorshSchema.Option(ANCESTOR_INFO_SCHEMA),
  commonCommit: ANCESTOR_INFO_SCHEMA,
})

export const BRANCH_DIVERGENCE_SCHEMA = BorshSchema.Struct({
  ahead: BorshSchema.u64,
  behind: BorshSchema.u64,
})

export const HISTORY_ITEM_SCHEMA = BorshSchema.Struct({
  hash: BorshSchema.String,
  otherParents: BorshSchema.Vec(BorshSchema.String),
})
export const HISTORY_PAGE_SCHEMA = PAGE_SCHEMA(HISTORY_ITEM_SCHEMA)

export const HEAD_INFO_SCHEMA = BorshSchema.Enum({
  Detached: BorshSchema.Struct({
    commit: BorshSchema.String,
  }),
  Branch: BorshSchema.Struct({
    name: BorshSchema.String,
  }),
})

export const BRANCH_INFO_SCHEMA = BorshSchema.Struct({
  name: BorshSchema.String,
  timestamp: BorshSchema.u64,
  type: BorshSchema.Enum({
    Local: BorshSchema.Struct({
      remote: BorshSchema.Option(
        BorshSchema.Struct({
          remoteName: BorshSchema.String,
          branchName: BorshSchema.String,
        }),
      ),
    }),
    Remote: BorshSchema.Unit,
  }),
})
export const BRANCHES_SCHEMA = BorshSchema.Vec(BRANCH_INFO_SCHEMA)

export const CHANGE_STATUS_SCHEMA = BorshSchema.Enum({
  Modified: BorshSchema.Unit,
  TypeChanged: BorshSchema.Unit,
  Added: BorshSchema.Unit,
  Deleted: BorshSchema.Unit,
})

export const MOVED_STATUS_SCHEMA = BorshSchema.Enum({
  Renamed: BorshSchema.Unit,
  Copied: BorshSchema.Unit,
})

export const MERGE_STATUS_SCHEMA = BorshSchema.Enum({
  BothAdded: BorshSchema.Unit,
  BothDeleted: BorshSchema.Unit,
  BothModified: BorshSchema.Unit,
  AddedByUs: BorshSchema.Unit,
  DeletedByUs: BorshSchema.Unit,
  AddedByThem: BorshSchema.Unit,
  DeletedByThem: BorshSchema.Unit,
})

export const STAGED_FILE_INFO_SCHEMA = BorshSchema.Struct({
  path: BorshSchema.String,
  status: BorshSchema.Enum({
    Changed: BorshSchema.Struct({
      changes: CHANGE_STATUS_SCHEMA,
    }),
    Moved: BorshSchema.Struct({
      changes: MOVED_STATUS_SCHEMA,
      old_path: BorshSchema.String,
    }),
  }),
})
export const STAGED_FILE_PAGE_SCHEMA = PAGE_SCHEMA(STAGED_FILE_INFO_SCHEMA)

export const UNSTAGED_FILE_INFO_SCHEMA = BorshSchema.Struct({
  path: BorshSchema.String,
  changes: CHANGE_STATUS_SCHEMA,
})
export const UNSTAGED_FILE_PAGE_SCHEMA = PAGE_SCHEMA(UNSTAGED_FILE_INFO_SCHEMA)

export const UNMERGED_FILE_INFO_SCHEMA = BorshSchema.Struct({
  path: BorshSchema.String,
  status: MERGE_STATUS_SCHEMA,
})
export const UNMERGED_FILE_PAGE_SCHEMA = PAGE_SCHEMA(UNMERGED_FILE_INFO_SCHEMA)

export const UNTRACKED_FILE_INFO_SCHEMA = BorshSchema.Struct({
  path: BorshSchema.String,
})
export const UNTRACKED_FILE_PAGE_SCHEMA = PAGE_SCHEMA(
  UNTRACKED_FILE_INFO_SCHEMA,
)

export const FILE_INFO_SCHEMAS: {
  [P in FileType]: BorshSchema<FileTypes[P]>
} = {
  staged: STAGED_FILE_INFO_SCHEMA,
  unstaged: UNSTAGED_FILE_INFO_SCHEMA,
  unmerged: UNMERGED_FILE_INFO_SCHEMA,
  untracked: UNTRACKED_FILE_INFO_SCHEMA,
}

export const REMOTE_INFO_SCHEMA = BorshSchema.Struct({
  name: BorshSchema.String,
  fetchUrl: BorshSchema.String,
  pushUrl: BorshSchema.String,
})
export const REMOTES_SCHEMA = BorshSchema.Vec(REMOTE_INFO_SCHEMA)

export const DIFF_SUMMARY_SCHEMA = BorshSchema.Struct({
  filesCount: BorshSchema.u64,
  insertions: BorshSchema.u64,
  deletions: BorshSchema.u64,
})

export const STASH_INFO_SCHEMA = BorshSchema.Struct({
  name: BorshSchema.String,
  message: BorshSchema.Option(BorshSchema.String),
  timestamp: BorshSchema.u64,
  created_on: BorshSchema.String,
  changes: BorshSchema.Option(DIFF_SUMMARY_SCHEMA),
})
export const STASHES_SCHEMA = BorshSchema.Vec(STASH_INFO_SCHEMA)

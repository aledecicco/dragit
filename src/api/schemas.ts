import { BorshSchema } from 'borsher'

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

export const DIFF_SUMMARY_SCHEMA = BorshSchema.Struct({
  filesCount: BorshSchema.u32,
  insertions: BorshSchema.u32,
  deletions: BorshSchema.u32,
})

export const COMMIT_INFO_SCHEMA = BorshSchema.Struct({
  id: BorshSchema.String,
  shortHash: BorshSchema.String,
  authorName: BorshSchema.String,
  authorEmail: BorshSchema.String,
  timestamp: BorshSchema.u32,
  message: BorshSchema.Option(BorshSchema.String),
  changes: BorshSchema.Option(DIFF_SUMMARY_SCHEMA),
  parents: BorshSchema.Vec(BorshSchema.String),
})

export const ANCESTOR_INFO_SCHEMA = BorshSchema.Struct({
  hash: BorshSchema.String,
  distance: BorshSchema.u32,
})
export const COMMON_ANCESTOR_INFO_SCHEMA = BorshSchema.Option(
  BorshSchema.Struct({
    lastCommit: BorshSchema.Option(ANCESTOR_INFO_SCHEMA),
    commonCommit: ANCESTOR_INFO_SCHEMA,
  }),
)

export const BRANCH_DIVERGENCE_SCHEMA = BorshSchema.Struct({
  ahead: BorshSchema.u32,
  behind: BorshSchema.u32,
})

export const HISTORY_ITEM_SCHEMA = BorshSchema.Struct({
  hash: BorshSchema.String,
  otherParents: BorshSchema.Vec(BorshSchema.String),
})
export const HISTORY_PAGE_SCHEMA = PAGE_SCHEMA(HISTORY_ITEM_SCHEMA)

export const MATCHING_COMMITS_SCHEMA = BorshSchema.Vec(BorshSchema.String)

export const HEAD_STATE_SCHEMA = BorshSchema.Enum({
  Detached: BorshSchema.Struct({
    commit: BorshSchema.String,
  }),
  Branch: BorshSchema.Struct({
    name: BorshSchema.String,
  }),
})

export const WORKTREE_STATUS_SCHEMA = BorshSchema.Enum({
  Clean: BorshSchema.Unit,
  Merging: BorshSchema.Unit,
  Rebasing: BorshSchema.Unit,
  CherryPicking: BorshSchema.Unit,
  Reverting: BorshSchema.Unit,
})

export const HEAD_INFO_SCHEMA = BorshSchema.Struct({
  state: HEAD_STATE_SCHEMA,
  worktreeStatus: WORKTREE_STATUS_SCHEMA,
})

export const BRANCH_INFO_SCHEMA = BorshSchema.Enum({
  Remote: BorshSchema.Struct({
    name: BorshSchema.String,
    timestamp: BorshSchema.u32,
  }),
  Local: BorshSchema.Struct({
    name: BorshSchema.String,
    timestamp: BorshSchema.u32,
    upstream: BorshSchema.Option(
      BorshSchema.Struct({
        remote: BorshSchema.String,
        remoteBranch: BorshSchema.String,
      }),
    ),
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
      oldPath: BorshSchema.String,
    }),
  }),
})

export const UNSTAGED_FILE_INFO_SCHEMA = BorshSchema.Struct({
  path: BorshSchema.String,
  status: CHANGE_STATUS_SCHEMA,
})

export const UNMERGED_FILE_INFO_SCHEMA = BorshSchema.Struct({
  path: BorshSchema.String,
  status: MERGE_STATUS_SCHEMA,
})

export const UNTRACKED_FILE_INFO_SCHEMA = BorshSchema.Struct({
  path: BorshSchema.String,
})

export const WORKTREE_FILE_INFO_SCHEMA = BorshSchema.Enum({
  Staged: STAGED_FILE_INFO_SCHEMA,
  Unstaged: UNSTAGED_FILE_INFO_SCHEMA,
  Unmerged: UNMERGED_FILE_INFO_SCHEMA,
  Untracked: UNTRACKED_FILE_INFO_SCHEMA,
})
export const WORKTREE_FILES_PAGE_SCHEMA = PAGE_SCHEMA(WORKTREE_FILE_INFO_SCHEMA)

export const VERSIONED_FILE_INFO_SCHEMA = BorshSchema.Struct({
  path: BorshSchema.String,
  status: BorshSchema.Enum({
    Changed: BorshSchema.Struct({
      changes: CHANGE_STATUS_SCHEMA,
    }),
    Moved: BorshSchema.Struct({
      changes: MOVED_STATUS_SCHEMA,
      oldPath: BorshSchema.String,
    }),
  }),
})
export const VERSIONED_FILES_PAGE_SCHEMA = PAGE_SCHEMA(
  VERSIONED_FILE_INFO_SCHEMA,
)

export const REMOTE_INFO_SCHEMA = BorshSchema.Struct({
  name: BorshSchema.String,
  fetchUrl: BorshSchema.String,
  pushUrl: BorshSchema.String,
})
export const REMOTES_SCHEMA = BorshSchema.Vec(REMOTE_INFO_SCHEMA)

export const STASH_INFO_SCHEMA = BorshSchema.Struct({
  id: BorshSchema.String,
  stashNumber: BorshSchema.String,
  message: BorshSchema.Option(BorshSchema.String),
  timestamp: BorshSchema.u32,
  createdOn: BorshSchema.String,
  changes: BorshSchema.Option(DIFF_SUMMARY_SCHEMA),
})
export const STASHES_SCHEMA = BorshSchema.Vec(STASH_INFO_SCHEMA)

export const TAG_INFO_SCHEMA = BorshSchema.Struct({
  name: BorshSchema.String,
  reference: BorshSchema.String,
  timestamp: BorshSchema.u32,
  message: BorshSchema.Option(BorshSchema.String),
  authorName: BorshSchema.Option(BorshSchema.String),
  authorEmail: BorshSchema.Option(BorshSchema.String),
})
export const TAGS_SCHEMA = BorshSchema.Vec(TAG_INFO_SCHEMA)

export const FILE_DIFF_SCHEMA = BorshSchema.Vec(
  BorshSchema.Enum({
    Added: BorshSchema.Vec(BorshSchema.String),
    Removed: BorshSchema.Vec(BorshSchema.String),
    Unchanged: BorshSchema.Vec(BorshSchema.String),
  }),
)

export const FILE_CONFLICTS_SCHEMA = BorshSchema.Vec(
  BorshSchema.Enum({
    Ours: BorshSchema.String,
    Theirs: BorshSchema.String,
    Unchanged: BorshSchema.String,
  }),
)

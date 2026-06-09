import type { RepositoryStorage, Settings } from '@/api/models'

export type StringSettingKey = {
  [K in keyof Settings]: Settings[K] extends string ? K : never
}[keyof Settings]

export type BooleanSettingKey = {
  [K in keyof Settings]: Settings[K] extends boolean ? K : never
}[keyof Settings]

export type StringRepositoryStorageKey = {
  [K in keyof RepositoryStorage]: RepositoryStorage[K] extends string
    ? K
    : never
}[keyof RepositoryStorage]

export type BooleanRepositoryStorageKey = {
  [K in keyof RepositoryStorage]: RepositoryStorage[K] extends boolean
    ? K
    : never
}[keyof RepositoryStorage]

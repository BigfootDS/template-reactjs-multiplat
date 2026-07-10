import type { Migration } from 'kysely/migration'
import { settingsMigration2026071001 } from './2026-07-10-01-settings'

export const settingsMigrations: Record<string, Migration> = {
  '2026-07-10-01-settings': settingsMigration2026071001,
}

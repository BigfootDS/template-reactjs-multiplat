import type { Kysely } from 'kysely'
import type { Migration } from 'kysely/migration'

export const settingsMigration2026071001: Migration = {
  async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('settings').execute()
  },
  async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('settings')
      .addColumn('id', 'text', (column) => column.primaryKey())
      .addColumn('version', 'integer', (column) => column.notNull())
      .addColumn('display', 'json', (column) => column.notNull())
      .addColumn('audio', 'json', (column) => column.notNull())
      .addColumn('language', 'json', (column) => column.notNull())
      .addColumn('diagnostics', 'json', (column) => column.notNull())
      .addColumn('createdAt', 'text', (column) => column.notNull())
      .addColumn('updatedAt', 'text', (column) => column.notNull())
      .execute()
  },
}

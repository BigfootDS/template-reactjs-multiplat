import { Kysely, ParseJSONResultsPlugin } from 'kysely'
import { Migrator } from 'kysely/migration'
import { SQLocalKysely } from 'sqlocal/kysely'
import { settingsMigrations } from './migrations'
import {
  createDefaultSettings,
  normaliseSettings,
  type Settings,
} from './settingsModel'
import type { SettingsDatabase } from './settingsDatabaseSchema'
import type { SettingsRepository } from './settingsRepository'

const sqlocalClient = new SQLocalKysely('template-settings.sqlite3')
const database = new Kysely<SettingsDatabase>({
  dialect: sqlocalClient.dialect,
  plugins: [new ParseJSONResultsPlugin()],
})
const migrator = new Migrator({
  db: database,
  provider: {
    async getMigrations() {
      return settingsMigrations
    },
  },
})

let databaseInitialisation: Promise<void> | undefined

/**
 * Runs registered SQLocal migrations once before settings access.
 *
 * Kysely reports migration errors in its result object instead of throwing, so
 * this wrapper turns a failed migration into a rejected settings operation that
 * the provider can show to the developer.
 */
async function initialiseDatabase(): Promise<void> {
  if (!databaseInitialisation) {
    databaseInitialisation = (async () => {
      const result = await migrator.migrateToLatest()

      if (result.error) {
        throw result.error
      }
    })().catch((error: unknown) => {
      databaseInitialisation = undefined
      throw error
    })
  }

  return databaseInitialisation
}

function toSettingsValues(settings: Settings) {
  return {
    audio: JSON.stringify(settings.audio),
    createdAt: settings.createdAt,
    diagnostics: JSON.stringify(settings.diagnostics),
    display: JSON.stringify(settings.display),
    id: settings.id,
    language: JSON.stringify(settings.language),
    updatedAt: settings.updatedAt,
    version: settings.version,
  }
}

export const sqlocalSettingsRepository: SettingsRepository = {
  id: 'sqlocal',
  async loadOrCreate(): Promise<Settings> {
    await initialiseDatabase()

    const storedSettings = await database
      .selectFrom('settings')
      .selectAll()
      .where('id', '=', 'default')
      .executeTakeFirst()

    if (storedSettings) {
      return normaliseSettings(storedSettings)
    }

    const settings = createDefaultSettings()
    await database.insertInto('settings').values(toSettingsValues(settings)).executeTakeFirst()
    return settings
  },
  async save(settings: Settings): Promise<Settings> {
    await initialiseDatabase()
    const normalisedSettings = normaliseSettings(settings)

    await database
      .insertInto('settings')
      .values(toSettingsValues(normalisedSettings))
      .onConflict((conflict) => conflict.column('id').doUpdateSet(toSettingsValues(normalisedSettings)))
      .executeTakeFirst()

    return normalisedSettings
  },
}

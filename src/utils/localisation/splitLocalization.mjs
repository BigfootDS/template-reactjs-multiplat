import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const sourceFilePath = path.join(scriptDirectory, 'i18nLocalization.json')
const outputDirectoryPath = path.join(scriptDirectory, 'generated')
const manifestFilePath = path.join(outputDirectoryPath, 'manifest.json')

function sortObjectByKey(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)),
  )
}

async function writeJsonFile(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data, null, '\t')}\n`, 'utf8')
}

const rawLocalisationData = await readFile(sourceFilePath, 'utf8')
const localisationData = JSON.parse(rawLocalisationData)
const jsonReadyData = localisationData['json-ready']

if (typeof jsonReadyData !== 'object' || jsonReadyData === null || Array.isArray(jsonReadyData)) {
  throw new Error('Expected i18nLocalization.json to contain a top-level "json-ready" object.')
}

await mkdir(outputDirectoryPath, { recursive: true })

const languages = Object.keys(jsonReadyData).sort((leftLanguage, rightLanguage) => (
  leftLanguage.localeCompare(rightLanguage)
))
const manifest = {
  source: path.basename(sourceFilePath),
  languages: {},
}

for (const language of languages) {
  const translations = jsonReadyData[language]

  if (typeof translations !== 'object' || translations === null || Array.isArray(translations)) {
    throw new Error(`Expected "${language}" translations to be an object.`)
  }

  const languageFileName = `${language}.json`
  manifest.languages[language] = {
    direction: translations.language_direction ?? 'ltr',
    file: languageFileName,
    name: translations.app_language ?? language,
  }

  await writeJsonFile(path.join(outputDirectoryPath, languageFileName), sortObjectByKey(translations))
}

await writeJsonFile(manifestFilePath, manifest)

console.log(`Split ${languages.length} localisation languages into ${path.relative(process.cwd(), outputDirectoryPath)}.`)

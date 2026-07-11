import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const contributorPeopleFilePath = path.join(scriptDirectory, 'git-contributor-people.json')
const outputDirectory = path.join(projectDirectory, 'src', 'assets')
const outputFilePath = path.join(outputDirectory, 'gitContributors.json')

const contributorPeople = JSON.parse(await readFile(contributorPeopleFilePath, 'utf8'))

if (!Array.isArray(contributorPeople.people)) {
  throw new Error('Expected git-contributor-people.json to contain a people array.')
}

const primaryNameByIdentity = new Map()

for (const person of contributorPeople.people) {
  if (typeof person.name !== 'string' || !person.name.trim() || !Array.isArray(person.identities)) {
    throw new Error('Each configured contributor needs a primary name and an identities array.')
  }

  for (const identity of person.identities) {
    if (typeof identity !== 'string' || !identity.trim()) {
      throw new Error(`Configured contributor "${person.name}" has an invalid Git identity.`)
    }

    if (primaryNameByIdentity.has(identity)) {
      throw new Error(`Git identity "${identity}" is mapped to more than one contributor.`)
    }

    primaryNameByIdentity.set(identity, person.name)
  }
}

const { stdout } = await execFileAsync(
  'git',
  ['log', '--all', '--format=%aN%x00%aE'],
  { cwd: projectDirectory, maxBuffer: 10 * 1024 * 1024 },
)

const commitCountByIdentity = new Map()

for (const line of stdout.split('\n')) {
  const separatorIndex = line.indexOf('\u0000')

  if (separatorIndex === -1) {
    continue
  }

  const name = line.slice(0, separatorIndex).trim()

  if (!name) {
    continue
  }

  commitCountByIdentity.set(name, (commitCountByIdentity.get(name) ?? 0) + 1)
}

const contributorsByPrimaryName = new Map()

for (const [identity, commits] of commitCountByIdentity) {
  const primaryName = primaryNameByIdentity.get(identity) ?? identity
  const contributor = contributorsByPrimaryName.get(primaryName) ?? {
    commits: 0,
    identities: [],
    name: primaryName,
  }

  contributor.commits += commits
  contributor.identities.push({ commits, name: identity })
  contributorsByPrimaryName.set(primaryName, contributor)
}

const contributors = [...contributorsByPrimaryName.values()]
  .map((contributor) => ({
    ...contributor,
    identities: contributor.identities.sort((left, right) => (
      right.commits - left.commits || left.name.localeCompare(right.name)
    )),
  }))
  .sort((left, right) => right.commits - left.commits || left.name.localeCompare(right.name))

await mkdir(outputDirectory, { recursive: true })
await writeFile(outputFilePath, `${JSON.stringify({ contributors }, null, 2)}\n`, 'utf8')

console.log(`Wrote ${contributors.length} Git contributors to ${path.relative(projectDirectory, outputFilePath)}.`)

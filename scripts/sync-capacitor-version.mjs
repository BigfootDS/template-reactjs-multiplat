import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const packageJsonPath = path.join(projectDirectory, 'package.json')
const capverPath = path.join(projectDirectory, 'node_modules', '@capawesome', 'capver', 'dist', 'index.js')
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
const stableSemverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

if (typeof packageJson.version !== 'string' || !stableSemverPattern.test(packageJson.version)) {
  throw new Error('Capacitor version sync requires package.json version to use MAJOR.MINOR.PATCH SemVer.')
}

const [, major, minor, patch] = packageJson.version.match(stableSemverPattern)
const versionCode = Number(`${major}${minor.padStart(4, '0')}${patch.padStart(3, '0')}`)

if (versionCode < 1 || versionCode > 2_147_483_647) {
  throw new Error(`Package version ${packageJson.version} maps to invalid Android versionCode ${versionCode}.`)
}

const { stdout, stderr } = await execFileAsync(
  process.execPath,
  [capverPath, 'set', packageJson.version],
  { cwd: projectDirectory },
)

process.stdout.write(stdout)
process.stderr.write(stderr)

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const packageJson = JSON.parse(await readFile(path.join(projectDirectory, 'package.json'), 'utf8'))
const gradlePath = path.join(projectDirectory, 'android', 'app', 'build.gradle')
const gradle = await readFile(gradlePath, 'utf8')
const stableSemverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const semverMatch = typeof packageJson.version === 'string'
  ? packageJson.version.match(stableSemverPattern)
  : undefined

if (!semverMatch) {
  throw new Error('Capacitor version check requires package.json version to use MAJOR.MINOR.PATCH SemVer.')
}

const [, major, minor, patch] = semverMatch
const expectedVersionCode = Number(
  `${major}${minor.padStart(4, '0')}${patch.padStart(3, '0')}`,
)
const versionCodeMatch = gradle.match(/^\s*versionCode\s+(\d+)\s*$/m)
const versionNameMatch = gradle.match(/^\s*versionName\s+"([^"]+)"\s*$/m)

if (!versionCodeMatch || !versionNameMatch) {
  throw new Error('Unable to find Android versionCode and versionName in android/app/build.gradle.')
}

if (versionNameMatch[1] !== packageJson.version) {
  throw new Error(`Android versionName ${versionNameMatch[1]} does not match package.json ${packageJson.version}.`)
}

if (Number(versionCodeMatch[1]) !== expectedVersionCode) {
  throw new Error(
    `Android versionCode ${versionCodeMatch[1]} does not match ${expectedVersionCode} for ${packageJson.version}.`,
  )
}

if (expectedVersionCode < 1 || expectedVersionCode > 2_147_483_647) {
  throw new Error(`Package version ${packageJson.version} maps to invalid Android versionCode ${expectedVersionCode}.`)
}

console.log(`Android version ${versionNameMatch[1]} is synchronised with package.json (versionCode ${versionCodeMatch[1]}).`)

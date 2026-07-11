import { spawn } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const localEnvironmentPath = path.join(projectDirectory, '.env.local')
const requiredSigningVariables = [
  'ANDROID_SIGNING_STORE_FILE',
  'ANDROID_SIGNING_STORE_PASSWORD',
  'ANDROID_SIGNING_KEY_ALIAS',
  'ANDROID_SIGNING_KEY_PASSWORD',
]

function parseEnvironmentValue(value) {
  const trimmedValue = value.trim()

  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"'))
    || (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1)
  }

  return trimmedValue
}

function parseLocalEnvironment(content) {
  const variables = {}

  for (const [index, line] of content.split(/\r?\n/).entries()) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')

    if (separatorIndex < 1) {
      throw new Error(`Invalid .env.local entry on line ${index + 1}. Use NAME=value.`)
    }

    const name = line.slice(0, separatorIndex).trim()

    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      throw new Error(`Invalid .env.local variable name on line ${index + 1}.`)
    }

    variables[name] = parseEnvironmentValue(line.slice(separatorIndex + 1))
  }

  return variables
}

async function readLocalEnvironment() {
  try {
    return parseLocalEnvironment(await readFile(localEnvironmentPath, 'utf8'))
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return {}
    }

    throw error
  }
}

async function run(command, argumentsList, environment) {
  const executable = process.platform === 'win32' ? `${command}.cmd` : command

  await new Promise((resolve, reject) => {
    const childProcess = spawn(executable, argumentsList, {
      cwd: projectDirectory,
      env: environment,
      stdio: 'inherit',
    })

    childProcess.once('error', reject)
    childProcess.once('exit', (exitCode, signal) => {
      if (exitCode === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} stopped with ${signal ? `signal ${signal}` : `exit code ${exitCode}`}.`))
    })
  })
}

const localEnvironment = await readLocalEnvironment()
const signingEnvironment = { ...process.env }

for (const name of requiredSigningVariables) {
  signingEnvironment[name] = process.env[name] ?? localEnvironment[name]
}

const configuredStoreType = (
  process.env.ANDROID_SIGNING_STORE_TYPE
  ?? localEnvironment.ANDROID_SIGNING_STORE_TYPE
)
signingEnvironment.ANDROID_SIGNING_STORE_TYPE = configuredStoreType?.trim() || 'JKS'

const missingVariables = requiredSigningVariables.filter((name) => !signingEnvironment[name]?.trim())

if (missingVariables.length > 0) {
  throw new Error(
    `Signed Android builds need ${missingVariables.join(', ')}. Run npm run setup:env and fill .env.local, or provide the variables through your local secret manager.`,
  )
}

const configuredStoreFile = signingEnvironment.ANDROID_SIGNING_STORE_FILE
const resolvedStoreFile = path.resolve(projectDirectory, configuredStoreFile)

try {
  await access(resolvedStoreFile)
} catch {
  throw new Error(`Android signing keystore was not found at ${resolvedStoreFile}.`)
}

signingEnvironment.ANDROID_SIGNING_STORE_FILE = resolvedStoreFile

console.log('Preparing the Android project for a locally signed AAB.')
await run('npm', ['run', 'capacitor:android:prepare'], signingEnvironment)

console.log('Building the locally signed Android AAB.')
await run('npx', ['cap', 'build', 'android', '--androidreleasetype', 'AAB'], signingEnvironment)

import { access, copyFile, constants } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const sourcePath = path.join(projectDirectory, '.env.example')
const destinationPath = path.join(projectDirectory, '.env.local')

try {
  await access(destinationPath, constants.F_OK)
  console.log('.env.local already exists. It was not changed.')
} catch {
  await copyFile(sourcePath, destinationPath)
  console.log('Created .env.local from .env.example. Add local values before running a signed Android build.')
}

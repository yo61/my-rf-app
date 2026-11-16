// Bundled to migrations/migrate.mjs for the operated-apps PoC applier: role → migrations → grants.
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL (owner role) is required')
  if (!process.env.APP_DATABASE_URL) throw new Error('APP_DATABASE_URL (app role) is required')

  process.argv[1] = '' // keeps the imported scripts' own CLI entry points from running
  const { applyDbRoles } = await import('./db-roles')
  const { runMigrations } = await import('./migrate')

  await applyDbRoles({ phase: 'role' })
  await runMigrations(databaseUrl, { migrationsFolder: dirname(fileURLToPath(import.meta.url)) })
  await applyDbRoles({ phase: 'grants' })
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error('Migration failed:', error)
    process.exit(1)
  }
)

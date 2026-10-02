import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { test } from 'vitest'

for (const flags of [[], ['--preserve-symlinks-main']]) {
  test(`a CLI invoked through a directory link executes its main block (${flags.join(' ') || 'default'})`, () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'main-symlink-'))
    try {
      const directory = path.join(temp, 'real')
      const alias = path.join(temp, 'alias')
      const output = path.join(temp, 'receipt.txt')
      fs.mkdirSync(directory)
      fs.symlinkSync(directory, alias, process.platform === 'win32' ? 'junction' : 'dir')
      fs.copyFileSync(new URL('./utils.mjs', import.meta.url), path.join(directory, 'utils.mjs'))
      fs.writeFileSync(path.join(directory, 'cli.mjs'), `
import { writeFileSync } from 'node:fs'
import { isMain } from './utils.mjs'
if (isMain(import.meta.url)) writeFileSync(process.argv[2], 'main executed\\n')
`)
      const result = spawnSync(process.execPath, [...flags, path.join(alias, 'cli.mjs'), output], { encoding: 'utf8', timeout: 30000 })
      assert.equal(result.status, 0, result.stderr)
      assert.equal(fs.readFileSync(output, 'utf8'), 'main executed\n')
    } finally {
      fs.rmSync(temp, { recursive: true, force: true })
    }
  })
}

test('importing a CLI through a directory link does not execute its main block', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'main-import-'))
  try {
    const directory = path.join(temp, 'real')
    const alias = path.join(temp, 'alias')
    const output = path.join(temp, 'receipt.txt')
    fs.mkdirSync(directory)
    fs.symlinkSync(directory, alias, process.platform === 'win32' ? 'junction' : 'dir')
    fs.copyFileSync(new URL('./utils.mjs', import.meta.url), path.join(directory, 'utils.mjs'))
    fs.writeFileSync(path.join(directory, 'cli.mjs'), `
import { writeFileSync } from 'node:fs'
import { isMain } from './utils.mjs'
if (isMain(import.meta.url)) writeFileSync(process.argv[2], 'unexpected main block')
`)
    fs.writeFileSync(path.join(temp, 'importer.mjs'), "import './alias/cli.mjs'\n")
    const result = spawnSync(process.execPath, [path.join(temp, 'importer.mjs'), output], { encoding: 'utf8', timeout: 30000 })
    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.existsSync(output), false)
  } finally {
    fs.rmSync(temp, { recursive: true, force: true })
  }
})

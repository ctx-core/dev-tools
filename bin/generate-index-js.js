#!/usr/bin/env node
import { chdir } from '@ctx-core/dir'
import { param_r_ } from 'ctx-core/cli-args'
import { readdirSync, statSync } from 'node:fs'
import { basename as basename_, extname as extname_, join } from 'node:path'
const params = param_r_(process.argv.slice(2), {
	dir_path_a: '-d, --dir',
	help: '-h, --help',
})
const cli_help_ = ()=>`
generate-index-ts -d ./path/to/dir

Options:

-d, --dir    directory containing index.ts
-h, --help   this help message'
  `.trim()
if (params.help) {
	console.info(cli_help_())
	process.exit(0)
}
const dir_path = params.dir_path_a?.[0]
if (!dir_path) throw `-d, --dir is missing`
chdir(dir_path, main).then()
async function main() {
	let svelte_imported = false
	for (const path of readdirSync(dir_path)) {
		const stat = statSync(path)
		const basename = basename_(path)
		if (stat.isDirectory()) {
			if (
				statSync(join(dir_path, basename, 'index.ts')).then($=>$.isFile())
				|| statSync(join(dir_path, basename, 'index.js')).then($=>$.isFile())
			) {
				console.info(`export * from './${basename}/index.js'`)
			} else if (
				statSync(join(dir_path, basename, 'index.tsx')).then($=>$.isFile())
				|| statSync(join(dir_path, basename, 'index.jsx')).then($=>$.isFile())
			) {
				console.info(`export * from './${basename}/index.jsx'`)
			} else if (
				statSync(join(dir_path, basename, 'index.svelte')).then($=>$.isFile())
			) {
				console.info(`export * from './${basename}/index.svelte'`)
			} else {
				console.info(`export * from './${basename}'`)
			}
		} else if (stat.isFile()) {
			const ts__basename = basename_(basename, '.ts')
			const extname = extname_(path)
			if (ts__basename !== basename) {
				const d_ts__basename = basename_(basename, '.d.ts')
				if (ts__basename === 'index' || d_ts__basename === 'index') return
				if (d_ts__basename !== basename) {
					console.info(`export * from './${d_ts__basename}'`)
				} else {
					console.info(`export * from './${ts__basename}.js'`)
				}
			} else if (extname === '.tsx') {
				const tsx__basename = basename_(path, '.tsx')
				if (tsx__basename === 'index') return
				console.info(`export * from './${tsx__basename}.jsx'`)
			} else if (extname === '.svelte') {
				if (!svelte_imported) {
					svelte_imported = true
					console.info(`import 'svelte'`)
				}
				console.info(`export * from './${basename}'`)
			}
		}
	}
}

import { param_r_ } from '@ctx-core/cli-args'
import { chdir } from '@ctx-core/dir'
import { queue_ } from '@ctx-core/queue'
import { spawn } from 'child_process'
import fs from 'fs/promises'
import { basename as basename_, extname as extname_ } from 'path'
import * as readline from 'readline/promises'
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
	const queue = queue_(1)
	try {
		await _main()
	} finally {
		await queue.close()
	}
	async function _main() {
		let svelte_imported = false
		await new Promise(ret=>{
			const proc = spawn(
				'ls', ['-1'], { cwd: dir_path }
			).on('close', ()=>ret(null))
			readline.createInterface({
				input: proc.stdout
			}).on('line', path=>{
				queue.add(async ()=>{
					const stat = await fs.stat(path)
					const basename = basename_(path)
					if (stat.isDirectory()) {
						console.info(`export * from './${basename}'`)
					} else if (stat.isFile()) {
						const ts__basename = basename_(basename, '.ts')
						const extname = extname_(path)
						if (ts__basename !== basename) {
							if (ts__basename === 'index') return
							const d_ts__basename = basename_(basename, '.d.ts')
							if (d_ts__basename !== basename) {
								console.info(`export * from '${d_ts__basename}'`)
							} else {
								console.info(`export * from '${ts__basename}.js'`)
							}
						} else if (extname === '.tsx') {
							const tsx__basename = basename_(path, '.tsx')
							if (tsx__basename === 'index') return
							console.info(`export * from '${tsx__basename}.jsx'`)
						} else if (extname === '.svelte') {
							if (!svelte_imported) {
								svelte_imported = true
								console.info(`import 'svelte'`)
							}
							console.info(`export * from '${basename}'`)
						}
					}
				})
			})
		})
	}
}

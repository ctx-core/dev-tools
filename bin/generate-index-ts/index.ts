import { param_r_ } from '@ctx-core/cli-args'
import { chdir } from '@ctx-core/dir'
import fs from 'fs'
import glob_stream from 'glob-stream'
import { basename as basename_, extname as extname_ } from 'path'
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
chdir(process.env.CWD || process.cwd(), main).then()
async function main() {
	if (params.help) {
		console.info(cli_help_())
		return
	}
	await _main()
	async function _main() {
		let svelte_imported = false
		await new Promise(ret=>{
			glob_stream('*')
				.on('data', ($:glob_stream.Entry)=>{
					const { path } = $
					const stat = fs.statSync(path)
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
								console.info(`export * from '${basename}'`)
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
				.on('end', ()=>ret(null))
		})
	}
}

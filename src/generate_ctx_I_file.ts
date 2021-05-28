import globby from 'globby'
import { readFile, writeFile } from 'fs'
import { basename, dirname, join, relative } from 'path'
import { promisify } from 'util'
const writefile_p = promisify(writeFile)
export interface generate_ctx_I_file_opts_I {
	exclude?:string[]
	project_path?:string
	src_relative_path?:string
}
export async function generate_ctx_I_file(
	opts:generate_ctx_I_file_opts_I = {}
) {
	const project_path = opts?.project_path || '.'
	const src_relative_path = opts?.src_relative_path || 'src'
	const exclude = opts?.exclude || []
	const pkg_json_buffer = await promisify(readFile)(`${project_path}/package.json`)
	const pkg_json = pkg_json_buffer.toString()
	const pkg = JSON.parse(pkg_json)
	const { name } = pkg
	const pkg_basename = sanitize(basename(name))
	const src_path = join(project_path, src_relative_path)
	const ctx_I_name = `${pkg_basename}_ctx_I`
	const b_h_name = `${pkg_basename}_b_h`
	const b_h_b_name = `${pkg_basename}_b_h_b`
	const b_h_T_name = `${pkg_basename}_b_h_T`
	const unfiltered_b_path_a1 = await globby([
		`${src_path}/**/*_b.ts`,
		`${src_path}/**/*_be.ts`,
	])
	const unfiltered_b_name_a1 = unfiltered_b_path_a1.map(b_path=>
		sanitize(basename(b_path, '.ts'))
	)
	const unfiltered_base_name_a1 = unfiltered_b_name_a1.map(b_name=>
		sanitize(strip_to_base_name(b_name))
	)
	const exclude_idx_a1 = unfiltered_base_name_a1.reduce<number[]>((memo, base_name, idx)=>{
		if (~exclude.indexOf(base_name)) {
			memo.push(idx)
		}
		return memo
	}, [])
	const filter_fn = (_:any, idx:number)=>!~exclude_idx_a1.indexOf(idx)
	const b_path_a1 = unfiltered_b_path_a1.filter(filter_fn)
	const b_name_a1 = unfiltered_b_name_a1.filter(filter_fn)
	const base_name_a1 = unfiltered_base_name_a1.filter(filter_fn)
	const T_name_a1 = base_name_a1.map(base_name=>
		`${base_name}_T`
	)
	const import_path_a1 = b_path_a1.map(b_path=>{
		const relative_path = relative(src_path, b_path)
		const in_dirname = dirname(relative_path)
		const out_dirname =
			((/^\.$/.test(in_dirname)) || (/^\.\//.test(in_dirname)))
			? in_dirname
			: `./${in_dirname}`
		return `${out_dirname}/${sanitize(basename(relative_path, '.ts'))}`
	})
	await writefile_generated_ctx_I()
	function strip_to_base_name(b_name:string) {
		return b_name.replace(/((_b)|(_be))$/, '')
	}
	function sanitize(unsanitized_name:string) {
		return unsanitized_name.replace(/-/g, '_')
	}
	async function writefile_generated_ctx_I() {
		await writefile_p(
			`${src_path}/${ctx_I_name}.generated.ts`,
			[
				frontmatter_ts_fn(),
				`import { _b } from '@ctx-core/object'`,
				`import type { B } from '@ctx-core/object'`,
				import_ts_fn(),
				export_generated_ctx_I_fn(),
				export_b_h_t_fn(),
				export_b_h_b_fn(),
			].join('\n')
		)
		function frontmatter_ts_fn() {
		  return [
		  	'/*',
				' * This file was generated by `npm run generate_ctx_I_file` in @ctx-core/dev-tools',
		  	'*/'
			].join('\n')
		}
		function import_ts_fn() {
			return import_path_a1.map((import_path, idx)=>{
				return [
					`import type { ${T_name_a1[idx]} } from '${import_path}'`,
					`import { ${b_name_a1[idx]} } from '${import_path}'`
				].join('\n')
			}).join('\n')
		}
		function export_generated_ctx_I_fn() {
			const member_ts = base_name_a1.map((base_name, idx)=>{
				return `\t${base_name}?:${T_name_a1[idx]}`
			}).join('\n')
			return `
export interface ${ctx_I_name} {
${member_ts}
	${b_h_name}?:${b_h_T_name}
}
		  `.trim()
		}
		function export_b_h_b_fn() {
			const member_ts = base_name_a1.map((base_name, idx)=>{
				return `\t\t\tget ${base_name}() { return ${b_name_a1[idx]}(ctx) }`
			}).join(',\n')
			return `
export function ${b_h_b_name}(ctx:${ctx_I_name}):B<${ctx_I_name}, '${b_h_name}'> {
	return _b('${b_h_name}', ()=>{
		return {
${member_ts}
		}
	})
}
		  `.trim()
		}
	}
	function export_b_h_t_fn() {
		const member_ts = base_name_a1.map((base_name, idx)=>{
			return `\tget ${base_name}():${T_name_a1[idx]}`
		}).join('\n')
		return `
export interface ${b_h_T_name} {
${member_ts}
}
	  `.trim()
	}
}

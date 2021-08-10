import { fdir } from 'fdir'
import { readFile, writeFile } from 'fs/promises'
import { basename, dirname, join, relative } from 'path'
export interface generate_ctx_I_file_opts_I {
	exclude?:string[]
	b_h_b?:boolean
	project_path?:string
	src_relative_path?:string
}
export async function generate_ctx_I_file(
	opts:generate_ctx_I_file_opts_I = {}
):Promise<void> {
	const project_path = opts?.project_path || '.'
	const src_relative_path = opts?.src_relative_path || 'src'
	const exclude = opts?.exclude || []
	const b_h_b = opts?.b_h_b || false
	const pkg_json_buffer = await readFile(`${project_path}/package.json`)
	const pkg_json = pkg_json_buffer.toString()
	const pkg = JSON.parse(pkg_json)
	const { name } = pkg
	const pkg_basename = sanitize(basename(name))
	const src_path = join(project_path, src_relative_path)
	const ctx_I_name = `${pkg_basename}_ctx_I`
	const Ctx_name = `${pkg_basename}_Ctx`
	const b_h_name = `${pkg_basename}_b_h`
	const b_h_b_name = `${pkg_basename}_b_h_b`
	const b_h_T_name = `${pkg_basename}_b_h_T`
	const unfiltered_b_path_a = (
		await new fdir()
			.glob('**/*_b.ts', '**/*_be.ts')
			.withFullPaths()
			.crawl(process.cwd())
			.withPromise() as string[]
	).sort()
	const unfiltered_b_name_a = unfiltered_b_path_a.map(b_path=>
		sanitize(basename(b_path, '.ts'))
	)
	const unfiltered_base_name_a = unfiltered_b_name_a.map(b_name=>
		sanitize(strip_to_base_name(b_name))
	)
	const exclude_idx_a = unfiltered_base_name_a.reduce<number[]>((memo, base_name, idx)=>{
		if (~exclude.indexOf(base_name)) {
			memo.push(idx)
		}
		return memo
	}, [])
	const filter_fn = (_:any, idx:number)=>!~exclude_idx_a.indexOf(idx)
	const b_path_a = unfiltered_b_path_a.filter(filter_fn)
	const b_name_a = unfiltered_b_name_a.filter(filter_fn)
	const base_name_a = unfiltered_base_name_a.filter(filter_fn)
	const T_name_a = base_name_a.map(base_name=>
		`${base_name}_T`
	).sort()
	const import_path_a = b_path_a.map(b_path=>{
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
		return b_name.replace(/((_rc_b)|(_rc_be)|(_b)|(_be))$/, '')
	}
	function sanitize(unsanitized_name:string) {
		return unsanitized_name.replace(/[.-]/g, '_')
	}
	async function writefile_generated_ctx_I() {
		await writeFile(
			`${src_path}/${ctx_I_name}.generated.ts`,
			[
				frontmatter_ts_fn(),
				...(b_h_b ? [
					`import { B, be_ } from '@ctx-core/object'`,
					`import type { ${Ctx_name} } from './${Ctx_name}.js'`,
				] : []),
				import_ts_fn(),
				export_generated_ctx_I_fn(),
				...(b_h_b ? [export_b_h_t_fn(), export_b_h_b_fn()] : [])
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
			return import_path_a.map((import_path, idx)=>{
				return [
					`import type { ${T_name_a[idx]} } from '${import_path}.js'`,
					...(b_h_b ? [`import { ${b_name_a[idx]} } from '${import_path}.js'`] : [])
				].join('\n')
			}).join('\n')
		}
		function export_generated_ctx_I_fn() {
			const member_ts = base_name_a.map((base_name, idx)=>{
				return `\t${base_name}?:${T_name_a[idx]}`
			}).join('\n')
			const b_h_b_ts = b_h_b ? `\n\t${b_h_name}?:${b_h_T_name}` : ''
			return `
export interface ${ctx_I_name} {
${member_ts}${b_h_b_ts}
}
		  `.trim()
		}
		function export_b_h_b_fn() {
			const member_ts = base_name_a.map((base_name, idx)=>{
				return `\t\t\tget ${base_name}() { return ${b_name_a[idx]}(ctx) }`
			}).join(',\n')
			return `
export function ${b_h_b_name}(ctx:${Ctx_name}):${b_h_T_name} {
	return be_<${Ctx_name}, '${b_h_name}'>('${b_h_name}', ()=>{
		return {
${member_ts}
		}
	})(ctx)
}
		  `.trim()
		}
	}
	function export_b_h_t_fn() {
		const member_ts = base_name_a.map((base_name, idx)=>{
			return `\tget ${base_name}():${T_name_a[idx]}`
		}).join('\n')
		return `
export interface ${b_h_T_name} {
${member_ts}
}
	  `.trim()
	}
}

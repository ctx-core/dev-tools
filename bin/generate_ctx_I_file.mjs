#!/usr/bin/env node
import { param_r_ } from '@ctx-core/cli-args'
import { generate_ctx_I_file } from '../dist/index.js'
const param_r = param_r_(process.argv.slice(2), {
	exclude_a: '-e, --exclude',
	b_h_b: '-b, --b_h_b'
}, {
	exclude_a: undefined,
	b_h_b: undefined,
})
const exclude_a = (param_r.exclude_a || []).reduce((exclude_a, exclude_val) => {
	exclude_a.push(exclude_val.split(','))
	return exclude_a
}, [])
console.info(
	await generate_ctx_I_file({ exclude_a })
)

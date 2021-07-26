#!/usr/bin/env node
import { param_r_ } from '@ctx-core/cli-args'
import { generate_ctx_I_file } from '../dist/index.js'
const { exclude } = param_r_(process.argv.slice(2), {
	exclude: '-e, --exclude',
	b_h_b: '-b, --b_h_b'
}, {
	exclude: undefined,
	b_h_b: false,
})
await generate_ctx_I_file({ exclude: exclude ? exclude.split(',') : [] })

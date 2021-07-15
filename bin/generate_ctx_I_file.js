#!/usr/bin/env node
import { param_r_ } from '@ctx-core/cli-args'
import { generate_ctx_I_file } from '../dist'
const { exclude } = param_r_(process.argv.slice(2), {
	exclude: '-e, --exclude',
	b_h_b: '-b, --b_h_b'
}, {
	exclude: undefined,
	b_h_b: false,
})
generate_ctx_I_file({ exclude: exclude ? exclude.split(',') : [] }).then()

#!/usr/bin/env node
require = require('esm')(module)
const { param_r_ } = require('@ctx-core/cli-args')
const { generate_ctx_I_file } = require('../dist')
const { exclude } = param_r_(process.argv.slice(2), {
	exclude: '-e, --exclude',
	b_h_b: '-b, --b_h_b'
}, {
	exclude: undefined,
	b_h_b: false,
})
generate_ctx_I_file({ exclude: exclude ? exclude.split(',') : [] }).then()

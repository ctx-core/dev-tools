#!/usr/bin/env node
require = require('esm')(module)
const { _param_h } = require('@ctx-core/cli-args')
const { generate_ctx_I_file } = require('../src')
const { exclude } = _param_h(process.argv.slice(2), {
	exclude: '-e, --exclude',
	b_h_b: '-b, --b_h_b'
}, {
	exclude: undefined,
	b_h_b: false,
})
generate_ctx_I_file({ exclude: exclude ? exclude.split(',') : [] }).then()

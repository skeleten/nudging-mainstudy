const path = require('path');

var destination_path = path.resolve(__dirname, 'dist/script');
var build_mode = 'production';
var node_cfg = { fs: 'empty' };

module.exports = [
	{
		entry: './src/n0/main.js',
		output: {
			filename: 'n0.js',
			path: destination_path,
		},
		mode: build_mode,
		node: node_cfg,
	},
	{
		entry: './src/n1/main.js',
		output: {
			filename: 'n1.js',
			path: destination_path,
		},
		mode: build_mode,
		node: node_cfg
	},
	{
		entry: './src/n2/main.js',
		output: {
			filename: 'n2.js',
			path: destination_path,
		},
		mode: build_mode,
		node: node_cfg
	},
	{
		entry: './src/n3/main.js',
		output: {
			filename: 'n3.js',
			path: destination_path,
		},
		mode: build_mode,
		node: node_cfg
	},
	{
		entry: './src/mem/main.js',
		output: {
			filename: 'mem.js',
			path: destination_path,
		},
		mode: build_mode,
		node: node_cfg
	}
]

const path = require('path');
const nodeResolve = require('rollup-plugin-node-resolve-and-alias');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify').uglify;
const replace = require('rollup-plugin-replace');
const analyzer = require('rollup-plugin-analyzer').plugin;

const tsconfig = require('./tsconfig.build.json')
const pkg = require('./package.json')

const env = process.env.NODE_ENV;
const name = pkg.name;
const src = path.resolve(tsconfig.compilerOptions.outDir);

const config = {
    input: path.join(src, 'index.js'),
    external: ['react', 'redux', 'react-redux'],
    plugins: [
        analyzer(),
        nodeResolve({
            alias: { src },
            jsnext: true,
        }),
        babel({
            exclude: 'node_modules/**',
            plugins: ['external-helpers'],
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env),
        }),
    ],
    output: {
        name,
        file: path.resolve(`dist/${name}.js`),
        indent: false,
        format: 'umd',
        globals: {
            react: 'React',
            redux: 'Redux',
            'react-redux': 'react-redux',
        },
    },
};



if (env === 'production') {
    config.plugins.push(
        uglify({
            compress: {
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true,
                warnings: false,
            },
        }),
    );
    config.output.file = path.resolve(`dist/${name}.min.js`);
}

export default config;

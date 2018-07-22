import path from 'path';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import titleCase from 'title-case';
import { uglify } from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import sizes from './rollup/rollup-plugin-sizes';
import pkg from './package.json';

const env = process.env.NODE_ENV;

const config = {
    input: path.join(pkg.main),
    watch: {
        include: ['lib/**'],
    },
    plugins: [
        peerDepsExternal(),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env),
        }),
        commonjs(),
        resolve(),
        sourceMaps(),
        sizes(),
        sizeSnapshot(),
    ],
    output: {
        name: titleCase(pkg.name),
        file: path.resolve(`dist/${pkg.name}.js`),
        indent: false,
        format: 'umd',
        sourceMap: true,
        exports: 'named',
        globals: {
            react: 'React',
            redux: 'Redux',
            'react-redux': 'ReactRedux',
            'redux-thunk': 'ReduxThunk',
        },
    },
};

if (env === 'production') {
    config.plugins = config.plugins.concat([
        uglify({
            compress: {
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true,
            },
            sourceMap: true,
        }),
    ]);
    config.output.file = path.resolve(`dist/${pkg.name}.min.js`);
}

export default config;

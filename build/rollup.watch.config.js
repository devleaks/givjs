import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import { eslint } from 'rollup-plugin-eslint';
import postcss from 'rollup-plugin-postcss'

export default {
    plugins: [
        resolve(),
        commonjs(),
        json(),
        postcss({
            extract: true
        }),
        eslint({
            include: 'dist/app.js'
        })
    ],
    input: 'src/app.js',
    output: {
        file: 'dist/app.js',
        format: 'iife'
    }
};
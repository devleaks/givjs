import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import { eslint } from 'rollup-plugin-eslint';
import postcss from 'rollup-plugin-postcss'

import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
    plugins: [
        resolve(),
        commonjs(),
        json(),
        postcss({
            extract: true
        }),
        eslint({
            include: [
                'src/app.js',
                'src/Components/*.js'
            ]
        }),
        serve(),      // index.html should be in root of project
        livereload()
    ],
    input: 'src/app.js',
    output: {
        file: 'dist/app.js',
        format: 'iife'
    }
};
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
    plugins: [
        resolve(),
        commonjs(),
        json()
    ],
    input: 'src/app.js',
    output: {
        file: 'dist/app.js',
        format: 'iife'
    }
};
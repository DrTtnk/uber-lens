import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'

const pkg = require('./package.json');

export default {
    input: `src/index.ts`,
    output: [
        { file: pkg.main, name: 'uber-lens', format: 'umd' },
        { file: pkg.module, format: 'es' },
    ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [],
    watch: { include: 'src/**' },
    plugins: [
        // Compile TypeScript files
        typescript({ useTsconfigDeclarationDir: true }),
        // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        commonjs(),
        // Allow node_modules resolution, so you can use 'external' to control
        // which external modules to include in the bundle
        // https://github.com/rollup/rollup-plugin-node-resolve#usage
        resolve(),
    ],
}

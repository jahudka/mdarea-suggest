import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const { version } = require('./package.json');

const opts = {
  delimiters: ['', ''],
};

if (process.env.CI) {
  opts["'dev-master'"] = `'${version.replace(/^v?/, 'v')}'`;
  opts['!process.env.CI'] = 'false';
  opts['process.env.CI'] = 'true';
} else {
  opts['!process.env.CI'] = 'true';
  opts['process.env.CI'] = 'false';
}

export default [
  {
    input: 'src/index.ts',
    plugins: [replace(opts), typescript()],
    output: {
      file: 'dist/mdarea-suggest.js',
      format: 'umd',
      name: 'MarkdownAreaSuggest',
      sourcemap: true,
    }
  },
  {
    input: 'src/index.ts',
    plugins: [replace(opts), typescript(), terser()],
    output: {
      file: 'dist/mdarea-suggest.min.js',
      format: 'umd',
      name: 'MarkdownAreaSuggest',
      sourcemap: true,
    }
  },
];

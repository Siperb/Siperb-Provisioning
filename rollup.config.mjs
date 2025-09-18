import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'Siperb-Provisioning.js',
  output: [
    {
      file: 'dist/Siperb-Provisioning.umd.min.js',
      format: 'umd',
      name: 'Siperb',
      exports: 'default',
      plugins: [terser()]
    },
    {
      file: 'dist/Siperb-Provisioning.esm.min.js',
      format: 'esm',
      exports: 'default',
      plugins: [terser()]
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
  ]
};

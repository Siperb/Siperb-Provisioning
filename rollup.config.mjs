import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'Siperb-Provisioning.js',
  output: [
    {
      file: 'Siperb-Provisioning.umd.js',
      format: 'umd',
      name: 'Siperb',
      exports: 'default',
      sourcemap: true
    },
    {
      file: 'Siperb-Provisioning.min.js',
      format: 'umd',
      name: 'Siperb',
      plugins: [terser()],
      exports: 'default',
      sourcemap: true
    },
    {
      file: 'Siperb-Provisioning.esm.js',
      format: 'esm',
      exports: 'default',
      sourcemap: true
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
  ]
};

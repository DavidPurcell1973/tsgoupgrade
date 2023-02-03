#!/usr/bin/env ts-node

import packageJson from '../package.json';
import {test, cp} from 'shelljs';
import chalk from 'chalk';
import {ShellString} from 'shelljs';
import {isString} from 'lodash';

(async () => {
  const {version} = packageJson;

  const sourceFile: string =
    'android/app/build/outputs/apk/release/app-release.apk';
  const destFile: string = `~/VMs\ Shared${
    isString(version) && version.length > 0 && '/TSGo_v' + version + '.apk'
  }`;

  const isFileExists: boolean = test('-f', sourceFile);
  console.log(`File exists? ${isFileExists}`);

  const result: ShellString = cp(sourceFile, destFile);

  if (result.length === 0) {
    console.log(`Copied file to ${destFile}`);
  } else console.log(result.toString());
})();

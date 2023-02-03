#!/usr/bin/env ts-node

import {isEmpty, isNil, isObject, isString, every} from 'lodash';
// import {exec, spawn} from 'child_process';
// import {program} from 'commander';
import simpleGit from 'simple-git';
import {LogResult} from 'simple-git';
import chalk from 'chalk';
import {StatusResult, SimpleGit} from 'simple-git';
import packageJson from '../package.json';
import fs from 'fs/promises';
import {promisify} from 'util';
import {exit} from 'process';
import {exec} from 'shelljs';

(async () => {
  const git: SimpleGit = simpleGit();
  const status: StatusResult = await git.status();
  const isClean: boolean = status.isClean();
  // const json: any = packageJson;

  // Workaround for rebuilding when it's only the package.json file changed...
  let okToProceeed = true;
  const uncommitedFiles = status.files;

  const filesConsideredOkay = [
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'scripts/build.ts',
    'scripts/chris.ts',
  ];

  uncommitedFiles.forEach((f) => {
    if (!filesConsideredOkay.includes(f.path)) {
      okToProceeed = false;
    }
  });

  console.log(chalk.red('Repository is clean? ' + isClean));
  console.log(
    chalk.red('Uncommited files check ok to proceeed? ' + okToProceeed),
  );

  if (isClean || okToProceeed) {
    const {latest}: LogResult = await git.log();

    if (
      latest &&
      !isEmpty(latest) &&
      isString(latest.hash) &&
      latest.hash.length > 0 &&
      isObject(packageJson)
    ) {
      // Replace commit the latest one
      packageJson['commit'] = latest.hash;

      try {
        await fs.writeFile(
          'package.json',
          JSON.stringify(packageJson, null, 2),
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log(
        chalk.red(
          `Commit hash is not written to package.json. Please investigate.`,
        ),
      );
      console.error(`Unknown error ${latest}`);
    }

    let command = 'npm run android:build';

    let output: any = exec(command, {async: false});
    // output.stdout.on('data', (data: string) => {
    //   console.log(data);
    // });

    if (output.code === 0) {
      command = 'npm run chris:move-to-window-drive';
      output = exec(command, {async: false});

      // output.stdout.on('data', (data: string) => {
      //   console.log(data);
      // });
    }
  } else {
    console.log(
      chalk.red(
        `Unable to build - repository is not clean (consider commit your changes?)`,
      ),
    );
  }
})();

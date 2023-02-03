import packageJson from '../../package.json';
import {isString} from 'lodash';

// https://appcenter.ms/users/TimberSmart/apps/TSGo/distribute/code-push/Staging
// Use Google OAUTH for timbersmart1@gmail.com

export const commit = packageJson.commit;
export const baseVersion = packageJson.version;

// Set this to null for a new base version build!
// export const cpVersion = null; // Set this to null for a new base version build!
export const cpVersion = packageJson.cpVersion; // Must have a version number if differ from base version
// npx npm run codepush:deploy -- --description="Build 1.11.1: "

const GetVersionString = () =>
  `v${
    isString(cpVersion) && cpVersion.length > 0
      ? `${cpVersion} (Base: v${baseVersion})`
      : baseVersion
  }${
    isString(commit) && commit.length > 0 ? ' (' + commit.slice(0, 8) + ')' : ''
  }`;

export default GetVersionString;

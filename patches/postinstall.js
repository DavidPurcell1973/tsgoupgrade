// Copied from https://github.com/facebook/react-native/issues/25325
// fix_metro_android_release_bug.js
// Temporary fix for this issue: https://github.com/facebook/metro/pull/420
const fs = require('fs');

console.log('Running post install patches...');

let fileLocation = './node_modules/metro/src/DeltaBundler/Serializers/getAssets.js';
let targetText = 'getJsOutput(module).type === "js/module/asset"';
let replacementText = 'getJsOutput(module).type === "js/module/asset" && path.relative(options.projectRoot, module.path) !== "package.json"';

let fileContent = fs.readFileSync(fileLocation, 'utf8');

if (
  fileContent.includes(targetText)
  && !fileContent.includes(replacementText)
) {
  const patchedFileContent = fileContent.replace(targetText, replacementText);
  fs.writeFileSync(fileLocation, patchedFileContent, 'utf8');
}

// https://github.com/n4kz/react-native-material-dropdown/issues/220
// node_modules\react-native-material-dropdown\src\components/index.js

fileLocation = './node_modules/react-native/react.gradle';
targetText = '// Set up inputs and outputs so gradle can cache the result';
replacementText = `
    doLast {
  def moveFunc = { resSuffix ->
  File originalDir = file("$buildDir/generated/res/react/release/drawable-\${resSuffix}");
  if (originalDir.exists()) {
    File destDir = file("$buildDir/../src/main/res/drawable-\${resSuffix}");
    ant.move(file: originalDir, tofile: destDir);
  }
}
  def moveRawFunc = { resSuffix ->  // Added my Chris
  File originalDir = file("$buildDir/generated/res/react/release/\${resSuffix}");
  if (originalDir.exists()) {
    File destDir = file("$buildDir/../src/main/res/\${resSuffix}");
    ant.move(file: originalDir, tofile: destDir);
  }
}
  moveFunc.curry("ldpi").call()
  moveFunc.curry("mdpi").call()
  moveFunc.curry("hdpi").call()
  moveFunc.curry("xhdpi").call()
  moveFunc.curry("xxhdpi").call()
  moveFunc.curry("xxxhdpi").call()
  moveRawFunc.curry("raw").call() // Added my Chris
}

// Set up inputs and outputs so gradle can cache the result`;

fileContent = fs.readFileSync(fileLocation, 'utf8');

if (
  fileContent.includes(targetText)
  && !fileContent.includes(replacementText)
) {
  const patchedFileContent = fileContent.replace(targetText, replacementText);
  fs.writeFileSync(fileLocation, patchedFileContent, 'utf8');
}

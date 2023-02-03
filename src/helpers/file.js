import fs from 'react-native-fs';
import logger from './logger';
import {displayDialog} from './utils';

export const ensureDirectoryExists = async (fullPath) => {
  try {
    await fs.mkdir(fullPath);
    logger.info(`Ensure directory ${fullPath} exists success`);
  } catch (error) {
    logger.error(error);
    console.error(error);
    displayDialog(
      'Error',
      `Unable to create directory on device! Message: ${error}`,
    );
  }
};

export const copyFile = async (sourcePath, destPath, options) => {
  try {
    await fs.copyFile(sourcePath, destPath, options);
    logger.info(`Written ${destPath}`);
  } catch (error) {
    logger.error(error);
    displayDialog(
      'Error',
      `Unable to copy file to ${destPath}! Message: ${error}`,
    );
  }
};

export const writeFile = async (filePath, content, type) => {
  try {
    await fs.writeFile(filePath, content, type || 'utf8');
    logger.info(`Written ${filePath}`);
  } catch (error) {
    logger.error(error);
    displayDialog(
      'Error',
      `Unable to save file to ${filePath}! Message: ${error}`,
    );
  }
};

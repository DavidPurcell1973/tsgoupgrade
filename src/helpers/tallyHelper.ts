import camelcaseKeys from 'camelcase-keys';
import {compact, uniqBy, toNumber} from 'lodash';
import logger from './logger';

interface Tally {
  Length: string;
  Quantity: number;
}

export const parseTallyString = (
  tallyString: string,
  delimiter = ' ',
  separator = '/',
) => {
  let tally: Tally[] = [];
  if (tallyString.includes('/')) {
    tallyString = tallyString.trim().replace(/  /g, ' ');
    try {
      tally = tallyString.split(delimiter).map((e) => ({
        Length: parseFloat(e.split(separator)[1]).toFixed(1),
        Quantity: toNumber(e.split(separator)[0]),
      }));
      tally = uniqBy(tally, 'length');
    } catch (error) {
      logger.error(error).catch();
    }
    return compact(camelcaseKeys(tally));
  } else return [];
};

export const getTallyQuantityByLength = (tally = [], length) => {
  // console.log(tally);
  // console.log(length);
  const foundTally = tally.filter(
    (e) => e.length.toString() === length.toString(),
  );
  // console.log(foundTally);
  if (foundTally.length > 0) return foundTally[0].quantity;
  else return null;
};

export const getTallyLengths = (tally = []) => {
  return tally.map((e) => e.length);
};

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useMemo, useState} from 'react';
import HoneywellScanner from 'react-native-honeywell-scanner-v2';
import logger from '../helpers/logger';

const useHoneywellScanner = (props: any) => {
  const {
    onBarcodeReadSuccess = () => {
      logger.warn('no handler defined');
    },
    enabled = true,
    screen = 'undefined',
    data = {},
  } = props;
  const [claimed, setClaimed] = useState(false);
  const isFocused = useIsFocused();
  const memoizedData = useMemo(() => data, [data]);

  const logPrefix = `[${screen}] `;

  useEffect(() => {
    if (HoneywellScanner.isCompatible) {
      // logger.debug('Found Honeywell scanner!');
      if (enabled) {
        if (isFocused) {
          // Reclaiming so that onBarcodeReadSuccess has new data...
          // if not reclaiming, onBarcodeReadSuccess may not have new data...

          // if (!claimed) {
          logger.debug(`${logPrefix}Claiming Honeywell scanner...`);

          HoneywellScanner.startReader().then((isClaimed: boolean) => {
            setClaimed(isClaimed);
            logger.info(
              `${logPrefix}Honeywell scanner is ${
                isClaimed ? 'claimed' : 'NOT claimed'
              }!`,
            );
            HoneywellScanner.onBarcodeReadSuccess((event: any) => {
              logger.debug(
                `${logPrefix} Honeywell scanner read "${
                  event.data
                }" ${JSON.stringify(memoizedData)}`,
              );

              onBarcodeReadSuccess(event.data, memoizedData);
            });
          });
          // }
          // if (claimed) {
          //   logger.debug(
          //     `${logPrefix}Honeywell scanner is claimed, attempting to release...`,
          //   );
          //   HoneywellScanner.stopReader().then(() => {
          //     logger.info(`${logPrefix}Honeywell scanner released!`);
          //     HoneywellScanner.offBarcodeReadSuccess();
          //     setClaimed(false);
          //   });
          // }

          // return () => {
          //   HoneywellScanner.stopReader().then(() => {
          //     logger.debug(`${logPrefix}Honeywell scanner released!`);
          //     HoneywellScanner.offBarcodeReadSuccess();
          //     setClaimed(false);
          //   });
          // };
        } else {
          if (claimed) {
            try {
              logger.debug(
                `${logPrefix}Honeywell scanner is claimed, attempting to release...`,
              );
              HoneywellScanner.stopReader().then(() => {
                logger.info(`${logPrefix}Honeywell scanner released!`);
                HoneywellScanner.offBarcodeReadSuccess();
              });
            } catch (err) {
              console.error(err);
            }
            setClaimed(false);
          }
        }
      } else {
        logger.info(`Honeywell scanner skipped.`);
        if (claimed) {
          logger.debug(
            `${logPrefix}Honeywell scanner is claimed, attempting to release...`,
          );
          HoneywellScanner.stopReader().then(() => {
            logger.info(`${logPrefix}Honeywell scanner released!`);
            HoneywellScanner.offBarcodeReadSuccess();
            setClaimed(false);
          });
        }
      }
    } else {
      logger.info('Not using a Honeywell scanner!');
    }
  }, [isFocused, memoizedData]);

  return {
    isScreenFocused: isFocused,
    isClaimed: claimed,
    isCompatible: HoneywellScanner.isCompatible,
  };
};

export default useHoneywellScanner;

import {displayDialogWithOptions, displayToast} from '../../helpers/stringUtils';
import moment from 'moment';
import React, {useMemo, useState, useEffect, useRef} from 'react';
import fs from 'react-native-fs';
//import {promisify} from 'util';
import {parseString, Builder} from 'react-native-xml2js';
import {Text, FlatList, View} from 'react-native';
import urlcat from 'urlcat';
// import { Dropdown } from 'react-native-material-dropdown';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import DropDown from 'react-native-paper-dropdown';
import {TextInput, Divider, Button} from 'react-native-paper';
import {
  setSelectedOperation,
  setSelectedSite,
  setOperations,
  setPurchaseOrder,
  setPackets,
  clearScannedPacks,
} from '../../reducers/itiConsignmentStocktake/itiConsignmentStocktakeReducer';
import styles from './stocktakeStyles';
import InternalTitle from '../../components/title/title';
import StocktakeItem from '../../components/stocktake/stocktakeItem';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {Button as RNEButton} from 'react-native-elements';
import {
  apiTokenSelector,
  apiUrlSelector,
} from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';
import {
  isArray,
  isString,
  find,
  isNil,
  isObject,
  sortBy,
  flatten,
  compact,
  flattenDeep,
  flattenDepth,
  flatMapDeep,
  differenceBy,
} from 'lodash';
import {apiGetAvailableSites} from '../../reducers/itiConsignmentStocktake/itiConsignmentStocktakeReducer';
import {useNavigation} from '@react-navigation/native';
import camelcaseKeys from 'camelcase-keys';
import {ensureDirectoryExists, writeFile} from '../../helpers/file';

const StocktakeListScreen = (props) => {
  const dispatch = useDispatch();
  const {appStore, itiConsignmentStocktakeStore} = useSelector(
    (state) => state,
  );
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const {username} = appStore;
  const [showDropdownSites, setShowDropdownSites] = useState(false);
  const [showDropdownOperations, setShowDropdownOperations] = useState(false);
  const {
    isRefreshing,
    selectedSite,
    operations,
    selectedOperation,
    sites,
    scannedPackets,
    purchaseOrder,
    serverPackets,
  } = itiConsignmentStocktakeStore;
  const apiToken = useSelector(apiTokenSelector, shallowEqual);

  const navigation = useNavigation();
  const memoizedOperations = useMemo(() => {
    return operations;
  }, [operations]);
  const memoizedPackets = useMemo(() => serverPackets, [serverPackets]);
  const memoizedHasScannedPackets = useMemo(() => {
    if (isArray(scannedPackets) && scannedPackets.length > 0) {
      if (!memoizedHasScannedPackets) return true;
      // else return false;
    } else return false;
  }, [scannedPackets]);

  const handleExportPressed = () => {
    displayDialogWithOptions('Confirmation', 'Are you ready to Export?', {
      success: () => {
        (async () => {
          try {
            const packets = [
              // ...serverPackets,
              ...differenceBy(
                serverPackets,
                camelcaseKeys(scannedPackets, {pascalCase: true}),
                'PacketNo',
              ),
              ...camelcaseKeys(scannedPackets, {pascalCase: true}),
            ];
            const json = {
              Packets: {
                Operation: selectedOperation,
                PurchaseOrder: purchaseOrder,
                Packet: packets,
              },
            };
            const body = new Builder().buildObject(json);

            try {
              const downloadDirectoryPath = `${fs.DownloadDirectoryPath}/com.timbersmart.tsgo/consignmentStocktake`;
              const snapshotFullPath = `${downloadDirectoryPath}/snapshot-${moment().format(
                'YYYYMMDDHHmm',
              )}.xml`;
              await ensureDirectoryExists(downloadDirectoryPath);
              await writeFile(snapshotFullPath, body);
              await logger.info(`Saved ${snapshotFullPath}`);
            } catch (err) {
              await logger.error(err);
            }

            const site = await getCurrentSite();

            displayToast('Uploading...');
            const response = await fetch(urlcat(`${site.upload}`), {
              method: 'POST',
              body,
              headers: {'Content-Type': 'text/xml'},
            });
            // console.log(response);

            const {status, statusText} = response;
            if (status === 200) {
              logger.info(
                `Successfully export operation ${selectedOperation} to ${site.upload}`,
              );
              displayToast('Upload complete');
            } else {
              logger.warn(
                `Export failed - Operation: ${selectedOperation} URL: ${site.upload} PO: ${purchaseOrder}`,
              );
              displayToast(`Upload failed - ${statusText}`);
            }
          } catch (err) {
            await logger.error(err);
          }

          // resetStocktake();
        })();
      },
      negative: () => {},
      dismiss: () => {},
      buttons: {
        positiveText: 'Confirm',
        negativeText: 'Cancel',
      },
    });
  };

  const handleStartScanningPressed = () => {
    navigation.navigate('ITIConsignmentStocktakePack');
  };

  const resetStocktake = async () => {
    loadSites();
    dispatch(clearScannedPacks());
    dispatch(setPurchaseOrder(''));
    dispatch(setSelectedOperation(null));
    dispatch(setPackets([]));
    dispatch(setOperations([]));
  };

  const handleResetPressed = () => {
    displayDialogWithOptions('Confirmation', 'Are you sure to reset this?', {
      success: () => {
        resetStocktake();
      },
      negative: () => {},
      dismiss: () => {},
      buttons: {
        positiveText: 'Confirm',
        negativeText: 'Cancel',
      },
    });
  };

  const memoizedSites = useMemo(
    () => sites.map((e) => ({label: e.name, value: e.name})),
    [sites],
  );

  const loadSites = async () => {
    if (apiUrl && apiToken) {
      dispatch(apiGetAvailableSites(apiUrl, apiToken, username));
    } else logger.warn('API URL and token cannot be empty.');
  };

  const getCurrentSite = async () => {
    if (isString(selectedSite) && selectedSite.length > 0) {
      try {
        const site = find(sites, (sites) => sites.name === selectedSite);
        return site;
      } catch (err) {
        logger.error(err);
      }
    }
    return null;
  };

  useEffect(() => {
    (async () => {
      const site = await getCurrentSite();

      if (site && isString(site.download) && site.download.length > 0) {
        try {
          logger.info(`Downloading ${urlcat(site.download)}...`);
          const response = await fetch(urlcat(`${site.download}`), {
            method: 'POST',
            body: 'Operations',
            headers: {'Content-Type': 'text/xml'},
          });
          const operations = await response.text();
          if (response.status === 200) {
            const parseStringAsync = promisify(parseString);
            const xml = await parseStringAsync(operations, {
              explicitArray: false,
            });
            if (isNil(xml) || !isObject(xml)) {
              logger.warn(`Unable to parse XML... ${JSON.stringify(response)}`);
              logger.debug(xml);
            } else {
              const parsedOperations = isArray(xml.Operations.Operation)
                ? xml.Operations.Operation.map((e) => ({
                    value: e.Code,
                    label: `${e.Name} (${e.Code})`,
                  }))
                : [];
              dispatch(
                setOperations(sortBy(compact(parsedOperations), 'label')),
              );
            }
          } else {
            logger.debug(operations);
          }
        } catch (err) {
          const errorMessage = `Error when retrieving operations for ${selectedSite}`;
          displayToast(errorMessage);
          logger.warn(errorMessage);
          logger.error(err);
          dispatch(setOperations([]));
        }
      }
    })();
  }, [selectedSite]);

  useEffect(() => {
    (async () => {
      if (
        selectedOperation &&
        isString(selectedOperation) &&
        selectedOperation.length > 0
      ) {
        try {
          const site = await getCurrentSite();
          const operationFile = {Packets: {Operation: selectedOperation}};
          const bodyString = new Builder().buildObject(operationFile);
          logger.info(
            `Downloading ${urlcat(site.download)} with body ${JSON.stringify(
              bodyString,
            )}...`,
          );
          const response = await fetch(urlcat(`${site.download}`), {
            method: 'POST',
            body: bodyString,
            headers: {'Content-Type': 'text/xml'},
          });
          const packets = await response.text();
          if (response.status === 200) {
            const parseStringAsync = promisify(parseString);
            const xml = await parseStringAsync(packets, {explicitArray: false});
            if (isNil(xml) || !isObject(xml)) {
              logger.warn(`Unable to parse XML... ${JSON.stringify(response)}`);
              logger.debug(xml);
            } else {
              const parsedOperation = xml.Packets.Operation;
              const parsedPo = xml.Packets.PurchaseOrder;
              const parsedPackets = xml.Packets.Packet;

              if (
                parsedOperation.toLowerCase() ===
                selectedOperation.toLowerCase()
              ) {
                if (isString(parsedPo) && parsedPo.length > 0)
                  dispatch(setPurchaseOrder(parsedPo));
                dispatch(setPackets(parsedPackets));
              } else {
                dispatch(setPackets([]));
                logger.warn(
                  `Operation ${selectedOperation} does not match server reply`,
                );
              }
            }
          } else {
            logger.debug(packets);
            dispatch(setPackets([]));
          }
        } catch (err) {
          logger.error(err);
          dispatch(setPackets([]));
        }
      }
    })();
  }, [selectedOperation]);

  // console.log(
  //   isArray(memoizedPackets) &&
  //     memoizedPackets.length > 0 &&
  //     !isNil(selectedOperation),
  // );

  // const renderItem = ({item}) => (
  //   <StocktakeItem item={{...item, hasPendingChanges, activeStocktakeId}} />
  // );

  useEffect(() => {
    loadSites();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.taskContainer}>
        <InternalTitle
          text="Consignment Stocktake"
          description="This is a OFFLINE Consignment Stocktake."
        />
        {sites.length > 0 ? (
          <>
            <DropDown
              label="Sites"
              value={selectedSite || ''}
              setValue={(site) => {
                logger.info(`Selected ${site}`);
                dispatch(setSelectedSite(site));
              }}
              visible={showDropdownSites}
              showDropDown={() => setShowDropdownSites(true)}
              onDismiss={() => setShowDropdownSites(false)}
              list={memoizedSites}
            />
            {isArray(memoizedOperations) && memoizedOperations.length > 0 && (
              <DropDown
                label="Operations"
                value={selectedOperation || ''}
                setValue={(operation) => {
                  logger.info(`Selected ${operation}`);
                  dispatch(setSelectedOperation(operation));
                }}
                visible={showDropdownOperations}
                showDropDown={() => setShowDropdownOperations(true)}
                onDismiss={() => setShowDropdownOperations(false)}
                list={memoizedOperations}
              />
            )}
          </>
        ) : (
          <View
            style={{
              display: 'flex',
              marginTop: 50,
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Text>No Sites found</Text>
          </View>
        )}
        {selectedOperation &&
          isArray(memoizedPackets) &&
          memoizedPackets.length > 0 &&
          !isNil(selectedOperation) && (
            <>
              <Divider style={{marginTop: 10, marginBottom: 10}} />
              <TextInput
                label="Purchase Order"
                value={purchaseOrder}
                onChangeText={(text) => {
                  dispatch(setPurchaseOrder(text));
                }}
              />
              <Divider style={{marginTop: 10, marginBottom: 10}} />
              <Text>
                There are total of {serverPackets.length} packets for operation{' '}
                {selectedOperation}. First five packets are{' '}
                {serverPackets
                  .slice(0, 5)
                  .map((p) => p.PacketNo)
                  .join(', ')}
                .
              </Text>
              <Divider style={{marginTop: 10, marginBottom: 10}} />
            </>
          )}
        <Divider style={{marginTop: 10, marginBottom: 10}} />
        <RNEButton
          icon={
            <Icon
              name="undo"
              style={{marginRight: 10}}
              size={15}
              color="white"
            />
          }
          // iconContainerStyle={{marginRight: 20, paddingRight: 20}}
          buttonStyle={styles.shortButtonStyle}
          containerStyle={styles.buttonContainerStyle}
          title="RESET"
          onPress={() => handleResetPressed()}
        />
        {isArray(memoizedOperations) && memoizedOperations.length > 0 && (
          <>
            <Divider style={{marginTop: 10, marginBottom: 10}} />
            {/* <Button
                          icon="barcode-scan"
                          mode="contained"
                          onPress={() => handleStartScanningPressed()}>
                          Start Scanning
                        </Button> */}
            <RNEButton
              // buttonStyle={{width: 100}}
              // containerStyle={{
              //   ...styles.buttonContainerStyle,
              //   marginLeft: 30,
              // }}
              icon={
                <Icon
                  name="barcode"
                  style={{marginRight: 10}}
                  size={15}
                  color="white"
                />
              }
              // iconContainerStyle={{marginRight: 20, paddingRight: 20}}
              buttonStyle={styles.shortButtonStyle}
              containerStyle={styles.buttonContainerStyle}
              title="START SCANNING"
              onPress={() => handleStartScanningPressed()}
            />
          </>
        )}
        {memoizedHasScannedPackets && (
          <>
            <Divider style={{marginTop: 10, marginBottom: 10}} />
            {/* <Button
                        icon="export"
                        mode="contained"
                        onPress={() => handleExportPressed()}>
                        Export
                      </Button> */}
            <RNEButton
              // buttonStyle={{width: 100}}
              // containerStyle={{
              //   ...styles.buttonContainerStyle,
              //   marginLeft: 30,
              // }}
              icon={
                <Icon
                  name="file-export"
                  style={{marginRight: 10}}
                  size={15}
                  color="white"
                />
              }
              // iconContainerStyle={{marginRight: 20, paddingRight: 20}}
              buttonStyle={styles.shortButtonStyle}
              containerStyle={styles.buttonContainerStyle}
              title="EXPORT"
              onPress={() => handleExportPressed()}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default StocktakeListScreen;

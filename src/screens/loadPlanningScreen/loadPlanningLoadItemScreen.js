import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {isArray, isString, orderBy} from 'lodash';
import {Button, Divider, Icon, Overlay} from 'react-native-elements';
import styles from './loadPlanningStyles';
import Title from '../../components/title/title';
import {
  clearLoadItems,
  clearUnknownPacks,
  clearVerifyPacks,
  loadLoadItems,
  saveLoadItems,
} from '../../reducers/loadPlanning/loadPlanningReducer';
// import ScrollableCard from '../../components/scrollableCard/scrollableCard';
import ScrollableCard from '../../components/scrollableCard/scrollableCardWithCompactView';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import {displayToast} from '../../helpers/utils';
import logger from '../../helpers/logger';
import TwoColumnsDataGrid from '../../components/twoColumnsDataGrid';

const LoadPlanningLoadItemScreen = (props) => {
  const dispatch = useDispatch();
  const {appStore, loadPlanningStore} = useSelector((state) => state);
  const {
    token: apiToken,
    username,
    deviceInfo: {androidId, deviceName},
  } = appStore;
  const {loadItems, refreshing} = loadPlanningStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const navigation = useNavigation();
  const {route} = props;
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  // const memoizedLoadItems = useMemo(
  //   () =>
  //     orderBy(loadItems, ['priority', 'customerName', 'orderNo', 'orderItem']),
  //   [loadItems],
  // );
  // Use SQL to sort items rather than inside code
  const memoizedLoadItems = useMemo(() => loadItems, [loadItems]);

  const headers = [
    {accessor: 'Load#', label: 'Load #'},
    {accessor: 'Load', label: 'Load Name'},
    {accessor: 'Date', label: 'Date'},
    {accessor: 'Customers', label: 'Customer'},
    {accessor: 'To pick', label: 'To pick'},
    {accessor: 'Picked', label: 'Picked'},
    {accessor: 'Notes', label: 'Notes'},
    {accessor: 'Carrier', label: 'Carrier'},
    {accessor: 'PickUp', label: 'Pick Up?'},
    {accessor: 'Truck', label: 'Truck'},
    {accessor: 'Weight', label: 'Weight'},
    {accessor: 'Weight Picked', label: 'Weight Picked'},
    {accessor: 'Completed', label: 'Completed'},
    // {accessor: 'isPicked', label: 'Fully picked?'},
  ];

  const loadLoadItemsAsync = async () => {
    dispatch(loadLoadItems({apiUrl, apiToken, loadID: route.params.id}));

    // try {
    //   const response = await fetch(
    //     `${apiUrl}/api/LoadPlanning/LoadItems?LoadID=${route.params.id}`,
    //     {
    //       method: 'GET',
    //       headers: {
    //         Authorization: `Bearer ${apiToken}`,
    //       },
    //     },
    //   );
    //
    //   if (response?.status === 200) {
    //     let newData = [];
    //     const data = await response.json();
    //     if (isArray(data)) newData = data;
    //     else newData = newData.concat(data);
    //
    //     if (newData.length > 0) {
    //       dispatch(saveLoadItems(newData));
    //     } else {
    //       const message = `Unable to find Load ID ${route.params.id}`;
    //       await logger.warn(message);
    //       displayToast(message);
    //       navigation.pop();
    //     }
    //   } else {
    //     await logger.warn('Unable to load Consignments');
    //     displayToast('Unable to load Consignments');
    //   }
    // } catch (error) {
    //   await logger.error(error);
    //   displayToast('Unable to load Consignments');
    // }
  };

  useEffect(() => {
    dispatch(clearLoadItems());
    logger.debug(
      `${username} (${deviceName} or ${androidId}) on Load ${route.params.id} Consignment screen`,
    );
    loadLoadItemsAsync();
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 0,
          flexDirection: 'row',
          // borderWidth: 1,
          // borderColor: 'blue',
        }}>
        <Title
          text={
            memoizedLoadItems.length > 0 && memoizedLoadItems[0] !== undefined
              ? `Load ${memoizedLoadItems[0].loadId}`
              : 'Loading...'
          }
          description="Pick a load item"
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            // borderWidth: 1,
            // borderColor: 'red',
            marginTop: 10,
            marginRight: 10,
          }}>
          <View style={{margin: 5}}>
            <TouchableOpacity
              onPress={() => {
                dispatch(clearVerifyPacks());
                dispatch(clearUnknownPacks());
                navigation.navigate('LoadPlanningLoadVerification', {
                  load: route.params,
                  loadItems: memoizedLoadItems,
                });
                // if (memoizedLoadItems.filter((e) => !e.isPicked).length === 0)
                //   navigation.navigate('LoadPlanningLoadVerification', {
                //     load: route.params,
                //     loadItems: memoizedLoadItems,
                //   });
                // else {
                //   playBadSound();
                //   displayToast(
                //     'Please finish picking before verifying packs',
                //     5000,
                //   );
                // }
              }}>
              <Icon name="check" size={40} type="material" />
            </TouchableOpacity>
          </View>
          <View style={{margin: 5}}>
            <TouchableOpacity
              onPress={() => {
                setIsHeaderVisible(true);
              }}>
              <Icon name="assignment" size={40} type="material" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {memoizedLoadItems.length > 0 && memoizedLoadItems[0] !== undefined ? (
        <ScrollableCard
          data={memoizedLoadItems.map((e) => ({
            id: e.loadConsignmentId,
            Product: e.productDescription,
            Customer: e.customerName,
            Packs: `${e.packsPicked}/${e.packs}`,
            Picked: e.packsPicked,
            'To Pick': e.packs,
            UOM: e.orderUOM,
            'Order No': e.orderNo,
            'Order Item': e.orderItem,
            'Weight Picked': e.weightPicked,
            'Cube Picked': e.cubePicked,
            Bin: e.binPacketNo,
            Notes: e.notes,
            'Despatch Notes': e.despatchNotes,
            'Internal Notes': e.internalNotes,
            Reserved: e.reserved,
            Oldest:
              e.oldest.split(':').length > 1
                ? e.oldest.split(':')[1].trim()
                : e.oldest,
            LoadID: route.params.id,
            IsPicked: e.isPicked,
            'Notes?': isString(e.despatchNotes || e.internalNotes || e.notes)
              ? 'Yes'
              : 'No',
          }))}
          styles={{rowItem: {maxWidth: 120}}}
          compactFields={['Product', 'Packs', 'Notes?']}
          hiddenItem={['LoadID', 'IsPicked']}
          nextScreen="LoadPlanningLoadItemScanPack"
          onRefresh={() => {
            loadLoadItemsAsync();
          }}
          refreshing={refreshing}
          navigation={navigation}
          enableHighlightItem
          highlightItemPropName="IsPicked"
        />
      ) : (
        []
      )}
      <Overlay
        isVisible={isHeaderVisible}
        onBackdropPress={() => setIsHeaderVisible(false)}
        overlayStyle={styles.queueContainerStyle}>
        <>
          {/* <ScrollView> */}
          <Button
            // buttonStyle={styles.buttonStyle}
            buttonStyle={styles.wideButtonStyle}
            containerStyle={styles.buttonContainerStyle}
            title="Continue"
            onPress={() => {
              setIsHeaderVisible(false);
            }}
          />
          <Divider style={{marginTop: 10, marginBottom: 10}} />
          <TwoColumnsDataGrid
            title="Load Details"
            headers={headers}
            hidden={['id', 'isPicked']}
            data={route.params}
          />
          {/* </ScrollView> */}
        </>
      </Overlay>
      <Button
        buttonStyle={styles.wideButtonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Back"
        onPress={() => {
          navigation.pop();
        }}
      />
    </View>
  );
};

export default LoadPlanningLoadItemScreen;

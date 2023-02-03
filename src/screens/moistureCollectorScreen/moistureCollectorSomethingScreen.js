import React, { useEffect, useMemo, useState, useRef } from 'react';
import { FlatList, View } from 'react-native';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import isArray from 'lodash/isArray';
import { orderBy } from 'lodash';
import styles from './moistureCollectorStyles';
import Title from '../../components/title/title';
import { loadProcesses, loadKilns, loadPositions, addMoistureToArray, sendMoisture, replaceMoistureArray, updateMoistureArrayElement } from '../../reducers/moistureCollector/moistureCollectorReducer';
import { apiUrlSelector } from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';
import { Dropdown } from 'react-native-material-dropdown-no-proptypes';
import { Card, Button, Input, Text } from 'react-native-elements';
import ScrollableCard from '../../components/scrollableCard/scrollableCard';
import { useNavigation } from '@react-navigation/native';
import { Menu, Divider, Provider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Alert } from 'react-native';

//import Parse from 'parse/react-native'

const MoistureSomethingScreen = (props) => {

  const dispatch = useDispatch();
  const { appStore, moistureCollectorStore } = useSelector((state) => state);
  const { token: apiToken, alternativeAppNames, username } = appStore;
  const navigation = useNavigation();
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const { processes, kilns, positions, moistureArrayData, meanHighLimit, meanLowLimit, stdDevHighLimit, stdDevLowLimit } = moistureCollectorStore;
  const [selected, setSelected] = useState('');
  const [menuItemSelected, setMenuItemSelected] = useState('');
  const [kilnSelected, setKilnSelected] = useState('');
  const [positionSelected, setPositionSelected] = useState('');
  const [packetNo, setPacketNo] = useState('');
  const [moisture, setMoisture] = useState('');
  const [stdDev, setStdDev] = useState('');
  const { refreshing } = moistureCollectorStore;

  const packetNoInputRef = useRef();
  const menuInputRef = useRef();
  const moistureInputRef = useRef();
  const stdDevInputRef = useRef();

  //var kilnData;
  //logger.debug('HEY LOOK AT ME processes:' + JSON.stringify(processes));

  const processData = useMemo(() => {
    logger.debug('HEY LOOK AT ME :' + JSON.stringify(processes));
    let newArray = processes.map((item) => {
      return { key: item.processId, value: item.processDisplay }
    })
    logger.debug('Processes datas:' + JSON.stringify(processData));
    return newArray;

  }, [processes]);

  const kilnData = useMemo(() => {
    logger.debug('Kilns datas:' + JSON.stringify(kilns));
    let newArray = kilns.map((item) => {
      return { key: item.kilnId, value: item.kilnName }
    })
    logger.debug('New Array datas:' + JSON.stringify(newArray));
    logger.debug('Kilns datas:' + JSON.stringify(kilnData));

    return newArray;

  }, [kilns]);

  const onChangeProcess = (value) => {
    logger.debug(`Process Dropdown value changed to ${value}`);
    setSelected(value);
  };

  const onChangeKiln = (value) => {
    logger.debug(`Kiln Dropdown value changed to ${value}`);
    setKilnSelected(value);
  };

  const onChangePosition = (value) => {
    logger.debug(`Dropdown value changed to ${value}`);
    setPositionSelected(value);
  };

  const positionData = useMemo(() => {
    logger.debug('Position s datas:' + JSON.stringify(positions));
    let newArray = positions.map((item) => {
      return { key: item.positionId, value: item.positionName }
    })
    //Set Data Variable
    //setPositionData(newArray)
    logger.debug('Position datas:' + JSON.stringify(positionData));

    return newArray;

  }, [positions]);

  const [showMenu, setShowMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 })

  const openMenu = () => setShowMenu(true);
  const closeMenu = () => setShowMenu(false);

  function addMoistureClick() {
    var newID;
    var moistureNumber;
    var stdDevNumber;

    if (moistureArrayData && moistureArrayData.length > 0) {
      try {
        newID = Math.max(...moistureArrayData.map(moisture => moisture.localID)) + 1;
      } catch {
        newID = 1
      }
    }
    else {
      newID = 1
    }
    logger.debug('New Id: ' + newID)
    logger.debug('Add moisture')
    let newArray = moistureArrayData.slice();

    if (packetNo == "") {
      alert('Please enter Packet No');
      packetNoInputRef.current.focus();
      return;
    }

    if (moisture == "") {
      alert('Please enter Moisture%')
      return;
    }
    else {
      try {
        moistureNumber = Number(moisture);
      } catch {
        alert('Moisture% must be a valid number')
      }
    }

    if (stdDev == "") {
      alert('Please enter Standard Deviation')
      return;
    }
    else {
      try {
        stdDevNumber = Number(stdDev);
      } catch {
        alert('Standard Deviation must be a valid number')
      }
    }

    if (moistureNumber > meanHighLimit || moistureNumber < meanLowLimit) {
      //alert(JSON.stringify(moistureInputRef));
      alert('Moisture percant not within the specified limit. High: ' + meanHighLimit + ' Low: ' + meanLowLimit);
      moistureInputRef.current.focus();
      return;
    }

    if (stdDevNumber > stdDevHighLimit || stdDevNumber < stdDevLowLimit) {
      stdDevInputRef.current.focus();
      alert('Standard deviation not within the specified limit. High: ' + stdDevHighLimit + ' Low: ' + stdDevLowLimit);
      return;
    }

    // for (const item of processes) {
    //   if (item.processId == selected) {
    //     processName = item.processDisplay;
    //   }
    // }

    const selectedProcessIDArray = processData.filter(
      (e) => e.value == selected,
    );

    const selectedProcessID = selectedProcessIDArray[0].key

    const selectedKilnIDArray = kilnData.filter(
      (e) => e.value == kilnSelected,
    );

    const selectedKilnID = selectedKilnIDArray[0].key

    const selectedPositionIDArray = positionData.filter(
      (e) => e.value == positionSelected,
    );

    const selectedPositionID = selectedPositionIDArray[0].key

    const moistureArray = {
      'localID': newID,
      'moistureId': 0,
      'moisture': moisture,
      'stdDev': stdDev,
      'processId': selectedProcessID,
      'process': selected,
      'packetNo': packetNo,
      'uploaded': false,
      'kilnId': selectedKilnID,
      'positionId': selectedKilnID,
      'uAction': 'N',
      'measuredBy': username,
      'uploadFailed': false,
      'uploadError': ""
    };
    newArray.push(moistureArray);
    //Set Data Variable
    //setMoistureArrayData(newArray)
    dispatch(addMoistureToArray(moistureArray));

    stdDevInputRef.current.clear();
    moistureInputRef.current.clear();
    packetNoInputRef.current.clear();
    setSelected(null);
    setKilnSelected(null);
    setPositionSelected(null);

    logger.debug('New Array' + JSON.stringify(newArray))
    logger.debug('Store' + JSON.stringify(moistureArrayData))
    //let moisture = new Parse.Object('Moisture');
    //moisture.set('moistureId',1)
  }



  function uploadMoisturesClick() {
    for (let i = 0; i < moistureArrayData.length; i++) {
      logger.debug(i + ' moisture ah ah ah ah')
      let moistureToSend = moistureArrayData[i]

      if ((moistureToSend.uploaded == false) && ((moistureToSend.moistureId == 0) || (moistureToSend.uAction == "U"))) {
        logger.debug('send moisture ' + JSON.stringify(moistureToSend))
        dispatch(sendMoisture(moistureToSend, apiUrl, apiToken));
      }
    }
  }

  function clearCompleted() {
    const uncompletedMoistures = moistureArrayData.filter(
      (e) => e.uploaded === false,
    );

    dispatch(replaceMoistureArray(uncompletedMoistures));
    closeMenu();
  }

  function clearPending() {
    Alert.alert(
      'Confirm',
      'Are you sure you want to clear pending data?',
      [
        {
          text: 'Cancel',
          onPress: () => { null },
        },
        {
          text: 'Confirm',
          onPress: () => {
            const uncompletedMoistures = moistureArrayData.filter(
              (e) => e.uploaded === true,
            );

            dispatch(replaceMoistureArray(uncompletedMoistures));
          },
        },
      ],
      { cancelable: false },
    );
    closeMenu();
  }

  function clearAll() {

    Alert.alert(
      'Confirm',
      'Are you sure you want to clear All data?',
      [
        {
          text: 'Cancel',
          onPress: () => { null },
        },
        {
          text: 'Confirm',
          onPress: () => {
            dispatch(replaceMoistureArray([]));
          },
        },
      ],
      { cancelable: false },
    );
    closeMenu();
  }

  function refreshDropdowns() {
    dispatch(loadProcesses(apiUrl, apiToken));
    dispatch(loadKilns(apiUrl, apiToken));
    dispatch(loadPositions(apiUrl, apiToken));
    closeMenu();
  }

  useEffect(() => {
    logger.debug('Reffrshh da sctuff.');
    refreshDropdowns();
  }, []);

  const onIconPress = (event) => {
    const { nativeEvent } = event;
    const anchor = {
      x: nativeEvent.pageX,
      y: nativeEvent.pageY,
    };
    setMenuAnchor(anchor);
    openMenu();
  }

  function goToConfig() {
    navigation.navigate('MoistureConfigScreen');
    closeMenu();
  }


  return (

    <View style={styles.container}>
      <View style={styles.greenStyle}>

        <View style={{ flex: 2 }}>
          <Title
            text={'Moisture Collector'}
            description="Choose a process to start"
          />
        </View>
        <View style={styles.hamburgerMenuPosition}>
          {/* <Label Text='options'/> */}
          <Icon
            style={styles.hamburgerMenu}
            name="bars"
            size={24}
            onPress={onIconPress}
          />
          <Menu
            visible={showMenu}
            onDismiss={closeMenu}
            anchor={menuAnchor}
          >
            <Menu.Item onPress={() => { goToConfig() }} title="Config" />
            <Menu.Item onPress={() => { refreshDropdowns() }} title="Refresh App" />
            <Menu.Item onPress={() => { clearCompleted() }} title="Clear Completed" />
            <Menu.Item onPress={() => { clearPending() }} title="Clear Pending" />
            <Menu.Item onPress={() => { clearAll() }} title="Clear All" />
          </Menu>
        </View>
      </View>
      <Dropdown
        label={'Select Process'}
        containerStyle={styles.runDropdownStyle}
        data={processData}
        value={selected}
        onChangeText={onChangeProcess}
        animationDuration={50}
        itemCount={8}
        itemPadding={10}
      />
      <Input
        blurOnSubmit={false}
        onChangeText={(text) => {
          setPacketNo(text);
        }}
        label="Packet No"
        value={packetNo}
        ref={packetNoInputRef}
        // placeholder="Enter Row name here"
        onSubmitEditing={() => {
          //if (preCountInputRef.current) preCountInputRef.current.focus();
        }}
        labelStyle={styles.labelStyle}
        autoCapitalize="none"
        autoCompleteType="off"
        autoCorrect={false}
        containerStyle={styles.inputStyle}
        placeholderTextColor="gray"
      />
      <View style={styles.blueStyle}>
        <View style={{ flex: 1 }}>
          <Input
            blurOnSubmit={false}
            onChangeText={(text) => {
              setMoisture(text);
            }}
            label="Moisture%:"
            value={moisture}
            ref={moistureInputRef}
            // placeholder="Enter Row name here"
            onSubmitEditing={() => {
              //if (preCountInputRef.current) preCountInputRef.current.focus();
            }}
            labelStyle={styles.labelStyle}
            autoCapitalize="none"
            autoCompleteType="off"
            autoCorrect={false}
            containerStyle={styles.inputStyle}
            placeholderTextColor="gray"
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            blurOnSubmit={false}
            onChangeText={(text) => {
              setStdDev(text);
            }}
            label="StdDev:"
            value={stdDev}
            ref={stdDevInputRef}
            // placeholder="Enter Row name here"
            onSubmitEditing={() => {
              //if (preCountInputRef.current) preCountInputRef.current.focus();
            }}
            labelStyle={styles.labelStyle}
            autoCapitalize="none"
            autoCompleteType="off"
            autoCorrect={false}
            containerStyle={styles.inputStyle}
            placeholderTextColor="gray"
            keyboardType="numeric"
          />
        </View>
      </View>
      <View >
        <View style={styles.greenStyle}>
          <View style={{ flex: 1 }}>
            <Dropdown
              label={'Select Kiln'}
              containerStyle={styles.runDropdownStyle}
              data={kilnData}
              value={kilnSelected}
              onChangeText={onChangeKiln}
              animationDuration={50}
              itemCount={8}
              itemPadding={10}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Dropdown
              label={'Select Position'}
              containerStyle={styles.runDropdownStyle}
              data={positionData}
              value={positionSelected}
              onChangeText={onChangePosition}
              animationDuration={50}
              itemCount={8}
              itemPadding={10}
            />
          </View>
        </View>
        <View style={styles.buttonsRow}>
          <View style={{ flex: 1 }}>
            <Button
              buttonStyle={styles.shortButtonStyle}
              containerStyle={styles.buttonContainerStyle}
              title="Add"
              onPress={() => {
                addMoistureClick()
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              buttonStyle={styles.shortButtonStyle}
              containerStyle={styles.buttonContainerStyle}
              title="Upload"
              onPress={() => {
                uploadMoisturesClick()
              }}
            />
          </View>
        </View>
      </View>
      <View style={styles.redStyle}>
        {isArray(moistureArrayData) &&
          moistureArrayData.length > 0 && (
            <ScrollableCard
              data={moistureArrayData.map((e) => ({
                id: e.localID,
                'localID': e.localID,
                'moistureId': e.moistureId,
                'Packet No': e.packetNo,
                'Process': e.process,
                'Moisture%': e.moisture,
                'uploaded': e.uploaded,
                'Upload Error': e.uploadError
              }))}
              hiddenItem={['moistureId', 'localID', 'uploaded']}
              nextScreen={'MoistureReviewScreen'}
              onRefresh={() => {
                //refreshLoadsAsync().catch();
              }}
              props={props}
              refreshing={refreshing}
              navigation={navigation}
              enableHighlightItem={true}
              highlightItemPropName="uploaded"
            />
          )}
      </View>
    </View>
  );
};

export default MoistureSomethingScreen;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { connect, shallowEqual, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'react-native-elements';
import styles from './moistureCollectorStyles';
import {
  getMoistures
} from '../../selectors/moistureSelector/moistureSelector';
import TwoColumnsDataGrid from '../../components/twoColumnsDataGrid';
import {
  apiUrlSelector,
  getUserAppConfigValueSelector,
  apiTokenSelector,
} from '../../selectors/common/commonSelector';
import { useNavigation } from '@react-navigation/native';
import { every, find } from 'lodash';
import logger from '../../helpers/logger';
import { deleteMoistureFromArray, updateMoistureArrayElement } from '../../reducers/moistureCollector/moistureCollectorReducer';
import { Input, CheckBox } from 'react-native-elements';
import Title from '../../components/title/title';
import { Dropdown } from 'react-native-material-dropdown-no-proptypes';
import { json } from 'stream/consumers';
//import Checkbox from '@mui/material/Checkbox';


//const { keyedProcesses, keyedKilns, keyedPositions } = moistureCollectorStore;

const MoistureReviewScreen = (props) => {
  const {
    localID
  } = props.route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const apiToken = useSelector(apiTokenSelector, shallowEqual);
  const { appStore, moistureCollectorStore } = useSelector((state) => state);
  const { username } = appStore;
  const { moistureArrayData, processes, kilns, positions, meanHighLimit, meanLowLimit, stdDevHighLimit, stdDevLowLimit } = moistureCollectorStore;

  const [selectedProcess, setSelectedProcess] = React.useState([]);
  const [selectedKiln, setSelectedKiln] = React.useState([]);
  const [selectedPosition, setSelectedPosition] = React.useState([]);


  const packetNoInputRef = useRef();
  const [packetNo, setPacketNo] = useState('');
  const [setProcess, setTheSetProcess] = useState('');
  const [setKiln, setTheSetKiln] = useState('');
  const [setPosition, setTheSetPosition] = useState('');

  const [moisture, setMoisture] = useState('');
  const moistureInputRef = useRef();

  const [stdDev, setStdDev] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploaded, setUploaded] = useState('');
  const stdDevInputRef = useRef();

  const onChangeProcess = (value) => {
    logger.debug(`Process Dropdown value changed to ${value}`);
    setSelectedProcess(value);
  };

  const onChangeKiln = (value) => {
    logger.debug(`Kiln Dropdown value changed to ${value}`);
    setSelectedKiln(value);
  };

  const onChangePosition = (value) => {
    logger.debug(`Dropdown value changed to ${value}`);
    setSelectedPosition(value);
  };

  const processData = useMemo(() => {
    logger.debug('HEY LOOK AT ME :' + JSON.stringify(processes));
    let newArray = processes.map((item) => {
      return { key: item.processId, value: item.processDisplay }
    })
    //Set Data Variable
    //setProcessData(newArray)
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

  const positionData = useMemo(() => {
    logger.debug('Positions datas:' + JSON.stringify(positions));
    let newArray = positions.map((item) => {
      return { key: item.positionId, value: item.positionName }
    })
    logger.debug('Position datas:' + JSON.stringify(positionData));

    return newArray;

  }, [positions]);

  const memoizedMoisture = useMemo(() => {
    if (moistureArrayData && moistureArrayData.length > 0) {
      const allMoistures = moistureArrayData.filter(
        (e) => e.localID == localID,
      );

      if (allMoistures && allMoistures.length > 0) {
        logger.debug('review: ' + localID);
        logger.debug('review' + JSON.stringify(moistureArrayData));
        logger.debug('review all' + JSON.stringify(allMoistures[0]));
        logger.debug('review all packet ' + allMoistures[0].packetNo);
        setPacketNo(allMoistures[0].packetNo);
        setMoisture(allMoistures[0].moisture);
        setStdDev(allMoistures[0].stdDev);
        setUploadError(allMoistures[0].uploadError)
        setUploaded(allMoistures[0].uploaded)

        setTheProcess(allMoistures[0])
        setTheKiln(allMoistures[0])
        setThePosition(allMoistures[0])
        logger.debug('THE SET PROCESS' + JSON.stringify(setProcess));
        logger.debug('THE SET KILN' + JSON.stringify(setKiln));
        return allMoistures[0];
      }
      else {
        return { 'moistureId': '', 'moisture': '', 'stdDev': '', 'processId': '', 'process': '', 'packetNo': '' };
      }
    }
    else {
      return { 'moistureId': '', 'moisture': '', 'stdDev': '', 'processId': '', 'process': '', 'packetNo': '' };
    }
  }, [moistureArrayData]);


  function setTheProcess(memoizedMoisture) {
    logger.debug('set process the moisture ' + JSON.stringify(memoizedMoisture));
    logger.debug('set process all processes ' + JSON.stringify(processData));
    logger.debug('set process id ' + memoizedMoisture.processId);

    if (processData && processData.length > 0) {
      const setProcessArray = processData.filter(
        (e) => e.key == memoizedMoisture.processId,
      );

      logger.debug('Process array ' + JSON.stringify(setProcessArray))

      if (setProcessArray && setProcessArray.length > 0) {
        setTheSetProcess(setProcessArray[0].value)
      }
    }
  }

  function setTheKiln(memoizedMoisture) {
    logger.debug('set kiln the moisture ' + JSON.stringify(memoizedMoisture));
    logger.debug('set kiln all kilns ' + JSON.stringify(kilnData));
    logger.debug('set kiln id ' + memoizedMoisture.kilnId);

    if (kilnData && kilnData.length > 0) {
      const setKilnArray = kilnData.filter(
        (e) => e.key == memoizedMoisture.kilnId,
      );

      if (setKilnArray && setKilnArray.length > 0) {
        logger.debug('set selected kiln ' + setKilnArray);
        setTheSetKiln(setKilnArray[0].value)
      }
    }
  }

  function setThePosition(memoizedMoisture) {
    logger.debug('set Position the moisture ' + JSON.stringify(memoizedMoisture));
    logger.debug('set Position all Position ' + JSON.stringify(positionData));
    logger.debug('set Position id ' + memoizedMoisture.positionId);

    if (positionData && positionData.length > 0) {
      const setPositionArray = positionData.filter(
        (e) => e.key == memoizedMoisture.positionId,
      );

      if (setPositionArray && setPositionArray.length > 0) {
        logger.debug('set selected kiln ' + setPositionArray);
        setTheSetPosition(setPositionArray[0].value)
      }
    }
  }

  function deleteMoistureClick() {
    navigation.pop();
    logger.debug('Store 1' + JSON.stringify(moistureArrayData))
    logger.debug('localID:' + localID)
    dispatch(deleteMoistureFromArray(localID));
    logger.debug('Store 2' + JSON.stringify(moistureArrayData))
  }

  useEffect(() => {
    logger.debug('Reffrshh da sctuff.');
    //getProcesses();
  }, [processes]);

  function refreshMoistureCollector() {
    logger.debug('refreshMoistureCollector():');
    if (apiUrl && apiToken) {
      getProcesses(),
        getKilns(),
        getPositions()
    } else {
      logger.warn('API URL and token cannot be empty.');
    }
  };

  //const yourbutt = useMemo(() => getProcesses(),[processes]);

  function getProcesses() {
    let newArray = processes.map((item) => {
      return { key: item.processId, value: item.processDisplay }
    })
    processData = newArray;
    logger.debug('GEEWIZZ Processes datas:' + JSON.stringify(processData));
  }

  function getKilns() {
    logger.debug('Kilns datas:' + JSON.stringify(kilns));
    let newArray = kilns.map((item) => {
      return { key: item.kilnId, value: item.kilnName }
    })
    kilnData = newArray;
    logger.debug('Kilns datas:' + JSON.stringify(kilnData));
  }

  function getPositions() {
    logger.debug('Positions datas:' + JSON.stringify(positions));
    let newArray = positions.map((item) => {
      return { key: item.positionId, value: item.positionName }
    })
    //Set Data Variable
    //setPositionData(newArray)
    positionData = newArray;
    logger.debug('!!!!!!!!!!!!!!Position data s:' + JSON.stringify(positionData));
  }

  function updateMoistureClick() {
    var processName;
    var moistureNumber;
    var stdDevNumber;

    logger.debug('update moisture')
    logger.debug('update moisture ' + moisture)

    if (packetNo == "") {
      alert('Please enter Packet No')
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

    var selectedProcessID;
    if (selectedProcess == "") {
      selectedProcessID = memoizedMoisture.processId;
      processName = memoizedMoisture.process;
    }
    else {
      processName = selectedProcess;
      const selectedProcessIDArray = processData.filter((e) => e.value == selectedProcess,);
      selectedProcessID = selectedProcessIDArray[0].key;
    }


    var selectedKilnID;
    if (selectedKiln == "") {
      selectedKilnID = memoizedMoisture.kilnId;
    }
    else {
      const selectedKilnIDArray = kilnData.filter((e) => e.value == selectedKiln,);
      selectedKilnID = selectedKilnIDArray[0].key
    }

    var selectedPositionID;
    if (selectedPosition == "") {
      selectedPositionID = memoizedMoisture.positionId;
    }
    else {
      const selectedPositionIDArray = positionData.filter((e) => e.value == selectedPosition,);
      selectedPositionID = selectedPositionIDArray[0].key;
    }


    const moistureElement = {
      'localID': localID,
      'moistureId': 0,
      'moisture': moisture,
      'stdDev': stdDev,
      'processId': selectedProcessID,
      'process': processName,
      'packetNo': packetNo,
      'uploaded': false,
      'kilnId': selectedKilnID,
      'positionId': selectedPositionID,
      'uAction': 'U',
      'measuredBy': memoizedMoisture.measuredBy,
      'uploadFailed': memoizedMoisture.uploadFailed,
      'uploadError': uploadError
    };
    logger.debug('!!!!!!update  moisture ' + JSON.stringify(moistureElement))
    navigation.pop();
    //let moisture = new Parse.Object('Moisture');
    //moisture.set('moistureId',1)
  }



  logger.debug('AGAIN set process ' + JSON.stringify(setProcess))

  return (
    <View style={styles.container}>
      <Title
        text={'Moisture Review: ' + packetNo}
        description="Changes vaules and then press update to update."
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
      <Dropdown
        label={'Select Process'}
        containerStyle={styles.runDropdownStyle}
        data={processData}
        value={setProcess}
        onChangeText={onChangeProcess}
        animationDuration={50}
        itemCount={8}
        itemPadding={10}
      />
      <Dropdown
        label={'Select Kiln'}
        containerStyle={styles.runDropdownStyle}
        data={kilnData}
        value={setKiln}
        onChangeText={onChangeKiln}
        animationDuration={50}
        itemCount={8}
        itemPadding={10}
      />
      <Dropdown
        label={'Select Position'}
        containerStyle={styles.runDropdownStyle}
        data={positionData}
        value={setPosition}
        onChangeText={onChangePosition}
        animationDuration={50}
        itemCount={8}
        itemPadding={10}
      />
      <View style={styles.blueStyle}>
        <View style={{ flex: 1 }}>
          <Input
            blurOnSubmit={false}
            onChangeText={(text) => {
              setMoisture(text);
            }}
            label="Moisture%"
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
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            blurOnSubmit={false}
            onChangeText={(text) => {
              setStdDev(text);
            }}
            label="Standard Deviation"
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
          />
        </View>
      </View>
      <Input
        blurOnSubmit={false}
        onChangeText={(text) => {
          setStdDev(text);
        }}
        label="Uploading Error"
        value={uploadError}
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
        editable={false}
      />
      <CheckBox
        center
        title='Uploaded'
        checked={uploaded}
      />
      <Button
        buttonStyle={styles.shortButtonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Update"
        onPress={() => {
          updateMoistureClick()
        }}
      />
      <Button
        buttonStyle={styles.shortButtonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Delete"
        onPress={() => {
          deleteMoistureClick()
        }}
      />
      <Button
        buttonStyle={styles.buttonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Back"
        onPress={() => {
          navigation.pop();
        }}
      />
    </View>
  );
};




MoistureReviewScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  apiUrl: PropTypes.string,
  apiToken: PropTypes.string,
  localID: PropTypes.number.isRequired
};

export default MoistureReviewScreen;

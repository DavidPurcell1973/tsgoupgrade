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
import {
  updateDeviceName,
  updateDeviceOwner,
  updateBranchID,
  updateBranchName,
  updateLocationID,
  updateLocationName,
  updateMeanHighLimit,
  updateMeanLowLimit,
  updateStdDevHighLimit,
  updateStdDevLowLimit
} from '../../reducers/moistureCollector/moistureCollectorReducer';
import { Input } from 'react-native-elements';
import Title from '../../components/title/title';



const MoistureConfigScreen = (props) => {

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { moistureCollectorStore } = useSelector((state) => state);
  const { deviceName, deviceOwner, branchID, branchName, locationID, locationName, meanHighLimit, meanLowLimit, stdDevHighLimit, stdDevLowLimit } = moistureCollectorStore;

  const [password, setPassword] = React.useState('');
  const passwordInputRef = useRef();

  const [disabled, setDisabled] = React.useState(true);

  const [deviceNameInput, setDeviceName] = useState('');
  const deviceNameInputRef = useRef();

  const [deviceOwnerInput, setDeviceOwner] = useState('');
  const deviceOwnerInputRef = useRef();

  const [branchIDInput, setBranchID] = useState('');
  const branchIDInputRef = useRef();

  const [branchNameInput, setBranchName] = useState('');
  const branchNameInputRef = useRef();

  const [locationIDInput, setLocationID] = useState('');
  const locationIDInputRef = useRef();

  const [locationNameInput, setLocationName] = useState('');
  const locationNameInputRef = useRef();

  const [meanHighLimitInput, setMeanHighLimit] = useState('');
  const meanHighLimitInputRef = useRef();

  const [meanLowLimitInput, setMeanLowLimit] = useState('');
  const meanLowLimitInputRef = useRef();

  const [stdDevHighLimitInput, setStdDevHighLimit] = useState('');
  const stdDevHighLimitInputRef = useRef();

  const [stdDevLowLimitInput, setStdDevLowLimit] = useState('');
  const stdDevLowLimitInputRef = useRef();


  const checkPassword = () => {
    logger.debug("CheckPassword")
    logger.debug("Password: " + password)
    if (password == 'T1mber') {
      setDisabled(false)
    }
  }

  const updateMoistureStoreConfig = () => {
    logger.debug('devicename: ' + deviceNameInput);
    dispatch(updateDeviceName(deviceNameInput));
    dispatch(updateDeviceOwner(deviceOwnerInput));
    dispatch(updateBranchID(branchIDInput));
    dispatch(updateBranchName(branchNameInput));
    dispatch(updateLocationID(locationIDInput));
    dispatch(updateLocationName(locationNameInput));
    dispatch(updateMeanHighLimit(meanHighLimitInput));
    dispatch(updateMeanLowLimit(meanLowLimitInput));
    dispatch(updateStdDevHighLimit(stdDevHighLimitInput));
    dispatch(updateStdDevLowLimit(stdDevLowLimitInput));
  }

  useEffect(() => {
    setDeviceName(deviceName);
    setDeviceOwner(deviceOwner);
    setBranchID(branchID);
    setBranchName(branchName);
    setLocationID(locationID);
    setLocationName(locationName);
    setMeanHighLimit(meanHighLimit);
    setMeanLowLimit(meanLowLimit);
    setStdDevHighLimit(stdDevHighLimit);
    setStdDevLowLimit(stdDevLowLimit);
  }, []);

  return (
    <View style={styles.container}>
      <Title
        text={'Moisture App Configuration: '}
        description="Enter the password then press Change to enable controlsvalues and then press save."
      />
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 3 }}>
          <Input
            id="passwordInput"
            blurOnSubmit={false}
            onChangeText={(text) => {
              setPassword(text);
            }}
            label="Enter Password"
            value={password}
            ref={passwordInputRef}
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
          <Button
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            title="Change"
            onPress={() => {
              checkPassword();
            }}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Input
            id="deviceNameInput"
            blurOnSubmit={false}
            onChangeText={(text) => {
              setDeviceName(text);
            }}
            label="Device Name"
            value={deviceNameInput}
            ref={deviceNameInputRef}
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
            disabled={disabled}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            id="deviceOwnerInput"
            blurOnSubmit={false}
            onChangeText={(text) => {
              setDeviceOwner(text);
            }}
            label="Device Owner"
            value={deviceOwnerInput}
            ref={deviceOwnerInputRef}
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
            disabled={disabled}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Input
            id="branchIDInput"
            blurOnSubmit={false}
            onChangeText={(text) => {
              setBranchID(text);
            }}
            label="Branch ID"
            value={branchIDInput}
            ref={branchIDInputRef}
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
            disabled={disabled}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            id="branchNameInput"
            blurOnSubmit={false}
            onChangeText={(text) => {
              setBranchName(text);
            }}
            label="Branch Name"
            value={branchNameInput}
            ref={branchNameInputRef}
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
            disabled={disabled}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Input
            id="locationIDIDInput"
            blurOnSubmit={false}
            onChangeText={(text) => {
              setLocationID(text);
            }}
            label="Location ID"
            value={locationIDInput}
            ref={locationIDInputRef}
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
            disabled={disabled}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            id="locationNameInput"
            blurOnSubmit={false}
            onChangeText={(text) => {
              setLocationName(text);
            }}
            label="Location Name"
            value={locationNameInput}
            ref={locationNameInputRef}
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
            disabled={disabled}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Input
            id="meanHighLimitInput"
            blurOnSubmit={false}
            onChangeText={(text) => {
              setMeanHighLimit(text);
            }}
            label="Mean High Limit"
            value={meanHighLimitInput}
            ref={meanHighLimitInputRef}
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
            disabled={disabled}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            id="meanLowLimitInput"
            blurOnSubmit={false}
            onChangeText={(text) => {
              setMeanLowLimit(text);
            }}
            label="Mean Low Limit"
            value={meanLowLimitInput}
            ref={meanLowLimitInputRef}
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
            disabled={disabled}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Input
            id="stdDevHighLimitInput"
            blurOnSubmit={false}
            onChangeText={(text) => {
              setStdDevHighLimit(text);
            }}
            label="Std Dev High Limit"
            value={stdDevHighLimitInput}
            ref={stdDevHighLimitInputRef}
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
            disabled={disabled}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            id="stdDevLowLimitInput"
            blurOnSubmit={false}
            onChangeText={(text) => {
              setStdDevLowLimit(text);
            }}
            label="Std Dev Low Limit"
            value={stdDevLowLimitInput}
            ref={stdDevLowLimitInputRef}
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
            disabled={disabled}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Button
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            title="Save"
            onPress={() => {
              logger.debug('save')
              updateMoistureStoreConfig();
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            title="Back"
            onPress={() => {
              navigation.pop();
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default MoistureConfigScreen;

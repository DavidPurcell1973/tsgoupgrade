import React, {useMemo, useEffect, useRef, useState} from 'react';
import {Button, Input} from 'react-native-elements';
import {View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Dropdown} from 'react-native-material-dropdown-no-proptypes';
import styles from './stocktakeStyles';
import {addRowToStocktake} from '../../reducers/stocktake/stocktakeReducer';
import Title from '../../components/title/title';
import {filteredLocationsSelector} from '../../selectors/stocktake/stocktakeSelector';
import {displayToast} from '../../helpers/utils';
import {useFocusEffect} from '@react-navigation/native';
import {rowsSelector} from '../../selectors/stocktake/stocktakeSelector';
import {playGoodSound, playBadSound} from '../../components/common/playSound';
import {orderBy, toNumber, isString, isNumber} from 'lodash';
import AutoComplete from '../../components/AutoComplete/AutoComplete';

const StocktakeAddRowScreen = (props) => {
  const dispatch = useDispatch();
  const stocktakeStore = useSelector((state) => state.stocktakeStore);
  const {products} = stocktakeStore;
  const locations = useSelector(filteredLocationsSelector, shallowEqual);
  const {
    route: {
      params: {stocktakeId},
    },
    navigation,
  } = props;
  const rowNameInputRef = useRef();
  const preCountInputRef = useRef();
  const typeInputRef = useRef();
  const [rowInput, setRowInput] = useState('');
  const [preCount, setPreCount] = useState(0);
  const [type, setType] = useState('pack');
  const [locationId, setLocationId] = useState(-1);
  const rows = useSelector((state) => rowsSelector(state, props));
  const types = [
    {label: 'Pack', value: 'pack'},
    {label: 'Bin', value: 'bin'},
  ];

  const memoizedProducts = useMemo(() => {
    return products;
  }, [products]);
  const memoizedProductLabels = useMemo(() => {
    return orderBy(
      memoizedProducts.map((e) => ({
        label: `${e.productCode}: ${e.productDescription}`,
        value: e.productCode,
      })),
      'label',
    );
  }, [memoizedProducts]);

  const onChangePreCountText = (preCountInput) => {
    let parsedPreCount = toNumber(preCountInput);
    if (isNumber(parsedPreCount) && parsedPreCount > 0) {
      setPreCount(parsedPreCount);
    } else setPreCount(0);
  };

  const onChangeType = (type) => {
    setType(type);
  };

  const onChangeLocation = (locationId) => {
    setLocationId(locationId);
  };

  const memoizedLocations = useMemo(() => {
    return orderBy(locations, 'label');
  }, [locations]);

  useEffect(() => {
    if (locationId < 1)
      setLocationId(locations.length > 0 ? locations[0].value : '');
  }, [memoizedLocations]);

  useEffect(() => {
    rowNameInputRef.current.focus();
  }, []);

  const onSubmit = () => {
    const isRowExists =
      rows.filter(
        (e) =>
          e.rowName.toLowerCase() === rowInput.toLowerCase() &&
          e.stocktakeId === stocktakeId &&
          e.locationId === locationId,
      ).length > 0
        ? true
        : false;

    if (!isRowExists) {
      const data = {
        stocktakeId,
        locationId,
        rowInput,
        preCount,
        type,
      };
      dispatch(addRowToStocktake(data));
      navigation.pop();
    } else {
      displayToast(`Row already exists?`, 5000);
      console.log(`Row already exists? ${rowInput}`);
      playBadSound();
    }
  };

  return (
    <View style={styles.container}>
      <Title text="Add New Row" description="New row will be added queue" />
      {/* <AutoComplete
        data={memoizedProductLabels}
        // maxItems={10}
        label="Product"
      /> */}
      <Dropdown
        label="Location"
        data={memoizedLocations}
        fontSize={20}
        itemCount={10}
        value={locationId}
        itemTextStyle={styles.dropdownTextStyle}
        containerStyle={styles.dropdownStyle}
        onChangeText={onChangeLocation}
      />
      <Dropdown
        label="Type"
        data={types}
        fontSize={20}
        itemCount={2}
        value={type}
        itemTextStyle={styles.dropdownTextStyle}
        containerStyle={styles.dropdownStyle}
        onChangeText={onChangeType}
      />
      <Input
        blurOnSubmit={false}
        onChangeText={(text) => {
          setRowInput(text);
        }}
        label="Row Name"
        value={rowInput}
        ref={rowNameInputRef}
        // placeholder="Enter Row name here"
        onSubmitEditing={() => {
          if (preCountInputRef.current) preCountInputRef.current.focus();
        }}
        labelStyle={styles.labelStyle}
        autoCapitalize="none"
        autoCompleteType="off"
        autoCorrect={false}
        containerStyle={styles.inputStyle}
        placeholderTextColor="gray"
      />
      <Input
        blurOnSubmit={false}
        label="Precount"
        // value={rowInput}
        containerStyle={styles.inputStyle}
        value={preCount.toString()}
        keyboardType="numeric"
        // onFocus={() => setPreCount('')}
        labelStyle={styles.labelStyle}
        ref={preCountInputRef}
        onChangeText={(text) => {
          onChangePreCountText(text);
        }}
        onSubmitEditing={() => {
          if (
            isString(rowInput) &&
            rowInput.length > 0 &&
            // isString(locationId) &&
            locationId > 0
          ) {
            onSubmit();
          } else {
            displayToast('Row name and Location cannot be blank');
            console.log('Row name and Location cannot be blank');
          }
        }}
        // placeholder="(optional)"
        placeholderTextColor="gray"
      />
      <View style={{display: 'flex', flex: 1}}></View>
      <Button
        buttonStyle={styles.shortButtonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Add This Row"
        onPress={() => {
          if (
            isString(rowInput) &&
            rowInput.length > 0 &&
            // isString(locationId) &&
            locationId > 0
          ) {
            onSubmit();
          } else {
            displayToast('Row name and Location cannot be blank');
            console.log('Row name and Location cannot be blank');
          }
        }}
      />
      <Button
        title="Back"
        buttonStyle={styles.shortButtonStyle}
        containerStyle={styles.buttonContainerStyle}
        onPress={() => {
          navigation.pop();
        }}
      />
    </View>
  );
};

export default StocktakeAddRowScreen;

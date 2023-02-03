import {Overlay, Button, ListItem, Text} from 'react-native-elements';
import {FlatList, View, ScrollView, TouchableHighlight} from 'react-native';
import React, {useCallback, useEffect, useState, useRef, useMemo} from 'react';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Title from '../../components/title/title';
import {isArray, isEmpty, isString} from 'lodash';
import TwoColumnsDataGrid from '../twoColumnsDataGrid';
import logger from '../../helpers/logger';

const QuickQueryResultPanel = (props) => {
  const {data, context} = props;

  const buildPanel = () => {
    const {dataType, headers, data: _data, actions} = data;

    const memoizedData = useMemo(() => {
      let result = _data;
      try {
        result = isString(_data) ? JSON.parse(_data) : _data;
      } catch (err) {
        logger.error(err);
      }
      return result;
    }, [_data]);

    switch (dataType) {
      case 'string':
        return (
          <View
            style={{
              flex: 1,
              marginTop: 50,
              //   justifyContent: 'center',
              alignItems: 'center',
              //   alignContent: 'center',
            }}>
            <Text>
              {isString(memoizedData) ? memoizedData : 'Feeling lucky?'}
            </Text>
          </View>
        );
      case 'object':
        let resultKeyAsHeaders: any = headers;

        const convertedData =
          isArray(memoizedData) && memoizedData.length > 0
            ? memoizedData[0]
            : {};

        if (!isArray(headers) || isEmpty(headers)) {
          resultKeyAsHeaders = Object.keys(convertedData).map((k) => ({
            accessor: k,
            label: k,
          }));
        }

        return (
          <>
            <TwoColumnsDataGrid
              title=""
              headers={resultKeyAsHeaders}
              data={convertedData}
              //   style={{}}
            />
          </>
        );
      default:
        break;
    }
  };

  return <>{buildPanel()}</>;
};

export default QuickQueryResultPanel;

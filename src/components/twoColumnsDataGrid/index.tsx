// @ts-ignore
import React from 'react';
import {Text, FlatList, View} from 'react-native';
import styles from './twoColumnsDataGridStyles';
import Title from '../title/title';
import {isString} from 'lodash';
import {isNumber} from 'lodash';
import {toString} from 'lodash';

const TwoColumnsDataGrid = ({
  headers,
  data,
  title,
  hidden = [],
  style = {leftItem: {}, leftText: {}, rightItem: {}, rightText: {}},
  hideUnknownLabel = true,
}) => {
  const dataArray = Object.entries(data);

  const renderItem = ({item}) => {
    const knownLabel = headers.filter((e) => e.accessor === item[0]).length > 0;
    const label = knownLabel
      ? headers.filter((e) => e.accessor === item[0])[0].label
      : 'Unnamed';
    const value =
      isString(item[1]) || isNumber(item[1]) ? toString(item[1]) : '';

    if (hideUnknownLabel && knownLabel) {
      return !hidden.includes(item[0]) &&
        isString(value) &&
        value.toString().length > 0 ? (
        <View style={styles.itemContainer}>
          <View style={{...styles.leftItem, ...(style.leftItem || {})}}>
            <Text style={{...styles.leftText, ...(style.leftText || {})}}>
              {label + ' '}
            </Text>
          </View>
          <View style={{...styles.rightItem, ...(style.rightItem || {})}}>
            <Text style={{...styles.rightText, ...(style.rightText || {})}}>
              {value}
            </Text>
          </View>
        </View>
      ) : (
        <></>
      );
    }
    return <></>;
  };

  return (
    <View style={styles.container}>
      {title.length > 0 ? <Title text={title} /> : null}
      <FlatList
        data={dataArray}
        renderItem={renderItem}
        keyExtractor={(item) => `${item[0]}`}
      />
    </View>
  );
};

export default TwoColumnsDataGrid;

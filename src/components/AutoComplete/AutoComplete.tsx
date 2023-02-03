import * as React from 'react';
import {FlatList, ScrollView, TouchableOpacity, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {Input, ListItem} from 'react-native-elements';
import {useState, useMemo} from 'react';
import styles from './AutoCompleteStyles';
import {useEffect} from 'react';
import {isNil, compact, uniq, every, method, isArray} from 'lodash';

const AutoComplete = (props) => {
  const [input, setInput] = useState('');
  // const [value, setValue] = useState('');
  const [showList, setShowList] = useState(false);
  const {
    label = 'Input',
    placeholder = '',
    data = [],
    containerStyle = {},
    listContainerStyle = {},
    labelStyle = {},
    placeholderTextColor = 'lightgray',
    maxItems = 3,
    maxHeight = null,
    setValue: setOutput = () => {},
    description,
    isOptional = false,
    onFocus = () => {},
    ref,
  } = props;

  const maxItemCount = 50;
  const memoizedData = useMemo(() => data, [data]);

  // useEffect(() => {
  //   if (input.length === 0) setShowList(true);
  // }, [input]);

  const memoizedFilteredData = useMemo(() => {
    let filteredData = [];
    if (!isNil(input)) {
      const filterWordList = uniq(compact(input.toLowerCase().split(' ')));
      memoizedData.forEach((e: any) => {
        const found = every(filterWordList, (w) => {
          return e.label.toLowerCase().includes(w);
        });
        if (found) filteredData.push(e);
      });

      setShowList(true);
      if (maxHeight) return filteredData.slice(0, maxItemCount);
      return filteredData.slice(0, maxItems);
    }
    if (maxHeight) return memoizedData.slice(0, maxItemCount);
    return memoizedData.slice(0, maxItems);
  }, [input]);

  const setSelection = (selection: string) => {
    if (selection) {
      const search = memoizedData.filter(
        (e: any) => e.label.toLowerCase() === selection.toLowerCase(),
      );
      if (search.length > 0) {
        setInput(search[0].label);
        setOutput(search[0].value);
      }
    }
    setTimeout(() => {
      setShowList(false);
    }, 1000);
  };

  const onInputFocus = () => {
    setShowList(true);
    setInput('');
  };

  const onInputBlur = () => {
    setSelection(input);
  };

  return (
    <View
      style={{
        ...styles.containerStyle,
      }}>
      <TextInput
        // style={styles.textInputContainer}
        dense
        ref={ref}
        mode="flat"
        key={label}
        onFocus={() => {
          onInputFocus();
          if (onFocus) onFocus();
        }}
        blurOnSubmit={false}
        label={`${label}${!isOptional ? '*' : ''}`}
        onChangeText={(text) => setInput(text)}
        keyboardType={'default'}
        value={input}
        placeholder={description ? `${description}` : label}
        // containerStyle={{...styles.inputContainerStyle, ...containerStyle}}
        // labelStyle={{...styles.inputLabelStyle, ...labelStyle}}
        placeholderTextColor={placeholderTextColor}
        onBlur={() => onInputBlur()}
      />
      {showList &&
        isArray(memoizedFilteredData) &&
        memoizedFilteredData.length > 0 && (
          <View
            style={{
              ...styles.listContainerStyle,
              maxHeight,
              ...listContainerStyle,
            }}>
            <ScrollView>
              {memoizedFilteredData.map((e) => (
                <ListItem
                  key={e.label}
                  bottomDivider
                  onPress={() => {
                    setSelection(e.label);
                  }}>
                  <ListItem.Content>
                    <ListItem.Title>{e.label}</ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              ))}
            </ScrollView>
            {/* <FlatList
              scrollEnabled
              data={memoizedFilteredData}
              keyExtractor={(e) => e.label}
              renderItem={({item}) => {
                return (
                  <ListItem
                    key={item.label}
                    bottomDivider
                    onPress={() => {
                      setSelection(item.label);
                    }}>
                    <ListItem.Content>
                      <ListItem.Title>{item.label}</ListItem.Title>
                    </ListItem.Content>
                  </ListItem>
                );
              }}
            /> */}
          </View>
        )}
    </View>
  );
};

export default AutoComplete;

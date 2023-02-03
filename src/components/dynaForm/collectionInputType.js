import { TextInput } from 'react-native-paper';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, Overlay, Text } from 'react-native-elements';
import isArray from 'lodash/isArray';
import styles from '../../screens/dynaFormScreen/dynaFormStyles';
import CollectionListItem from './collectionListItem';

const CollectionInputType = (props) => {
  const [showEntries, setShowEntries] = useState(false);
  const {
    e,
    onChangeTextHandler,
    refs,
    i,
    validateBeforeMoveFocusOrAddToQueue,
    setValues,
    values,
    collections,
    setCollections,
  } = props;

  if (collections.length === 0) setShowEntries(false);

  return (
    <View>
      <TextInput
        // containerStyle={styles.textInputContainer}
        style={styles.textInputContainer}
        dense
        ref={refs[i]}
        mode="flat"
        key={e.name}
        onFocus={() => {
          if (!e.autoClearOnFocus) return;
          const newValues = { ...values };
          delete newValues[e.name];
          setValues(newValues);
        }}
        blurOnSubmit={false}
        label={`${e.name}${!e.isOptional ? '*' : ''}`}
        onChangeText={(text) => {
          onChangeTextHandler(e, text);
        }}
        keyboardType={e.keyboardType || 'default'}
        value={values[e.name] || ''}
        placeholder={e.description ? `${e.description}` : e.name}
        placeholderTextColor="gray"
        onSubmitEditing={() => {
          validateBeforeMoveFocusOrAddToQueue(e);
        }}
      />
      {isArray(collections[e.name]) && collections[e.name].length > 0 ? (
        <>
          <Overlay
            isVisible={showEntries}
            onBackdropPress={() => setShowEntries(false)}
            overlayStyle={styles.queueContainerStyle}
          >
            <FlatList
              data={collections[e.name]}
              renderItem={(props) => (
                <CollectionListItem
                  collections={collections}
                  setCollections={setCollections}
                  e={e}
                  {...props}
                />
              )}
              keyExtractor={(item) => `${item}`}
              extraData={setValues}
            />
          </Overlay>
          <Button
            style={styles.buttonStyle}
            type="clear"
            title={`Show ${collections[e.name].length} entries`}
            onPress={() => setShowEntries(true)}
          />
        </>
      )
        : <Text>0 entries</Text>}
    </View>
  );
};

export default CollectionInputType;

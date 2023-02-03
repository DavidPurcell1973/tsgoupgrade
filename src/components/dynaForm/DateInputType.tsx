import React, {useState} from 'react';
import {View} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {TextInput} from 'react-native-paper';
import {format} from 'date-fns';
import styles from './DateInputTypeStyles';

const DateInputType = (props) => {
  const {
    name,
    label,
    onFocus = () => {},
    onChange = () => {},
    ref,
    value,
    isOptional = true,
  } = props;
  const pickerMode = 'date';
  const [showPicker, setShowPicker] = useState(false);
  const formattedValue = value ? format(new Date(value), 'yyyy-MM-dd') : '';

  return (
    <View
      style={
        {
          // borderColor: 'black',
          // borderStyle: 'solid',
          // borderWidth: 1,
        }
      }
      key={name}>
      <TextInput
        mode="flat"
        ref={ref}
        label={`${label}${!isOptional ? '*' : ''}`}
        style={styles.textInputContainer}
        // disabled
        onFocus={() => {
          setShowPicker(true);
          onFocus();
        }}
        dense
        value={formattedValue}
      />
      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          mode={pickerMode}
          value={new Date(value || Date.now())}
          display="default"
          onChange={(event, selectedDate) => {
            onChange(selectedDate);
            setShowPicker(false);
          }}
        />
      )}
    </View>
  );
};
export default DateInputType;

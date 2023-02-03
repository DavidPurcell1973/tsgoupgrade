import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text, View } from 'react-native';
import styles from '../../styles/styles';

const TaskItem = React.memo(({ item, onPress }) => (
  <View key={item.uuid} style={styles.taskItemContainer}>
    <TouchableOpacity onPress={() => onPress()}>
      <Text style={styles.taskItemTitleText}>{item.taskDescription}</Text>
    </TouchableOpacity>
  </View>
));

TaskItem.propTypes = {
  item: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default TaskItem;

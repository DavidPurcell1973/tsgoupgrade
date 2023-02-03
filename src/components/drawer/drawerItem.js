import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const DrawerItem = ({ iconName, onPress, onLongPress }) => (
  <TouchableOpacity
    style={{ paddingHorizontal: 20 }}
    onPress={onPress}
    onLongPress={onLongPress}
  >
    <Icon name={iconName} size={20} color="#fff" />
  </TouchableOpacity>
);

DrawerItem.defaultProps = {
  onLongPress: null,
};

DrawerItem.propTypes = {
  iconName: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  onLongPress: PropTypes.func,
};

export default DrawerItem;

import React from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import { Text, View } from 'react-native';
import styles from '../../styles/styles';

const Title = ({ text, description }) => (
  <View style={styles.titleContainer}>
    <Text style={styles.titleTextStyle}>{text}</Text>
    {!isEmpty(description) ? (
      <Text style={styles.descriptionTextStyle}>{description}</Text>
    ) : null}
  </View>
);

Title.defaultProps = {
  description: null,
};

Title.propTypes = {
  text: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default Title;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SmartScanTaskItemContainer from './smartScanTaskItemScreenContainer';

class SmartScanTaskItemScreen extends Component {
  render() {
    // console.log(this.props);
    const {
      route: { params: task },
      navigation,
    } = this.props;

    return (
      <SmartScanTaskItemContainer
        navigation={navigation}
        taskGuid={task.taskGuid}
        taskType={task.taskType}
      />
    );
  }
}

SmartScanTaskItemScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default SmartScanTaskItemScreen;

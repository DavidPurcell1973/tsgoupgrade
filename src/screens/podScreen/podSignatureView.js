import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, Text, Modal, Platform} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import SignatureCapture from 'react-native-signature-capture';

const toolbarHeight = Platform.select({
  android: 0,
  ios: 22,
});

const modalViewStyle = {
  paddingTop: toolbarHeight,
  flex: 1,
};

class PODSignatureView extends Component {
  static propTypes = {
    onSave: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };
  }

  show(display) {
    this.setState({visible: display});
  }

  render() {
    const {visible} = this.state;

    return (
      <Modal
        transparent={false}
        visible={visible}
        onRequestClose={this.onRequestClose.bind(this)}>
        <View style={modalViewStyle}>
          <View style={{padding: 10, flexDirection: 'row'}}>
            <Text onPress={this._onPressClose.bind(this)}>{' x '}</Text>
            <View style={{flex: 1, alignItems: 'center'}}>
              <Text style={{fontSize: 14}}>Please write your signature.</Text>
            </View>
          </View>
          <SignatureCapture
            style={{flex: 1, width: '100%'}}
            maxSize={640}
            viewMode={'landscape'}
            saveImageFileInExtStorage={false}
            onDragEvent={this._onDragEvent.bind(this)}
            onSaveEvent={this._onSaveEvent.bind(this)}
          />
        </View>
      </Modal>
    );
  }

  _onPressClose() {
    Orientation.lockToPortrait();
    this.show(false);
  }

  onRequestClose() {
    Orientation.lockToPortrait();
    this.show(false);
  }

  _onDragEvent() {
    // This callback will be called when the user enters signature
    // console.log('dragged');
  }

  _onSaveEvent(result) {
    //result.encoded - for the base64 encoded png
    //result.pathName - for the file path name

    Orientation.lockToPortrait();
    this.props.onSave && this.props.onSave(result);
  }
}

export default PODSignatureView;

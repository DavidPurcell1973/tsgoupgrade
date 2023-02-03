import React, {Component} from 'react';
import {Alert, View} from 'react-native';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Button, Input, Text} from 'react-native-elements';
import styles from './mergePackToBinStyles';
import Title from '../../components/title/title';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import {
  apiMergePackToBin,
  clearAllDetails,
  getMergePackDetails,
  updatePackNoInput,
} from '../../reducers/processing/processingReducer';

class MergePackToBinScanPackScreen extends Component {
  constructor(props) {
    super(props);
    this.packToMergeRef = React.createRef();
  }

  clearInput = () => {
    setTimeout(() => {
      if (this.packToMergeRef.current !== null) {
        this.packToMergeRef.current.clear();
      }
    }, 100);
  };

  clearAllDetails = () => {
    const {clearAllDetails: doClearAllDetails} = this.props;
    doClearAllDetails();
  };

  getMergePackDetails = () => {
    const {
      apiUrl,
      apiToken,
      input,
      getMergePackDetails: doGetMergePackDetails,
    } = this.props;
    doGetMergePackDetails(apiUrl, apiToken, input);
    setTimeout(() => {
      if (this.packToMergeRef.current !== null) {
        this.packToMergeRef.current.clear();
      }
    }, 100);
  };

  componentDidMount() {
    setTimeout(() => {
      if (this.packToMergeRef.current !== null) {
        this.packToMergeRef.current.focus();
      }
    }, 100);
  }

  onMergePackButtonPressed = () => {
    const {packNo, binPacketNo} = this.props;
    Alert.alert(
      'Are you sure?',
      `Merge ${packNo} to Bin ${binPacketNo}`,
      [
        {
          text: 'Cancel',
          onPress: () => null,
        },
        {
          text: 'Confirm',
          onPress: () => {
            this.mergePackToBin();
            this.clearInput();
            this.clearAllDetails();
          },
        },
      ],
      {cancelable: false},
    );
  };

  mergePackToBin = () => {
    const {
      apiUrl,
      apiToken,
      packNo,
      binPacketNo,
      apiMergePackToBin: doApiMergePackToBin,
    } = this.props;

    if (binPacketNo && binPacketNo.length > 0) {
      doApiMergePackToBin(apiUrl, apiToken, packNo, binPacketNo);
    }
  };

  onChangeText = packNo => {
    const {updatePackNoInput: doUpdatePackNoInput} = this.props;
    doUpdatePackNoInput(packNo);
  };

  render() {
    const {binPacketNo, location, binSuffix, productCode, packNo} = this.props;
    return (
      <View style={styles.container}>
        <Title text="Merge Pack To Bin" description="Scan pack to merge" />
        <Input
          ref={this.packToMergeRef}
          blurOnSubmit={false}
          onChangeText={packNo => {
            this.onChangeText(packNo);
          }}
          placeholder="Scan pack here"
          containerStyle={styles.inputContainerStyle}
          placeholderTextColor="gray"
          onSubmitEditing={() => {
            this.getMergePackDetails();
          }}
        />
        <View style={styles.tableColumnStyle}>
          <View style={styles.tableRowStyle}>
            <View style={styles.tableCellStyle}>
              <Text style={styles.tableCellRowHeaderStyle}>Packet No:</Text>
            </View>
            <View style={styles.tableCellStyle}>
              <Text>{packNo}</Text>
            </View>
          </View>
          <View style={styles.tableRowStyle}>
            <View style={styles.tableCellStyle}>
              <Text style={styles.tableCellRowHeaderStyle}>Bin Packet No:</Text>
            </View>
            <View style={styles.tableCellStyle}>
              <Text>{binPacketNo}</Text>
            </View>
          </View>
          <View style={styles.tableRowStyle}>
            <View style={styles.tableCellStyle}>
              <Text style={styles.tableCellRowHeaderStyle}>Product Code:</Text>
            </View>
            <View style={styles.tableCellStyle}>
              <Text>{productCode}</Text>
            </View>
          </View>
          <View style={styles.tableRowStyle}>
            <View style={styles.tableCellStyle}>
              <Text style={styles.tableCellRowHeaderStyle}>Location:</Text>
            </View>
            <View style={styles.tableCellStyle}>
              <Text>{location}</Text>
            </View>
          </View>
          <View style={styles.tableRowStyle}>
            <View style={styles.tableCellStyle}>
              <Text style={styles.tableCellRowHeaderStyle}>Bin Suffix:</Text>
            </View>
            <View style={styles.tableCellStyle}>
              <Text>{binSuffix}</Text>
            </View>
          </View>
        </View>
        <Button
          buttonStyle={styles.shortButton}
          disabled={!binPacketNo || binPacketNo.length === 0 ? true : false}
          title="Merge"
          onPress={this.onMergePackButtonPressed}
        />
      </View>
    );
  }
}

MergePackToBinScanPackScreen.defaultProps = {
  productCode: '',
  location: '',
  binSuffix: '',
  binPacketNo: '',
  transactionDate: '',
};

MergePackToBinScanPackScreen.propTypes = {
  productCode: PropTypes.string,
  location: PropTypes.string,
  binSuffix: PropTypes.string,
  binPacketNo: PropTypes.string,
  transactionDate: PropTypes.string,
  apiUrl: PropTypes.string.isRequired,
  apiToken: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  productCode: state.processingStore.productCode,
  location: state.processingStore.location,
  binSuffix: state.processingStore.binSuffix,
  binPacketNo: state.processingStore.binPacketNo,
  transactionDate: state.processingStore.transactionDate,
  packNo: state.processingStore.packNo,
  input: state.processingStore.input,
  apiUrl: apiUrlSelector(state),
  apiToken: state.appStore.token,
});

const mapDispatchToProps = {
  updatePackNoInput,
  getMergePackDetails,
  apiMergePackToBin,
  clearAllDetails,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MergePackToBinScanPackScreen);

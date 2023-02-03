import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  cardStyle: { backgroundColor: 'white' },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 0,
    paddingBottom: 5,
    alignContent: 'center',
  },
  labelStyle: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 12,
    color: '#999999',
  },
  shortButtonStyle: {
    borderRadius: 5,
    width: '100%',
    // width: 150,
  },
  redStyle: {
    borderRadius: 5,
    width: '100%',
    height: '45%',
    // width: 150,
  },
  blueStyle: {
    borderRadius: 5,
    width: '100%',
    flexDirection: "row"
    // width: 150,
  },
  greenStyle: {
    borderRadius: 5,
    width: '100%',
    flexDirection: 'row'
    // width: 150,
  },
  hamburgerMenu: {
    color: '#3498db',
    alignContent: 'flex-end',
    padding: 15
  },
  buttonsRow: {
    borderRadius: 5,
    width: '100%',
    flexDirection: 'row'
    // width: 150,
  },
  buttonContainerStyle: {
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
    // borderWidth: 10,
    // borderColor: 'black',
  },
  inputStyle: {
    // borderWidth: 1,
    // borderColor: 'black',
    // paddingTop: 15,
    // paddingBottom: -20,
    // paddingLeft: 5,
    // paddingRight: 5,
    // marginTop: 5,
    marginBottom: -10,
    // flex: 1,
    // verticalAlign: 'bottom',
  },
  dropdownBorderStyle: {
    borderBottomWidth: 1,
    borderRadius: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    // borderWidth: 1,
    // borderColor: 'red',
    marginTop: 10,
    // width: 100,
    // paddingTop: 5,
    paddingBottom: 15,
    paddingLeft: 10,
    paddingRight: 5,
    // verticalAlign: 'bottom',
  },
  buttonStyle: {
    borderRadius: 10,
    width: 200,
  },
  runDropdownStyle: {
    // borderWidth: 0,
    // borderColor: 'black',
    // width: 100,
    // paddingTop: 5,
    // paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    // verticalAlign: 'bottom',
  },
  shortButton: {
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#3498db',
    borderWidth: 1,
    borderColor: 'red',
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
  },
  rightSwipeItem: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  smartScanInputContainer: {
    flex: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  smartScanListContainer: {
    flex: 1,
    flexDirection: 'column',
    // justifyContent: 'flex-start',
    // borderWidth: 1,
    // borderColor: 'red',
  },
  subtitleView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 5,
  },
  subtitleText: {
    color: 'grey',
  },
});

export const colors = {
  primary: '#3498db',
  // secondary: '#ddd',
};

export default styles;


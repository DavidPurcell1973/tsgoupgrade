import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
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
  textBold: {
    fontWeight: 'bold',
  },
  textCenter: {
    textAlign: 'center',
  },
  dropDetailsContainer: {
    padding: 5,
    marginRight: 2,
    marginLeft: 2,
    marginTop: 10,
    marginBottom: 5,
  },
  buttonStyle: {
    borderRadius: 10,
    width: 300,
  },
  buttonContainerStyle: {
    // flex: 0,
    alignItems: 'center',
    // paddingHorizontal: 50,
    // borderWidth: 1,
    // borderColor: 'black',
    // borderStyle: 'solid',
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  signature: {
    flex: 1,
    borderColor: 'red',
    borderWidth: 1,
  },
  runDropdownStyle: {
    borderWidth: 0,
    borderColor: 'black',
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

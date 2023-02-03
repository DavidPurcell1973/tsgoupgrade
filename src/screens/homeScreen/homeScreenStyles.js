import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  titleTextStyle: {marginTop: 5, color: 'white'},
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 0,
    paddingBottom: 5,
    // backgroundColor: 'red',
    alignContent: 'center',
  },
  iconViewContainer: {
    flex: 1,
    flexDirection: 'row',
    // borderWidth: 1,
    // borderColor: 'red',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    // marginLeft: 10,
    // marginRight: 10,
  },
  imageBackgroundStyle: {
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5,
    marginLeft: 5,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: 'white',
    overflow: 'hidden',
  },
  footerContainerStyle: {
    alignSelf: 'stretch',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 0,
    marginBottom: 0,
  },
  footerTextStyle: {
    textAlign: 'center',
  },
  mainViewContainer: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: 'blue',
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export const colors = {
  primary: '#3498db',
  secondary: '#ddd',
};

export default styles;

import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
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
  loginLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonStyle: {
    borderRadius: 10,
    width: 210,
  },
  optionsButtonStyle: {
    borderRadius: 10,
    width: 150,
  },
  buttonContainerStyle: {
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 3,
    marginRight: 3,
    marginBottom: 5,
    // borderWidth: 1,
    // borderColor: 'black',
  },
  logoStyle: {
    alignSelf: 'center',
    marginBottom: 40,
    marginTop: 30,
  },
  input: {
    marginLeft: 20,
  },
  bottomButtonsStyle: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    // borderColor: 'black',
    // borderWidth: 1,
  },
  inputContainerStyle: {
    flex: 0,
    alignSelf: 'center',
    marginBottom: 5,
    marginTop: 5,
  },
});

export const colors = {
  primary: '#3498db',
  secondary: '#ddd',
};

export default styles;

import {StyleSheet} from 'react-native';

export const colors = {
  primary: '#3498db',
  // secondary: '#ddd',
  header: '#3498db',
};

const styles = StyleSheet.create({
  inputContainerStyle: {
    // width: '80%',
    // borderColor: 'blue',
    // borderWidth: 1,
    // borderStyle: 'solid',
    marginBottom: -25,
    // height: '30%',
  },
  inputLabelStyle: {fontSize: 13, fontStyle: 'normal', fontWeight: '100'},
  containerStyle: {
    // width: '80%',
    // borderColor: 'red',
    // borderStyle: 'solid',
    // borderWidth: 1,
    // height: '30%',
  },
  listContainerStyle: {
    borderRadius: 5,
    borderStyle: 'dashed',
    borderColor: 'purple',
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: 'lightgray',
  },
  inputStyle: {
    // width: '80%',
    // height: '30%',
  },
  textInputContainer: {
    backgroundColor: 'white',
    paddingBottom: 5,
    marginBottom: 5,
    paddingHorizontal: 0,
  },
});

export default styles;

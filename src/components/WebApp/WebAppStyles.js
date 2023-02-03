import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 0,
    padding: 0,
    height: '100%',
    position: 'relative',
  },
  webview: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    // zIndex: -1,
  },
  floatingButtons: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    // zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonContainer: {
    marginBottom: 1,
    marginRight: 1,
  },
});

export const colors = {
  primary: '#3498db',
  // secondary: '#ddd',
};

export default styles;

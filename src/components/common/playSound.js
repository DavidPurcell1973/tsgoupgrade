const Sound = require('react-native-sound');
import logger from '../../helpers/logger';

Sound.setCategory('Playback');

const callback = (error, s) => {
  if (error) {
    logger.error('Unable to play sound ' + error);
    return;
  }
  s.setVolume(1);
  s.play((success) => {
    if (success) {
      // logger.debug('successfully finished playing');
      s.reset();
    } else {
      logger.debug('playback failed due to audio decoding errors');
      s.release();
    }
  });
};

const playGoodSound = () => {
  const sound = new Sound('good.wav', Sound.MAIN_BUNDLE, (error) =>
    callback(error, sound),
  );
};

const playBadSound = () => {
  const sound = new Sound('bad.wav', Sound.MAIN_BUNDLE, (error) =>
    callback(error, sound),
  );
};

module.exports = {
  playGoodSound,
  playBadSound,
};

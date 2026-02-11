import React from 'react';
import {
  Image,
  Platform,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ScrollLayout from '../components/ScrollLayout';

const athleteFocusAppText =
  Platform.OS === 'ios'
    ? 'ZZBest Daily Sport Focus is a space for those who embrace sports as part of their daily lives. ' +
      'The app helps you capture your thoughts after matches, track your athletic spirit, ' +
      'find inspiration, and create your own rhythm without pressure or comparison.'
    : '22Athlete: Daily Sport Focus is a space for those who embrace sports as part of their daily lives. ' +
      'The app helps you capture your thoughts after matches, track your athletic spirit, ' +
      'find inspiration, and create your own rhythm without pressure or comparison.';

const InformationScreen: React.FC = () => {
  const athleteFocusOnShare = async () => {
    try {
      await Share.share({ message: athleteFocusAppText });
    } catch (e) {
      console.warn('share error', e);
    }
  };

  return (
    <ScrollLayout>
      <View style={athleteFocusContainer}>
        <Text style={athleteFocusTitle}>Information</Text>

        <View style={athleteFocusLogoWrap}>
          {Platform.OS === 'ios' ? (
            <Image
              source={require('../assets/images/logo.png')}
              style={athleteFocusLogo}
            />
          ) : (
            <Image
              source={require('../assets/images/icon.png')}
              style={athleteFocusLogo}
            />
          )}
        </View>

        <Text style={athleteFocusDesc}>{athleteFocusAppText}</Text>

        <TouchableOpacity
          style={athleteFocusShareBtn}
          onPress={athleteFocusOnShare}
          activeOpacity={0.9}
        >
          <Image source={require('../assets/images/share.png')} />
        </TouchableOpacity>
      </View>
    </ScrollLayout>
  );
};

export default InformationScreen;

const athleteFocusContainer = {
  flex: 1,
  paddingHorizontal: 18,
  paddingTop: 90,
  alignItems: 'center' as const,
};

const athleteFocusTitle = {
  color: '#fff',
  fontSize: 26,
  fontFamily: 'FjallaOne-Regular',
  marginBottom: 36,
};

const athleteFocusLogoWrap = {
  width: 142,
  height: 142,
  overflow: 'hidden' as const,
  marginBottom: 22,
  borderRadius: 32,
};

const athleteFocusLogo = {
  width: '100%',
  height: '100%',
};

const athleteFocusDesc = {
  color: '#fff',
  fontSize: 14,
  lineHeight: 18,
  textAlign: 'center' as const,
  fontFamily: 'FjallaOne-Regular',
  paddingHorizontal: 34,
  marginTop: 6,
};

const athleteFocusShareBtn = {
  marginTop: 32,
  width: 69,
  height: 46,
  borderRadius: 999,
  backgroundColor: '#F21D16',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

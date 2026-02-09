import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScrollLayout from '../components/ScrollLayout';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const athleteFocusProfileKey = '@profile';

type AthleteFocusProfile = {
  photoUri: string | null;
  nickname: string;
  about: string;
};

const WelcomeScreen = () => {
  const athleteFocusNavigation = useNavigation();
  const [athleteFocusCurrentScreenIdx, setAthleteFocusCurrentScreenIdx] =
    useState(0);

  const athleteFocusGoNextAfterLastSlide = async () => {
    try {
      const athleteFocusRaw = await AsyncStorage.getItem(
        athleteFocusProfileKey,
      );

      if (!athleteFocusRaw) {
        athleteFocusNavigation.navigate('RegistrationScreen' as never);
        return;
      }

      const athleteFocusProfile: AthleteFocusProfile =
        JSON.parse(athleteFocusRaw);
      const athleteFocusHasProfile = Boolean(
        athleteFocusProfile?.nickname?.trim(),
      );

      athleteFocusNavigation.navigate(
        (athleteFocusHasProfile
          ? 'TabsNavigation'
          : 'RegistrationScreen') as never,
      );
    } catch (e) {
      athleteFocusNavigation.navigate('RegistrationScreen' as never);
    }
  };

  const athleteFocusOnNextPress = async () => {
    if (athleteFocusCurrentScreenIdx < 3) {
      setAthleteFocusCurrentScreenIdx(athleteFocusCurrentScreenIdx + 1);
    } else {
      await athleteFocusGoNextAfterLastSlide();
    }
  };

  return (
    <ScrollLayout>
      {athleteFocusCurrentScreenIdx === 0 ? (
        <View style={athleteFocusStyles.mainBox}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 60,
            }}
          >
            <Text style={athleteFocusStyles.introTitle}>
              Sport starts with focus Every day is a chance to stay connected to
              sports — through moments, thoughts, and inspiration.
            </Text>

            <TouchableOpacity
              style={athleteFocusStyles.btn}
              onPress={athleteFocusOnNextPress}
            >
              <Text style={athleteFocusStyles.buttonText}>Good</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginTop: 40,
            }}
          >
            <Image source={require('../assets/images/welocmeImg1.png')} />
          </View>
        </View>
      ) : (
        <View style={athleteFocusStyles.mainBox}>
          <Image
            source={
              athleteFocusCurrentScreenIdx === 1
                ? require('../assets/images/welocmeImg2.png')
                : athleteFocusCurrentScreenIdx === 2
                ? require('../assets/images/welocmeImg3.png')
                : require('../assets/images/welocmeImg4.png')
            }
          />

          <Text style={[athleteFocusStyles.introTitle, { marginTop: 80 }]}>
            {athleteFocusCurrentScreenIdx === 1
              ? `Save your thoughts after matches, track your sport mood, and keep what matters to you.`
              : athleteFocusCurrentScreenIdx === 2
              ? `Find your sport name
Enter a name and get a bold sport nickname — just for fun, style, and motivation.`
              : `Your space. Your rhythm.
Build your own sport routine, view your stats, and keep moving at your pace.`}
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={athleteFocusStyles.btn}
            onPress={athleteFocusOnNextPress}
          >
            <Text style={athleteFocusStyles.buttonText}>
              {athleteFocusCurrentScreenIdx === 1
                ? 'CONTINUE'
                : athleteFocusCurrentScreenIdx === 2
                ? 'NEXT'
                : 'START'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollLayout>
  );
};

const athleteFocusStyles = StyleSheet.create({
  mainBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  introTitle: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginTop: 30,
    fontFamily: 'FjallaOne-Regular',
    paddingHorizontal: 20,
  },
  btn: {
    marginTop: 60,
    backgroundColor: '#F21D16',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 444,
    minHeight: 68,
    minWidth: 228,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'FjallaOne-Regular',
  },
});

export default WelcomeScreen;

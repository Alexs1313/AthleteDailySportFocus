import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ScrollLayout from '../components/ScrollLayout';
import {
  launchImageLibrary,
  type ImageLibraryOptions,
} from 'react-native-image-picker';

type ProfileAthleteFocus = {
  photoUri: string | null;
  nickname: string;
  about: string;
};

const athleteFocusProfileKey = '@profile';

const MyProfileScreen: React.FC = () => {
  const athleteFocusNavigation = useNavigation<any>();

  const [athleteFocusPhotoUri, setAthleteFocusPhotoUri] = useState<
    string | null
  >(null);
  const [athleteFocusNickname, setAthleteFocusNickname] = useState<string>('');
  const [athleteFocusAbout, setAthleteFocusAbout] = useState<string>('');
  const [athleteFocusLoading, setAthleteFocusLoading] = useState(true);

  const athleteFocusCanSave = useMemo(
    () => athleteFocusNickname.trim().length > 0,
    [athleteFocusNickname],
  );

  const athleteFocusLoadProfile = async () => {
    try {
      const raw = await AsyncStorage.getItem(athleteFocusProfileKey);
      if (raw) {
        const p: ProfileAthleteFocus = JSON.parse(raw);
        setAthleteFocusPhotoUri(p.photoUri ?? null);
        setAthleteFocusNickname(p.nickname ?? '');
        setAthleteFocusAbout(p.about ?? '');
      }
    } catch (e) {
      console.warn('Profile load error', e);
    } finally {
      setAthleteFocusLoading(false);
    }
  };

  const athleteFocusSaveProfile = async (
    next?: Partial<ProfileAthleteFocus>,
  ) => {
    const data: ProfileAthleteFocus = {
      photoUri: next?.photoUri ?? athleteFocusPhotoUri,
      nickname: (next?.nickname ?? athleteFocusNickname).trim(),
      about: (next?.about ?? athleteFocusAbout).trim(),
    };

    if (!data.nickname) {
      Alert.alert('Nickname required', 'Please enter your nickname.');
      return false;
    }

    try {
      await AsyncStorage.setItem(athleteFocusProfileKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Profile save error', e);
      Alert.alert('Error', 'Failed to save profile.');
      return false;
    }
  };

  useEffect(() => {
    athleteFocusLoadProfile();
  }, []);

  const athleteFocusOnBackPress = async () => {
    const ok = await athleteFocusSaveProfile();
    if (ok) athleteFocusNavigation.goBack();
  };

  const athleteFocusOnPickPhotoPress = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.9,
      selectionLimit: 1,
    };

    launchImageLibrary(options, async res => {
      if (res.didCancel) return;

      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Image picker error');
        return;
      }

      const uri = res.assets?.[0]?.uri;
      if (!uri) {
        Alert.alert('Error', 'No image selected');
        return;
      }

      setAthleteFocusPhotoUri(uri);
      await athleteFocusSaveProfile({ photoUri: uri });
    });
  };

  const athleteFocusDeleteProfile = () => {
    Alert.alert(
      'Delete profile',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(athleteFocusProfileKey);

              setAthleteFocusPhotoUri(null);
              setAthleteFocusNickname('');
              setAthleteFocusAbout('');

              athleteFocusNavigation.reset({
                index: 0,
                routes: [{ name: 'WelcomeScreen' }],
              });
            } catch {
              Alert.alert('Error', 'Failed to delete profile.');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollLayout>
      <View style={athleteFocusContainer}>
        <View style={athleteFocusHeader}>
          <TouchableOpacity
            onPress={athleteFocusOnBackPress}
            activeOpacity={0.85}
            style={athleteFocusBackBtn}
          >
            <Image source={require('../assets/images/backArr.png')} />
          </TouchableOpacity>

          <Text style={athleteFocusHeaderTitle}>My profile</Text>

          <View style={{ width: 34 }} />
        </View>

        <View style={athleteFocusTopRow}>
          <View style={athleteFocusAvatarWrap}>
            {athleteFocusPhotoUri ? (
              <Image
                source={{ uri: athleteFocusPhotoUri }}
                style={athleteFocusAvatar}
              />
            ) : (
              <View style={athleteFocusAvatarEmpty} />
            )}
          </View>

          <TouchableOpacity
            style={athleteFocusChangeBtn}
            onPress={athleteFocusOnPickPhotoPress}
            activeOpacity={0.9}
            disabled={athleteFocusLoading}
          >
            <Text style={athleteFocusChangeBtnText}>Change photo</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={athleteFocusNickname}
          onChangeText={setAthleteFocusNickname}
          placeholder="Your nickname"
          placeholderTextColor="rgba(255,255,255,0.55)"
          style={athleteFocusInput}
          editable={!athleteFocusLoading}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <TextInput
          value={athleteFocusAbout}
          onChangeText={setAthleteFocusAbout}
          placeholder="About you"
          placeholderTextColor="rgba(255,255,255,0.55)"
          style={athleteFocusInput}
          editable={!athleteFocusLoading}
        />

        <Text style={athleteFocusPrivacy}>
          Your data is not stored or transferred to third parties.
        </Text>

        <TouchableOpacity
          style={athleteFocusDeleteBtn}
          onPress={athleteFocusDeleteProfile}
          activeOpacity={0.9}
        >
          <Text style={athleteFocusDeleteBtnText}>Delete profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollLayout>
  );
};

export default MyProfileScreen;

const athleteFocusContainer = {
  flex: 1,
  paddingHorizontal: 18,
  paddingTop: 70,
  paddingBottom: 30,
};

const athleteFocusHeader = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  marginBottom: 26,
};

const athleteFocusBackBtn = {
  width: 34,
  height: 34,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const athleteFocusHeaderTitle = {
  textAlign: 'left' as const,
  color: '#fff',
  fontSize: 24,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusDeleteBtn = {
  marginTop: 26,
  height: 56,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: '#F21D16',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  backgroundColor: 'transparent',
};

const athleteFocusDeleteBtnText = {
  color: '#F21D16',
  fontSize: 16,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusTopRow = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 16,
  marginBottom: 18,
  marginTop: 20,
};

const athleteFocusAvatarWrap = {
  width: 141,
  height: 141,
  borderRadius: 32,
  overflow: 'hidden' as const,
  borderWidth: 1,
  borderColor: '#fff',
  backgroundColor: 'rgba(255,255,255,0.12)',
};

const athleteFocusAvatar = {
  width: '100%',
  height: '100%',
};

const athleteFocusAvatarEmpty = {
  flex: 1,
};

const athleteFocusChangeBtn = {
  flex: 1,
  height: 68,
  borderRadius: 999,
  backgroundColor: '#F21D16',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingHorizontal: 18,
};

const athleteFocusChangeBtnText = {
  color: '#fff',
  fontSize: 20,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusInput = {
  width: '100%',
  minHeight: 62,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: '#FFFFFF',
  paddingHorizontal: 18,
  paddingVertical: 14,
  color: '#fff',
  fontSize: 16,
  marginTop: 14,
  backgroundColor: '#FFFFFF12',
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusPrivacy = {
  marginTop: 38,
  color: '#FFFFFF66',
  fontSize: 14,
  textAlign: 'center' as const,
  fontFamily: 'FjallaOne-Regular',
};

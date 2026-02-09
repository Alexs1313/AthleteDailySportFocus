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
  type ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';

type ProfileAthleteFocus = {
  photoUri: string | null;
  nickname: string;
  about: string;
};

const athleteFocusStorageKey = '@profile';

const RegistrationScreen: React.FC = () => {
  const athleteFocusNavigation = useNavigation<any>();

  const [athleteFocusPhotoUri, setAthleteFocusPhotoUri] = useState<
    string | null
  >(null);
  const [athleteFocusNickname, setAthleteFocusNickname] = useState<string>('');
  const [athleteFocusAbout, setAthleteFocusAbout] = useState<string>('');
  const [athleteFocusLoading, setAthleteFocusLoading] = useState<boolean>(true);

  const athleteFocusIsEditing = useMemo(
    () =>
      !!athleteFocusPhotoUri || !!athleteFocusNickname || !!athleteFocusAbout,
    [athleteFocusPhotoUri, athleteFocusNickname, athleteFocusAbout],
  );

  useEffect(() => {
    const athleteFocusLoad = async () => {
      try {
        const raw = await AsyncStorage.getItem(athleteFocusStorageKey);
        if (raw) {
          const parsed: ProfileAthleteFocus = JSON.parse(raw);
          setAthleteFocusPhotoUri(parsed.photoUri ?? null);
          setAthleteFocusNickname(parsed.nickname ?? '');
          setAthleteFocusAbout(parsed.about ?? '');
        }
      } catch (e) {
        console.warn('Failed to load profile:', e);
      } finally {
        setAthleteFocusLoading(false);
      }
    };

    athleteFocusLoad();
  }, []);

  const athleteFocusOnPickPhotoPress = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.9,
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) return;

      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      setAthleteFocusPhotoUri(asset.uri);
    });
  };

  const athleteFocusOnSavePress = async () => {
    const trimmedNick = athleteFocusNickname.trim();
    const trimmedAbout = athleteFocusAbout.trim();

    if (!trimmedNick) {
      Alert.alert('Nickname required', 'Please enter your nickname.');
      return;
    }

    const profile: ProfileAthleteFocus = {
      photoUri: athleteFocusPhotoUri,
      nickname: trimmedNick,
      about: trimmedAbout,
    };

    try {
      await AsyncStorage.setItem(
        athleteFocusStorageKey,
        JSON.stringify(profile),
      );
      athleteFocusNavigation.navigate('TabsNavigation');
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  };

  return (
    <ScrollLayout>
      <View style={athleteFocusContainer}>
        <Image
          source={require('../assets/images/logo.png')}
          style={athleteFocusLogo}
          resizeMode="contain"
        />

        <View style={athleteFocusRow}>
          <TouchableOpacity
            style={[
              athleteFocusPhotoBox,
              athleteFocusPhotoUri ? athleteFocusPhotoBoxFilled : null,
            ]}
            onPress={athleteFocusOnPickPhotoPress}
            activeOpacity={0.9}
          >
            {athleteFocusPhotoUri ? (
              <Image
                source={{ uri: athleteFocusPhotoUri }}
                style={athleteFocusPhoto}
              />
            ) : (
              <View style={athleteFocusPhotoPlaceholder}>
                <Image
                  source={require('../assets/images/add-photo.png')}
                  style={athleteFocusAddIcon}
                  resizeMode="contain"
                />
                <Text style={athleteFocusAddText}>ADD PHOTO</Text>
              </View>
            )}
          </TouchableOpacity>

          {athleteFocusPhotoUri && (
            <TouchableOpacity
              style={[
                athleteFocusChangeBtn,
                !athleteFocusPhotoUri ? athleteFocusChangeBtnHidden : null,
              ]}
              onPress={athleteFocusOnPickPhotoPress}
              activeOpacity={0.9}
              disabled={!athleteFocusPhotoUri}
            >
              <Text style={athleteFocusChangeBtnText}>Change photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          value={athleteFocusNickname}
          onChangeText={setAthleteFocusNickname}
          placeholder="YOUR NICKNAME"
          placeholderTextColor="rgba(255,255,255,0.55)"
          style={athleteFocusInput}
          editable={!athleteFocusLoading}
          autoCapitalize="words"
        />

        <TextInput
          value={athleteFocusAbout}
          onChangeText={setAthleteFocusAbout}
          placeholder="ABOUT YOU"
          placeholderTextColor="rgba(255,255,255,0.55)"
          style={athleteFocusInput}
          editable={!athleteFocusLoading}
        />

        <Text style={athleteFocusPrivacy}>
          Your data is not stored or transferred to third parties.
        </Text>

        {athleteFocusIsEditing && (
          <TouchableOpacity
            style={[
              athleteFocusSaveBtn,
              !athleteFocusIsEditing ? athleteFocusSaveBtnDisabled : null,
            ]}
            onPress={athleteFocusOnSavePress}
            activeOpacity={0.9}
            disabled={!athleteFocusIsEditing || athleteFocusLoading}
          >
            <Text style={athleteFocusSaveBtnText}>Save profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollLayout>
  );
};

export default RegistrationScreen;

const athleteFocusContainer = {
  flex: 1,
  paddingHorizontal: 22,
  alignItems: 'center' as const,
  paddingTop: 90,
  paddingBottom: 20,
};

const athleteFocusLogo = {
  width: 140,
  height: 140,
  marginBottom: 30,
  borderRadius: 32,
};

const athleteFocusRow = {
  width: '100%',
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 16,
  marginBottom: 22,
};

const athleteFocusPhotoBox = {
  width: 140,
  height: 140,
  borderRadius: 32,
  borderWidth: 1,
  borderColor: '#FFFFFF',
  overflow: 'hidden' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  backgroundColor: 'rgba(0,0,0,0.18)',
};

const athleteFocusPhotoBoxFilled = {
  borderColor: 'rgba(255,255,255,0.25)',
};

const athleteFocusPhoto = {
  width: '100%',
  height: '100%',
};

const athleteFocusPhotoPlaceholder = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 8,
};

const athleteFocusAddIcon = {
  width: 22,
  height: 22,
  opacity: 0.95,
};

const athleteFocusAddText = {
  color: 'rgba(255,255,255,0.75)',
  fontSize: 12,
  letterSpacing: 0.4,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusChangeBtn = {
  flex: 1,
  height: 58,
  borderRadius: 999,
  backgroundColor: '#F21D16',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingHorizontal: 18,
};

const athleteFocusChangeBtnHidden = {
  backgroundColor: 'rgba(255,255,255,0.12)',
};

const athleteFocusChangeBtnText = {
  color: '#fff',
  fontSize: 18,
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
  marginBottom: 14,
  backgroundColor: 'rgba(0,0,0,0.18)',
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusPrivacy = {
  marginTop: 30,
  color: 'rgba(255,255,255,0.55)',
  fontSize: 14,
  textAlign: 'center' as const,
};

const athleteFocusSaveBtn = {
  marginTop: 46,
  backgroundColor: '#F21D16',
  paddingVertical: 14,
  paddingHorizontal: 44,
  borderRadius: 999,
  minHeight: 66,
  minWidth: 228,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const athleteFocusSaveBtnDisabled = {
  opacity: 0.7,
};

const athleteFocusSaveBtnText = {
  color: '#fff',
  fontSize: 20,
  fontFamily: 'FjallaOne-Regular',
};

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScrollLayout from '../components/ScrollLayout';
import { BlurView } from '@react-native-community/blur';
import WebView from 'react-native-webview';
import { htmlAthletesLoader } from '../constants/htmlAthletesLoader';
import { useFocusEffect } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';

type HistoryItemAthleteFocus = {
  id: string;
  name: string;
  nickname: string;
  createdAt: number;
};

const athleteFocusHistoryKey = '@nickname_history';

const athleteFocusNicknames = [
  'Iron Focus',
  'Red Velocity',
  'Silent Force',
  'Turbo Edge',
  'Steel Motion',
  'Dark Sprint',
  'Prime Drive',
  'Cold Rhythm',
  'Sharp Momentum',
  'Core Pulse',
  'Night Striker',
  'Pure Energy',
  'Fast Lane',
  'Deep Focus',
  'Power Signal',
  'Clean Impact',
  'Bold Tempo',
  'Rapid Core',
  'Steady Flame',
  'Alpha Motion',
  'Hard Reset',
  'True Balance',
  'Swift Current',
  'Clear Path',
  'Solid Pace',
  'Inner Drive',
  'Zero Limit',
  'Bright Vector',
  'Heavy Focus',
  'Next Level',
  'Calm Power',
  'Full Control',
  'Rising Pace',
  'Active Zone',
  'Strong Signal',
  'Peak Mode',
  'Free Motion',
  'Sharp Core',
  'Locked In',
  'Final Push',
  'Prime State',
  'Clean Focus',
  'Red Shift',
  'Fast Rhythm',
  'Solid Drive',
  'Core Energy',
  'Focus Line',
  'Power Frame',
  'Motion Code',
  'Inner Tempo',
];

const athleteFocusPickRandom = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const athleteFocusSleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

const AthleteNicknames: React.FC = () => {
  const [athleteFocusScreen, setAthleteFocusScreen] = useState<
    'lab' | 'history' | 'wait'
  >('lab');

  const [athleteFocusName, setAthleteFocusName] = useState('');
  const [athleteFocusHistory, setAthleteFocusHistory] = useState<
    HistoryItemAthleteFocus[]
  >([]);

  const [athleteFocusResultVisible, setAthleteFocusResultVisible] =
    useState(false);
  const [athleteFocusResultName, setAthleteFocusResultName] = useState('');
  const [athleteFocusResultNick, setAthleteFocusResultNick] = useState('');

  const athleteFocusCanGenerate = useMemo(
    () => athleteFocusName.trim().length > 0,
    [athleteFocusName],
  );

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android' && athleteFocusResultVisible) {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, [athleteFocusResultVisible]),
  );

  const athleteFocusLoadHistory = async () => {
    try {
      const rawAthleteFocus = await AsyncStorage.getItem(
        athleteFocusHistoryKey,
      );
      if (rawAthleteFocus) {
        const parsedAthleteFocus: HistoryItemAthleteFocus[] =
          JSON.parse(rawAthleteFocus);
        setAthleteFocusHistory(
          Array.isArray(parsedAthleteFocus) ? parsedAthleteFocus : [],
        );
      } else {
        setAthleteFocusHistory([]);
      }
    } catch (e) {
      console.warn('history load error', e);
      setAthleteFocusHistory([]);
    }
  };

  const athleteFocusSaveHistory = async (items: HistoryItemAthleteFocus[]) => {
    setAthleteFocusHistory(items);
    try {
      await AsyncStorage.setItem(athleteFocusHistoryKey, JSON.stringify(items));
    } catch (e) {
      console.warn('history save error', e);
    }
  };

  useEffect(() => {
    athleteFocusLoadHistory();
  }, []);

  const athleteFocusOnGenerate = async () => {
    if (!athleteFocusCanGenerate) return;

    const inputNameAthleteFocus = athleteFocusName.trim();

    setAthleteFocusScreen('wait');
    await athleteFocusSleep(3200);

    const nickAthleteFocus = athleteFocusPickRandom(athleteFocusNicknames);

    const itemAthleteFocus: HistoryItemAthleteFocus = {
      id: String(Date.now()),
      name: inputNameAthleteFocus,
      nickname: nickAthleteFocus,
      createdAt: Date.now(),
    };

    const updatedAthleteFocus = [
      itemAthleteFocus,
      ...athleteFocusHistory,
    ].slice(0, 200);
    await athleteFocusSaveHistory(updatedAthleteFocus);

    setAthleteFocusResultName(inputNameAthleteFocus);
    setAthleteFocusResultNick(nickAthleteFocus);
    setAthleteFocusResultVisible(true);
    setAthleteFocusName('');

    setAthleteFocusScreen('lab');
  };

  const athleteFocusOnNewGenerate = () => {
    setAthleteFocusResultVisible(false);
  };

  const athleteFocusOnShareResult = async () => {
    try {
      await Share.share({
        message: `${athleteFocusResultName} → ${athleteFocusResultNick}`,
      });
    } catch (e) {
      console.warn('share error', e);
    }
  };

  const athleteFocusOnOpenHistory = () => setAthleteFocusScreen('history');
  const athleteFocusOnBackFromHistory = () => setAthleteFocusScreen('lab');

  const athleteFocusRenderHistoryItem = ({
    item,
  }: {
    item: HistoryItemAthleteFocus;
  }) => (
    <View style={athleteFocusHistoryRow}>
      <Text style={athleteFocusHistoryLeft} numberOfLines={1}>
        {item.name}
      </Text>
      <Image source={require('../assets/images/rightArr.png')} />
      <Text style={athleteFocusHistoryRight} numberOfLines={1}>
        {item.nickname}
      </Text>
    </View>
  );

  return (
    <ScrollLayout>
      {athleteFocusScreen === 'wait' ? (
        <View style={athleteFocusWaitWrap}>
          <Text style={athleteFocusWaitText}>Wait...</Text>

          <WebView
            originWhitelist={['*']}
            source={{ html: htmlAthletesLoader }}
            style={athleteFocusWaitWebview}
            scrollEnabled={false}
          />
        </View>
      ) : athleteFocusScreen === 'history' ? (
        <View
          style={[
            athleteFocusContainer,
            { paddingBottom: 150 },
            Platform.OS === 'android' &&
              athleteFocusResultVisible && { filter: 'blur(6px)' },
          ]}
        >
          <View style={athleteFocusHistoryHeader}>
            <TouchableOpacity
              onPress={athleteFocusOnBackFromHistory}
              activeOpacity={0.85}
              style={athleteFocusBackBtn}
            >
              <Image source={require('../assets/images/backArr.png')} />
            </TouchableOpacity>
            <Text style={athleteFocusHistoryTitle}>History</Text>
          </View>

          <FlatList
            data={athleteFocusHistory}
            scrollEnabled={false}
            keyExtractor={i => i.id}
            renderItem={athleteFocusRenderHistoryItem}
            contentContainerStyle={athleteFocusHistoryListContent}
          />
        </View>
      ) : (
        <View
          style={[
            athleteFocusContainer,
            Platform.OS === 'android' &&
              athleteFocusResultVisible && { filter: 'blur(6px)' },
          ]}
        >
          <Text style={athleteFocusLabTitle}>Sport Nickname Lab</Text>
          <Text style={athleteFocusLabSub}>
            Nickname is generated for fun and inspiration.
          </Text>

          <TouchableOpacity
            style={athleteFocusHistoryBtn}
            onPress={athleteFocusOnOpenHistory}
            activeOpacity={0.9}
          >
            <Text style={athleteFocusHistoryBtnText}>History</Text>
            <Image source={require('../assets/images/hist.png')} />
          </TouchableOpacity>

          <View style={athleteFocusInputWrap}>
            <TextInput
              value={athleteFocusName}
              onChangeText={setAthleteFocusName}
              placeholder="Enter name"
              placeholderTextColor="rgba(255,255,255,0.55)"
              style={athleteFocusInput}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          {athleteFocusCanGenerate && (
            <TouchableOpacity
              style={[
                athleteFocusGenerateBtn,
                !athleteFocusCanGenerate && { opacity: 0.65 },
              ]}
              onPress={athleteFocusOnGenerate}
              activeOpacity={0.9}
              disabled={!athleteFocusCanGenerate}
            >
              <Text style={athleteFocusGenerateText}>Start generate</Text>
            </TouchableOpacity>
          )}

          {!athleteFocusName && (
            <View style={athleteFocusCenterImageWrap}>
              <Image source={require('../assets/images/nicknamesimg.png')} />
            </View>
          )}
        </View>
      )}

      <Modal
        visible={athleteFocusResultVisible}
        transparent
        animationType="fade"
        statusBarTranslucent={Platform.OS === 'android'}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            blurType="light"
            style={athleteFocusBlurFill}
            blurRadius={2}
          />
        )}

        <View style={athleteFocusBackdrop}>
          <View style={athleteFocusResultSheet}>
            <View style={athleteFocusResultHeader}>
              <Text style={athleteFocusResultHeaderText}>
                Generate completed!
              </Text>
              <TouchableOpacity
                onPress={() => setAthleteFocusResultVisible(false)}
                activeOpacity={0.85}
              >
                <Image source={require('../assets/images/close.png')} />
              </TouchableOpacity>
            </View>

            <View style={athleteFocusHr} />

            <View style={athleteFocusResultBody}>
              <Text style={athleteFocusResultN}>{athleteFocusResultName}</Text>

              <View style={{ gap: 8 }}>
                <Image source={require('../assets/images/arrdown.png')} />
                <Image source={require('../assets/images/arrdown.png')} />
                <Image source={require('../assets/images/arrdown.png')} />
              </View>

              <Text style={athleteFocusResultNic}>
                {athleteFocusResultNick}
              </Text>

              <TouchableOpacity
                style={athleteFocusShareRound}
                onPress={athleteFocusOnShareResult}
                activeOpacity={0.9}
              >
                <Image source={require('../assets/images/share.png')} />
              </TouchableOpacity>

              <TouchableOpacity
                style={athleteFocusNewGenerateBtn}
                onPress={athleteFocusOnNewGenerate}
                activeOpacity={0.9}
              >
                <Text style={athleteFocusNewGenerateText}>New generate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollLayout>
  );
};

export default AthleteNicknames;

const athleteFocusContainer = {
  flex: 1,
  paddingHorizontal: 18,
  paddingTop: 80,
};

const athleteFocusWaitWrap = {
  flex: 1,
  alignItems: 'center' as const,
  paddingTop: 100,
};

const athleteFocusWaitText = {
  color: '#fff',
  fontSize: 26,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusWaitWebview = {
  width: 100,
  height: 80,
  backgroundColor: 'transparent',
  bottom: 50,
};

const athleteFocusLabTitle = {
  color: '#fff',
  fontSize: 24,
  textAlign: 'center' as const,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusLabSub = {
  marginTop: 10,
  color: 'rgba(255,255,255,0.55)',
  textAlign: 'center' as const,
  fontSize: 16,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusHistoryBtn = {
  marginTop: 18,
  alignSelf: 'center' as const,
  height: 46,
  paddingHorizontal: 22,
  borderRadius: 999,
  backgroundColor: '#F21D16',
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 10,
  justifyContent: 'center' as const,
};

const athleteFocusHistoryBtnText = {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusInputWrap = {
  marginTop: 50,
  borderWidth: 1,
  width: '80%',
  borderColor: '#fff',
  borderRadius: 22,
  paddingHorizontal: 18,
  paddingVertical: 19,
  alignSelf: 'center' as const,
  backgroundColor: 'rgba(255,255,255,0.07)',
};

const athleteFocusInput = {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusCenterImageWrap = {
  alignItems: 'center' as const,
  justifyContent: 'flex-end' as const,
  marginTop: 10,
  flex: 1,
};

const athleteFocusGenerateBtn = {
  marginTop: 28,
  backgroundColor: '#F21D16',
  height: 68,
  width: '60%',
  alignSelf: 'center' as const,
  borderRadius: 999,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const athleteFocusGenerateText = {
  color: '#fff',
  fontSize: 18,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusHistoryHeader = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  marginBottom: 18,
  gap: 10,
};

const athleteFocusBackBtn = {
  width: 34,
  height: 34,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const athleteFocusHistoryTitle = {
  color: '#fff',
  fontSize: 22,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusHistoryRow = {
  borderWidth: 1,
  borderColor: '#fff',
  borderRadius: 22,
  paddingHorizontal: 16,
  paddingVertical: 18,
  marginTop: 14,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  backgroundColor: 'rgba(255,255,255,0.07)',
  gap: 10,
};

const athleteFocusHistoryLeft = {
  flex: 1,
  color: '#fff',
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusHistoryRight = {
  flex: 1,
  textAlign: 'right' as const,
  color: '#fff',
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusHistoryListContent = { paddingBottom: 140 };

const athleteFocusBackdrop = {
  flex: 1,
  backgroundColor: '#030E10CC',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingHorizontal: 32,
};

const athleteFocusBlurFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const athleteFocusResultSheet = {
  width: '100%',
  borderWidth: 1,
  borderColor: '#fff',
  borderRadius: 22,
  backgroundColor: '#FFFFFF15',
  padding: 18,
};

const athleteFocusResultHeader = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
};

const athleteFocusResultHeaderText = {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusHr = {
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.25)',
  marginTop: 12,
};

const athleteFocusResultBody = {
  paddingVertical: 26,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 16,
};

const athleteFocusResultN = {
  color: '#fff',
  fontSize: 16,
  fontFamily: 'FjallaOne-Regular',
  marginTop: 16,
};

const athleteFocusResultNic = {
  color: '#fff',
  fontSize: 24,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusShareRound = {
  width: 66,
  height: 46,
  borderRadius: 999,
  backgroundColor: '#F21D16',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  marginTop: 16,
};

const athleteFocusNewGenerateBtn = {
  marginTop: 6,
  width: '72%',
  height: 64,
  borderRadius: 999,
  backgroundColor: '#F21D16',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const athleteFocusNewGenerateText = {
  color: '#fff',
  fontSize: 18,
  fontFamily: 'FjallaOne-Regular',
};

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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScrollLayout from '../components/ScrollLayout';
import { BlurView } from '@react-native-community/blur';
import Orientation from 'react-native-orientation-locker';

const athleteFocusInsightTodayKey = '@insight_today';

const athleteFocusInsights = [
  'Consistency matters more than intensity.',
  'Progress starts with showing up.',
  'Recovery is part of training.',
  'Focus turns effort into results.',
  'Every session builds confidence.',
  'Small routines shape big habits.',
  'Discipline creates freedom.',
  'Movement sharpens the mind.',
  'Rest days help you grow.',
  'Calm focus beats rush.',
  'Training is a conversation with yourself.',
  'Stability comes from repetition.',
  'Strong basics lead to steady growth.',
  'Patience improves performance.',
  'Clear goals keep energy focused.',
  'Sport teaches balance, not pressure.',
  'Consistent effort builds trust in yourself.',
  'Focus today makes tomorrow easier.',
  'Progress is rarely loud.',
  'Routine creates rhythm.',
  'Strength grows quietly.',
  'Sport rewards attention.',
  'One good habit changes many.',
  'Confidence follows preparation.',
  'Energy flows where focus goes.',
  'Simple actions build strong days.',
  'Improvement comes from awareness.',
  'Calm effort lasts longer.',
  'Training is about direction, not speed.',
  'Your pace is the right pace.',
];

type ProfileAthleteFocus = {
  photoUri: string | null;
  nickname: string;
  about: string;
};

type NoteFieldsAthleteFocus = {
  a: string;
  b: string;
  c: string;
};

type NoteAthleteFocus = {
  id: string;
  createdAt: number;
  fields: NoteFieldsAthleteFocus;
};

type MoodAthleteFocus = 'bad' | 'normal' | 'perfect';

const athleteFocusProfileKey = '@profile';
const athleteFocusNotesKey = '@notes';
const athleteFocusMoodTodayKey = '@mood_today';

const athleteFocusFormatRecord = (ts: number) => {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

const athleteFocusTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
};

const HomeScrn: React.FC = () => {
  const athleteFocusNavigation = useNavigation<any>();

  const [athleteFocusDailyInsight, setAthleteFocusDailyInsight] =
    useState<string>(athleteFocusInsights[0]);

  const [athleteFocusProfile, setAthleteFocusProfile] =
    useState<ProfileAthleteFocus>({
      photoUri: null,
      nickname: '',
      about: '',
    });

  const [athleteFocusNotes, setAthleteFocusNotes] = useState<
    NoteAthleteFocus[]
  >([]);
  const [athleteFocusMood, setAthleteFocusMood] =
    useState<MoodAthleteFocus | null>(null);

  const [athleteFocusAddVisible, setAthleteFocusAddVisible] = useState(false);
  const [athleteFocusOpenVisible, setAthleteFocusOpenVisible] = useState(false);
  const [athleteFocusSelectedNote, setAthleteFocusSelectedNote] =
    useState<NoteAthleteFocus | null>(null);

  const [athleteFocusFieldA, setAthleteFocusFieldA] = useState('');
  const [athleteFocusFieldB, setAthleteFocusFieldB] = useState('');
  const [athleteFocusFieldC, setAthleteFocusFieldC] = useState('');

  const athleteFocusHelloName = useMemo(() => {
    const name = athleteFocusProfile.nickname?.trim();
    return name ? name.toUpperCase() : 'ATHLETE';
  }, [athleteFocusProfile.nickname]);

  const athleteFocusAboutLine = useMemo(() => {
    const a = athleteFocusProfile.about?.trim();
    return a ? a : 'Tell us about you';
  }, [athleteFocusProfile.about]);

  useFocusEffect(
    useCallback(() => {
      if (
        Platform.OS === 'android' &&
        (athleteFocusAddVisible || athleteFocusOpenVisible)
      ) {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, [athleteFocusAddVisible, athleteFocusOpenVisible]),
  );

  const athleteFocusLoadAll = async () => {
    try {
      const [pRaw, nRaw, mRaw, iRaw] = await Promise.all([
        AsyncStorage.getItem(athleteFocusProfileKey),
        AsyncStorage.getItem(athleteFocusNotesKey),
        AsyncStorage.getItem(athleteFocusMoodTodayKey),
        AsyncStorage.getItem(athleteFocusInsightTodayKey),
      ]);

      if (pRaw) {
        const p: ProfileAthleteFocus = JSON.parse(pRaw);
        setAthleteFocusProfile({
          photoUri: p.photoUri ?? null,
          nickname: p.nickname ?? '',
          about: p.about ?? '',
        });
      }

      if (nRaw) {
        const list: NoteAthleteFocus[] = JSON.parse(nRaw);
        setAthleteFocusNotes(list.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setAthleteFocusNotes([]);
      }

      if (mRaw) {
        const obj: Record<string, MoodAthleteFocus> = JSON.parse(mRaw);
        setAthleteFocusMood(obj[athleteFocusTodayKey()] ?? null);
      } else {
        setAthleteFocusMood(null);
      }

      // insight stored as { [dateKey]: string }
      try {
        const obj: Record<string, string> = iRaw ? JSON.parse(iRaw) : {};
        const key = athleteFocusTodayKey();

        if (obj[key]) {
          setAthleteFocusDailyInsight(obj[key]);
        } else {
          const random =
            athleteFocusInsights[
              Math.floor(Math.random() * athleteFocusInsights.length)
            ];
          obj[key] = random;
          setAthleteFocusDailyInsight(random);
          await AsyncStorage.setItem(
            athleteFocusInsightTodayKey,
            JSON.stringify(obj),
          );
        }
      } catch {
        setAthleteFocusDailyInsight(
          athleteFocusInsights[
            Math.floor(Math.random() * athleteFocusInsights.length)
          ],
        );
      }
    } catch (e) {
      console.warn('Home load error', e);
    }
  };

  useEffect(() => {
    athleteFocusLoadAll();
  }, []);

  useFocusEffect(
    useCallback(() => {
      athleteFocusLoadAll();
      return () => {};
    }, []),
  );

  const athleteFocusOnMyProfilePress = () => {
    athleteFocusNavigation.navigate('MyProfileScreen');
  };

  const athleteFocusOnAddNotePress = () => {
    setAthleteFocusFieldA('');
    setAthleteFocusFieldB('');
    setAthleteFocusFieldC('');
    setAthleteFocusAddVisible(true);
  };

  const athleteFocusAddNote = async () => {
    const a = athleteFocusFieldA.trim();
    const b = athleteFocusFieldB.trim();
    const c = athleteFocusFieldC.trim();

    if (!a && !b && !c) return;

    const newNote: NoteAthleteFocus = {
      id: String(Date.now()),
      createdAt: Date.now(),
      fields: { a, b, c },
    };

    const updated = [newNote, ...athleteFocusNotes];
    setAthleteFocusNotes(updated);
    setAthleteFocusAddVisible(false);

    try {
      await AsyncStorage.setItem(athleteFocusNotesKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('save notes error', e);
    }
  };

  const athleteFocusOnOpenNote = (note: NoteAthleteFocus) => {
    setAthleteFocusSelectedNote(note);
    setAthleteFocusFieldA(note.fields.a ?? '');
    setAthleteFocusFieldB(note.fields.b ?? '');
    setAthleteFocusFieldC(note.fields.c ?? '');
    setAthleteFocusOpenVisible(true);
  };

  const athleteFocusSaveOpenedNoteIfChanged = async () => {
    if (!athleteFocusSelectedNote) return;

    const updatedNote: NoteAthleteFocus = {
      ...athleteFocusSelectedNote,
      fields: {
        a: athleteFocusFieldA.trim(),
        b: athleteFocusFieldB.trim(),
        c: athleteFocusFieldC.trim(),
      },
    };

    const updatedList = athleteFocusNotes.map(n =>
      n.id === athleteFocusSelectedNote.id ? updatedNote : n,
    );

    setAthleteFocusNotes(updatedList);
    setAthleteFocusSelectedNote(updatedNote);

    try {
      await AsyncStorage.setItem(
        athleteFocusNotesKey,
        JSON.stringify(updatedList),
      );
    } catch (e) {
      console.warn('update note error', e);
    }
  };

  const shareDailyInsight = async () => {
    try {
      await Share.share({ message: athleteFocusDailyInsight });
    } catch (e) {
      console.warn('share error', e);
    }
  };

  const athleteFocusDeleteNote = async () => {
    if (!athleteFocusSelectedNote) return;

    const id = athleteFocusSelectedNote.id;
    const updated = athleteFocusNotes.filter(n => n.id !== id);

    setAthleteFocusNotes(updated);
    setAthleteFocusSelectedNote(null);
    setAthleteFocusOpenVisible(false);

    try {
      await AsyncStorage.setItem(athleteFocusNotesKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('delete note error', e);
    }
  };

  const athleteFocusShareNote = async () => {
    if (!athleteFocusSelectedNote) return;

    const msg = [
      `Record ${athleteFocusFormatRecord(athleteFocusSelectedNote.createdAt)}`,
      athleteFocusFieldA.trim(),
      athleteFocusFieldB.trim(),
      athleteFocusFieldC.trim(),
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      await Share.share({ message: msg });
    } catch (e) {
      console.warn('share error', e);
    }
  };

  const athleteFocusSetMoodToday = async (next: MoodAthleteFocus) => {
    setAthleteFocusMood(next);

    try {
      const raw = await AsyncStorage.getItem(athleteFocusMoodTodayKey);
      const obj: Record<string, MoodAthleteFocus> = raw ? JSON.parse(raw) : {};
      obj[athleteFocusTodayKey()] = next;
      await AsyncStorage.setItem(athleteFocusMoodTodayKey, JSON.stringify(obj));
    } catch (e) {
      console.warn('save mood error', e);
    }
  };

  const athleteFocusRenderNote = ({ item }: { item: NoteAthleteFocus }) => (
    <TouchableOpacity
      style={athleteFocusNoteRow}
      onPress={() => athleteFocusOnOpenNote(item)}
      activeOpacity={0.85}
    >
      <Text style={athleteFocusNoteText}>
        Record {athleteFocusFormatRecord(item.createdAt)}
      </Text>
      <Text style={athleteFocusChevron}>›</Text>
    </TouchableOpacity>
  );

  const athleteFocusOpenTitle = athleteFocusSelectedNote
    ? `Record ${athleteFocusFormatRecord(athleteFocusSelectedNote.createdAt)}`
    : 'Record';

  const athleteFocusShouldBlurAndroid =
    Platform.OS === 'android' &&
    (athleteFocusOpenVisible || athleteFocusAddVisible);

  return (
    <ScrollLayout>
      <View
        style={[
          athleteFocusContainer,
          athleteFocusShouldBlurAndroid && { filter: 'blur(6px)' },
        ]}
      >
        <View style={athleteFocusHeader}>
          <View style={athleteFocusHeaderLeft}>
            <View style={athleteFocusAvatarWrap}>
              {athleteFocusProfile.photoUri ? (
                <Image
                  source={{ uri: athleteFocusProfile.photoUri }}
                  style={athleteFocusAvatar}
                />
              ) : (
                <View style={athleteFocusAvatarEmpty} />
              )}
            </View>

            <View style={{ gap: 4 }}>
              <Text style={athleteFocusHello}>
                HELLO, {athleteFocusHelloName}
              </Text>
              <Text style={athleteFocusAbout}>{athleteFocusAboutLine}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={athleteFocusProfileBtn}
            onPress={athleteFocusOnMyProfilePress}
            activeOpacity={0.9}
          >
            <Text style={athleteFocusProfileBtnText}>MY PROFILE</Text>
          </TouchableOpacity>
        </View>

        <View style={athleteFocusCard}>
          <View style={athleteFocusCardHeaderRow}>
            <View style={{ gap: 6 }}>
              <Text style={athleteFocusCardTitle}>Daily Sport Insight</Text>
              <Text style={athleteFocusCardSubtitle}>
                {athleteFocusDailyInsight}
              </Text>
            </View>

            <TouchableOpacity
              style={athleteFocusRoundBtn}
              onPress={shareDailyInsight}
              activeOpacity={0.9}
            >
              <Image source={require('../assets/images/share.png')} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={athleteFocusCard}>
          <View style={athleteFocusCardHeaderRow}>
            <View style={{ gap: 6 }}>
              <Text style={athleteFocusCardTitle}>Match Day Notes</Text>
              <Text style={athleteFocusCardSubtitle}>Add a new note</Text>
            </View>

            <TouchableOpacity
              style={athleteFocusRoundBtn}
              onPress={athleteFocusOnAddNotePress}
              activeOpacity={0.9}
            >
              <Image source={require('../assets/images/add.png')} />
            </TouchableOpacity>
          </View>

          <View style={athleteFocusDivider} />

          {athleteFocusNotes.length === 0 ? (
            <Text style={athleteFocusEmptyText}>No entries yet</Text>
          ) : (
            <FlatList
              data={athleteFocusNotes}
              keyExtractor={i => i.id}
              renderItem={athleteFocusRenderNote}
              scrollEnabled={false}
              contentContainerStyle={{ paddingTop: 6 }}
            />
          )}
        </View>

        {/* Sport Mood Tracker */}
        <View style={[athleteFocusCard, { paddingBottom: 18 }]}>
          <Text style={athleteFocusCardTitle}>Sport Mood Tracker</Text>
          <Text style={[athleteFocusCardSubtitle, { marginTop: 6 }]}>
            Choose your mood today
          </Text>

          <View style={athleteFocusMoodRow}>
            <TouchableOpacity
              style={[
                athleteFocusMoodBtn,
                athleteFocusMood === 'bad' && athleteFocusMoodBtnActive,
              ]}
              onPress={() => athleteFocusSetMoodToday('bad')}
              activeOpacity={0.9}
            >
              <Text style={athleteFocusMoodText}>Bad</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                athleteFocusMoodBtn,
                athleteFocusMood === 'normal' && athleteFocusMoodBtnActive,
              ]}
              onPress={() => athleteFocusSetMoodToday('normal')}
              activeOpacity={0.9}
            >
              <Text style={athleteFocusMoodText}>Normal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                athleteFocusMoodBtn,
                athleteFocusMood === 'perfect' && athleteFocusMoodBtnActive,
              ]}
              onPress={() => athleteFocusSetMoodToday('perfect')}
              activeOpacity={0.9}
            >
              <Text style={athleteFocusMoodText}>Perfect</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={athleteFocusAddVisible}
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
            <View style={athleteFocusSheet}>
              <View style={athleteFocusModalHeader}>
                <Text style={athleteFocusModalTitle}>ADD NEW NOTE</Text>
                <TouchableOpacity
                  onPress={() => setAthleteFocusAddVisible(false)}
                  style={athleteFocusCloseBtn}
                  activeOpacity={0.85}
                >
                  <Image source={require('../assets/images/close.png')} />
                </TouchableOpacity>
              </View>

              <View style={athleteFocusHr} />

              <View style={{ gap: 16, marginTop: 18 }}>
                <TextInput
                  value={athleteFocusFieldA}
                  onChangeText={setAthleteFocusFieldA}
                  placeholder="Who watched"
                  placeholderTextColor="#FFFFFF99"
                  style={athleteFocusField}
                  multiline
                  textAlignVertical="top"
                />
                <TextInput
                  value={athleteFocusFieldB}
                  onChangeText={setAthleteFocusFieldB}
                  placeholder="What was memorable"
                  placeholderTextColor="#FFFFFF99"
                  style={[athleteFocusField, { minHeight: 127 }]}
                  multiline
                  textAlignVertical="top"
                />
                <TextInput
                  value={athleteFocusFieldC}
                  onChangeText={setAthleteFocusFieldC}
                  placeholder="Own thoughts"
                  placeholderTextColor="#FFFFFF99"
                  style={[athleteFocusField, { minHeight: 127 }]}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={athleteFocusFooterCenter}>
                <TouchableOpacity
                  style={athleteFocusRoundAction}
                  onPress={athleteFocusAddNote}
                  activeOpacity={0.9}
                >
                  <Image source={require('../assets/images/add.png')} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          statusBarTranslucent={Platform.OS === 'android'}
          visible={athleteFocusOpenVisible}
          transparent
          animationType="fade"
        >
          {Platform.OS === 'ios' && (
            <BlurView
              blurType="light"
              style={athleteFocusBlurFill}
              blurRadius={2}
            />
          )}

          <View style={athleteFocusBackdrop}>
            <View style={athleteFocusSheet}>
              <View style={athleteFocusModalHeader}>
                <Text style={athleteFocusModalTitle}>
                  {athleteFocusOpenTitle}
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    await athleteFocusSaveOpenedNoteIfChanged();
                    setAthleteFocusOpenVisible(false);
                  }}
                  style={athleteFocusCloseBtn}
                  activeOpacity={0.85}
                >
                  <Image source={require('../assets/images/close.png')} />
                </TouchableOpacity>
              </View>

              <View style={athleteFocusHr} />

              <View style={{ gap: 16, marginTop: 18 }}>
                <TextInput
                  value={athleteFocusFieldA}
                  onChangeText={setAthleteFocusFieldA}
                  placeholder="Who watched"
                  placeholderTextColor="#FFFFFF99"
                  style={athleteFocusField}
                  multiline
                  editable={false}
                />
                <TextInput
                  value={athleteFocusFieldB}
                  onChangeText={setAthleteFocusFieldB}
                  placeholder="..."
                  placeholderTextColor="#FFFFFF99"
                  style={[athleteFocusField, { minHeight: 127 }]}
                  multiline
                  editable={false}
                  textAlignVertical="top"
                />
                <TextInput
                  value={athleteFocusFieldC}
                  onChangeText={setAthleteFocusFieldC}
                  placeholder="..."
                  placeholderTextColor="#FFFFFF99"
                  style={[athleteFocusField, { minHeight: 127 }]}
                  multiline
                  editable={false}
                  textAlignVertical="top"
                />
              </View>

              <View style={athleteFocusFooterRow}>
                <TouchableOpacity
                  style={athleteFocusRoundAction}
                  onPress={athleteFocusDeleteNote}
                  activeOpacity={0.9}
                >
                  <Image source={require('../assets/images/delete.png')} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={athleteFocusRoundAction}
                  onPress={athleteFocusShareNote}
                  activeOpacity={0.9}
                >
                  <Image source={require('../assets/images/share.png')} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollLayout>
  );
};

export default HomeScrn;

const athleteFocusContainer = {
  flex: 1,
  paddingHorizontal: 18,
  paddingTop: 80,
  paddingBottom: 150,
};

const athleteFocusHeader = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  marginBottom: 18,
};

const athleteFocusHeaderLeft = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 12,
  flex: 1,
};

const athleteFocusAvatarWrap = {
  width: 68,
  height: 68,
  borderRadius: 16,
  overflow: 'hidden' as const,
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderWidth: 1,
  borderColor: '#fff',
};

const athleteFocusAvatar = { width: '100%', height: '100%' };
const athleteFocusAvatarEmpty = { flex: 1 };

const athleteFocusHello = {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusAbout = {
  color: 'rgba(255,255,255,0.75)',
  fontSize: 12,
};

const athleteFocusProfileBtn = {
  backgroundColor: '#F21D16',
  paddingHorizontal: 18,
  height: 46,
  borderRadius: 999,
  alignItems: 'center' as const,
  minWidth: 116,
  justifyContent: 'center' as const,
  marginLeft: 12,
};

const athleteFocusProfileBtnText = {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusCard = {
  borderWidth: 1,
  borderColor: '#FFFFFF',
  borderRadius: 22,
  padding: 18,
  marginTop: 14,
  backgroundColor: 'rgba(255, 255, 255, 0.068)',
};

const athleteFocusCardHeaderRow = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  gap: 12,
};

const athleteFocusCardTitle = {
  color: '#fff',
  fontSize: 16,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusCardSubtitle = {
  color: 'rgba(255,255,255,0.65)',
  fontSize: 14,
  lineHeight: 16,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusRoundBtn = {
  width: 69,
  height: 46,
  borderRadius: 444,
  backgroundColor: '#F21D16',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const athleteFocusDivider = {
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.25)',
  marginTop: 14,
};

const athleteFocusEmptyText = {
  color: 'rgba(255,255,255,0.55)',
  fontSize: 12,
  paddingTop: 12,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusNoteRow = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  paddingVertical: 10,
};

const athleteFocusNoteText = {
  color: 'rgba(255,255,255,0.85)',
  fontSize: 13,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusChevron = {
  color: 'rgba(255,255,255,0.65)',
  fontSize: 22,
  marginLeft: 10,
  marginTop: -2,
};

const athleteFocusMoodRow = {
  flexDirection: 'row' as const,
  gap: 12,
  marginTop: 14,
};

const athleteFocusMoodBtn = {
  flex: 1,
  height: 44,
  borderRadius: 999,
  backgroundColor: '#F21D16',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  opacity: 0.7,
};

const athleteFocusMoodBtnActive = {
  opacity: 1,
  transform: [{ scale: 1.02 }],
  backgroundColor: '#53BF2F',
};

const athleteFocusMoodText = {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusBackdrop = {
  flex: 1,
  backgroundColor: '#030E10CC',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingHorizontal: 24,
};

const athleteFocusBlurFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const athleteFocusSheet = {
  width: '100%',
  borderRadius: 26,
  borderWidth: 1,
  borderColor: '#FFFFFF',
  backgroundColor: '#FFFFFF12',
  padding: 18,
  paddingVertical: 25,
};

const athleteFocusModalHeader = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  gap: 12,
};

const athleteFocusModalTitle = {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusCloseBtn = {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const athleteFocusHr = {
  height: 1,
  backgroundColor: '#FFFFFF40',
  marginTop: 12,
  marginBottom: 8,
};

const athleteFocusField = {
  width: '100%',
  minHeight: 80,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: '#FFFFFF',
  paddingHorizontal: 18,
  paddingVertical: 16,
  color: '#fff',
  backgroundColor: 'rgba(0,0,0,0.14)',
  fontSize: 14,
};

const athleteFocusFooterCenter = {
  marginTop: 22,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingBottom: 2,
};

const athleteFocusFooterRow = {
  marginTop: 22,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 16,
  paddingBottom: 2,
};

const athleteFocusRoundAction = {
  width: 69,
  height: 46,
  borderRadius: 999,
  backgroundColor: '#F21D16',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

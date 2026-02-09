import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Share, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ScrollLayout from '../components/ScrollLayout';

type MoodAthleteFocus = 'bad' | 'normal' | 'perfect';

type NoteFieldsAthleteFocus = { a: string; b: string; c: string };
type NoteAthleteFocus = {
  id: string;
  createdAt: number;
  fields: NoteFieldsAthleteFocus;
};

const athleteFocusNotesKey = '@notes';
const athleteFocusMoodTodayKey = '@mood_today';
const athleteFocusNicknameHistoryKey = '@nickname_history';

const athleteFocusPad2 = (n: number) => String(n).padStart(2, '0');

const athleteFocusToDateKey = (d: Date) =>
  `${d.getFullYear()}-${athleteFocusPad2(d.getMonth() + 1)}-${athleteFocusPad2(
    d.getDate(),
  )}`;

const athleteFocusFromYMD = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const athleteFocusMonthName = (monthIdx: number) =>
  [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][monthIdx];

const athleteFocusGetMonthMatrix = (year: number, monthIdx: number) => {
  const first = new Date(year, monthIdx, 1);
  const startDay = first.getDay(); // 0 Sun .. 6 Sat

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const weeks: Array<Array<number | null>> = [];
  let currentWeek: Array<number | null> = [];

  for (let i = 0; i < startDay; i++) currentWeek.push(null);

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return weeks;
};

const StatisticsScreen: React.FC = () => {
  const [athleteFocusTab, setAthleteFocusTab] = useState<
    'calendar' | 'counters'
  >('calendar');

  const [athleteFocusNotes, setAthleteFocusNotes] = useState<
    NoteAthleteFocus[]
  >([]);
  const [athleteFocusMoodMap, setAthleteFocusMoodMap] = useState<
    Record<string, MoodAthleteFocus>
  >({});
  const [athleteFocusAliasesCount, setAthleteFocusAliasesCount] =
    useState<number>(0);

  const [athleteFocusSelectedDateKey, setAthleteFocusSelectedDateKey] =
    useState<string>(athleteFocusToDateKey(new Date()));

  const athleteFocusSelectedDate = useMemo(
    () => athleteFocusFromYMD(athleteFocusSelectedDateKey),
    [athleteFocusSelectedDateKey],
  );

  const [athleteFocusViewYear, setAthleteFocusViewYear] = useState<number>(
    athleteFocusSelectedDate.getFullYear(),
  );
  const [athleteFocusViewMonthIdx, setAthleteFocusViewMonthIdx] =
    useState<number>(athleteFocusSelectedDate.getMonth());

  const athleteFocusSelectedMood =
    athleteFocusMoodMap[athleteFocusSelectedDateKey] ?? null;

  const athleteFocusLoadAll = async () => {
    try {
      const [nRaw, mRaw, historyRaw] = await Promise.all([
        AsyncStorage.getItem(athleteFocusNotesKey),
        AsyncStorage.getItem(athleteFocusMoodTodayKey),
        AsyncStorage.getItem(athleteFocusNicknameHistoryKey),
      ]);

      if (nRaw) {
        const list: NoteAthleteFocus[] = JSON.parse(nRaw);
        setAthleteFocusNotes(Array.isArray(list) ? list : []);
      } else {
        setAthleteFocusNotes([]);
      }

      if (mRaw) {
        const obj: Record<string, MoodAthleteFocus> = JSON.parse(mRaw);
        setAthleteFocusMoodMap(obj ?? {});
      } else {
        setAthleteFocusMoodMap({});
      }

      if (historyRaw) {
        const parsed = JSON.parse(historyRaw);
        setAthleteFocusAliasesCount(Array.isArray(parsed) ? parsed.length : 0);
      } else {
        setAthleteFocusAliasesCount(0);
      }
    } catch (e) {
      console.warn('Statistics load error', e);
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

  useEffect(() => {
    setAthleteFocusViewYear(athleteFocusSelectedDate.getFullYear());
    setAthleteFocusViewMonthIdx(athleteFocusSelectedDate.getMonth());
  }, [athleteFocusSelectedDateKey]);

  const athleteFocusWeeks = useMemo(
    () =>
      athleteFocusGetMonthMatrix(
        athleteFocusViewYear,
        athleteFocusViewMonthIdx,
      ),
    [athleteFocusViewYear, athleteFocusViewMonthIdx],
  );

  const athleteFocusGoPrevMonth = () => {
    const d = new Date(athleteFocusViewYear, athleteFocusViewMonthIdx - 1, 1);
    setAthleteFocusViewYear(d.getFullYear());
    setAthleteFocusViewMonthIdx(d.getMonth());
  };

  const athleteFocusGoNextMonth = () => {
    const d = new Date(athleteFocusViewYear, athleteFocusViewMonthIdx + 1, 1);
    setAthleteFocusViewYear(d.getFullYear());
    setAthleteFocusViewMonthIdx(d.getMonth());
  };

  const athleteFocusPickDay = (day: number) => {
    const d = new Date(athleteFocusViewYear, athleteFocusViewMonthIdx, day);
    setAthleteFocusSelectedDateKey(athleteFocusToDateKey(d));
  };

  const athleteFocusCounters = useMemo(() => {
    const moodDays = Object.keys(athleteFocusMoodMap);

    const noteDays = new Set<string>();
    for (const n of athleteFocusNotes) {
      const d = new Date(n.createdAt);
      noteDays.add(athleteFocusToDateKey(d));
    }

    const activeDaysSet = new Set<string>([
      ...moodDays,
      ...Array.from(noteDays),
    ]);
    const activeDays = activeDaysSet.size;

    const numberOfNotes = athleteFocusNotes.length;

    const freq: Record<MoodAthleteFocus, number> = {
      bad: 0,
      normal: 0,
      perfect: 0,
    };
    for (const k of Object.keys(athleteFocusMoodMap)) {
      const v = athleteFocusMoodMap[k];
      if (v) freq[v] += 1;
    }

    const moodByDay =
      freq.bad === 0 && freq.normal === 0 && freq.perfect === 0
        ? '—'
        : Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

    return {
      activeDays,
      numberOfNotes,
      moodByDay,
      aliasesCount: athleteFocusAliasesCount,
    };
  }, [athleteFocusMoodMap, athleteFocusNotes, athleteFocusAliasesCount]);

  const athleteFocusOnShareCounters = async () => {
    const msg = [
      'STATISTICS',
      `Active days: ${athleteFocusCounters.activeDays}`,
      `Number of notes: ${athleteFocusCounters.numberOfNotes}`,
      `Mood by day: ${athleteFocusCounters.moodByDay}`,
      `Generated aliases: ${athleteFocusCounters.aliasesCount}`,
    ].join('\n');

    try {
      await Share.share({ message: msg });
    } catch (e) {
      console.warn('share error', e);
    }
  };

  const athleteFocusMoodLabel = (m: MoodAthleteFocus | null) => {
    if (!m) return '—';
    return m === 'bad' ? 'Bad' : m === 'normal' ? 'Normal' : 'Perfect';
  };

  return (
    <ScrollLayout>
      <View style={athleteFocusContainer}>
        <View style={athleteFocusHeaderRow}>
          <Text style={athleteFocusTitle}>STATISTICS</Text>

          <View style={athleteFocusTabsRow}>
            <TouchableOpacity
              style={[
                athleteFocusTabBtn,
                athleteFocusTab === 'calendar' && athleteFocusTabBtnActive,
              ]}
              onPress={() => setAthleteFocusTab('calendar')}
              activeOpacity={0.9}
            >
              <Text style={athleteFocusTabText}>Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                athleteFocusTabBtn,
                athleteFocusTab === 'counters' && athleteFocusTabBtnActive,
              ]}
              onPress={() => setAthleteFocusTab('counters')}
              activeOpacity={0.9}
            >
              <Text style={athleteFocusTabText}>Counters</Text>
            </TouchableOpacity>
          </View>
        </View>

        {athleteFocusTab === 'calendar' ? (
          <View style={athleteFocusBigCard}>
            {!athleteFocusSelectedMood ? (
              <View style={athleteFocusChooseBox}>
                <Text style={athleteFocusChooseText}>Choose a date</Text>
              </View>
            ) : (
              <View style={athleteFocusMoodHeader}>
                <View style={{ gap: 4 }}>
                  <Text style={athleteFocusCardTitle}>Sport Mood Tracker</Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={athleteFocusCardSub}>Your mood day:</Text>
                  <View style={athleteFocusMoodPill}>
                    <Text style={athleteFocusMoodPillText}>
                      {athleteFocusMoodLabel(athleteFocusSelectedMood)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={athleteFocusCalendarBox}>
              <View style={athleteFocusCalendarHeader}>
                <View style={athleteFocusMonthRow}>
                  <Text style={athleteFocusMonthText}>
                    {athleteFocusMonthName(athleteFocusViewMonthIdx)}{' '}
                    {athleteFocusViewYear}
                  </Text>
                  <Text style={athleteFocusMonthArrow}>›</Text>
                </View>

                <View style={athleteFocusNavRow}>
                  <TouchableOpacity
                    onPress={athleteFocusGoPrevMonth}
                    activeOpacity={0.8}
                    style={athleteFocusNavBtn}
                  >
                    <Text style={athleteFocusNavText}>‹</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={athleteFocusGoNextMonth}
                    activeOpacity={0.8}
                    style={athleteFocusNavBtn}
                  >
                    <Text style={athleteFocusNavText}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={athleteFocusWeekdaysRow}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                  <Text key={d} style={athleteFocusWeekday}>
                    {d}
                  </Text>
                ))}
              </View>

              <View style={{ gap: 10, marginTop: 8 }}>
                {athleteFocusWeeks.map((w, wi) => (
                  <View key={wi} style={athleteFocusWeekRow}>
                    {w.map((day, di) => {
                      const isSelected =
                        day != null &&
                        athleteFocusSelectedDateKey ===
                          athleteFocusToDateKey(
                            new Date(
                              athleteFocusViewYear,
                              athleteFocusViewMonthIdx,
                              day,
                            ),
                          );

                      return (
                        <TouchableOpacity
                          key={`${wi}-${di}`}
                          style={[
                            athleteFocusDayCell,
                            isSelected && athleteFocusDayCellSelected,
                          ]}
                          onPress={() =>
                            day != null && athleteFocusPickDay(day)
                          }
                          activeOpacity={day == null ? 1 : 0.85}
                          disabled={day == null}
                        >
                          <Text
                            style={[
                              athleteFocusDayText,
                              isSelected && athleteFocusDayTextSelected,
                            ]}
                          >
                            {day ?? ''}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={athleteFocusBigCard}>
            <View style={athleteFocusCounterItem}>
              <Text style={athleteFocusCounterValue}>
                {athleteFocusCounters.activeDays}
              </Text>
              <Text style={athleteFocusCounterLabel}>active days</Text>
            </View>

            <View style={athleteFocusCounterItem}>
              <Text style={athleteFocusCounterValue}>
                {athleteFocusCounters.numberOfNotes}
              </Text>
              <Text style={athleteFocusCounterLabel}>number of notes</Text>
            </View>

            <View style={athleteFocusCounterItem}>
              <Text style={athleteFocusCounterValue}>
                {athleteFocusCounters.moodByDay}
              </Text>
              <Text style={athleteFocusCounterLabel}>mood by day</Text>
            </View>

            <View style={athleteFocusCounterItem}>
              <Text style={athleteFocusCounterValue}>
                {athleteFocusCounters.aliasesCount}
              </Text>
              <Text style={athleteFocusCounterLabel}>generated aliases</Text>
            </View>

            <TouchableOpacity
              style={athleteFocusShareRound}
              onPress={athleteFocusOnShareCounters}
              activeOpacity={0.9}
            >
              <Image source={require('../assets/images/share.png')} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollLayout>
  );
};

const athleteFocusContainer = {
  flex: 1,
  paddingHorizontal: 25,
  paddingTop: 80,
};

const athleteFocusHeaderRow = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  gap: 12,
  marginBottom: 20,
};

const athleteFocusTitle = {
  color: '#fff',
  fontSize: 24,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusTabsRow = {
  flexDirection: 'row' as const,
  gap: 10,
};

const athleteFocusTabBtn = {
  height: 46,
  paddingHorizontal: 18,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: '#FFFFFF99',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  backgroundColor: 'transparent',
};

const athleteFocusTabBtnActive = {
  backgroundColor: '#F21D16',
  borderColor: 'transparent',
};

const athleteFocusTabText = {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusBigCard = {
  marginTop: 18,
  borderWidth: 1,
  borderColor: '#FFFFFF',
  borderRadius: 26,
  padding: 20,
  backgroundColor: '#FFFFFF12',
};

const athleteFocusChooseBox = {
  borderWidth: 1,
  borderColor: '#FFFFFF',
  borderRadius: 22,
  paddingVertical: 18,
  paddingHorizontal: 18,
  minHeight: 80,
};

const athleteFocusChooseText = {
  color: 'rgba(255,255,255,0.65)',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusMoodHeader = {
  borderWidth: 1,
  borderColor: '#FFFFFF',
  borderRadius: 22,
  paddingVertical: 16,
  paddingHorizontal: 18,
  minHeight: 100,
};

const athleteFocusCardTitle = {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
  marginBottom: 9,
};

const athleteFocusCardSub = {
  color: 'rgba(255,255,255,0.65)',
  fontSize: 12,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusMoodPill = {
  height: 46,
  paddingHorizontal: 18,
  borderRadius: 999,
  backgroundColor: '#F21D16',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  minWidth: 90,
};

const athleteFocusMoodPillText = {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusCalendarBox = {
  marginTop: 16,
  borderRadius: 18,
  backgroundColor: '#fff',
  padding: 14,
};

const athleteFocusCalendarHeader = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
};

const athleteFocusMonthRow = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 6,
};

const athleteFocusMonthText = {
  color: '#000',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusMonthArrow = {
  color: '#2B74FF',
  fontSize: 18,
  marginTop: -2,
};

const athleteFocusNavRow = {
  flexDirection: 'row' as const,
  gap: 8,
};

const athleteFocusNavBtn = {
  width: 34,
  height: 28,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const athleteFocusNavText = {
  color: '#2B74FF',
  fontSize: 22,
  marginTop: -2,
};

const athleteFocusWeekdaysRow = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  marginTop: 10,
  paddingHorizontal: 2,
};

const athleteFocusWeekday = {
  width: 36,
  textAlign: 'center' as const,
  color: 'rgba(0,0,0,0.35)',
  fontSize: 10,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusWeekRow = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
};

const athleteFocusDayCell = {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const athleteFocusDayCellSelected = {
  backgroundColor: '#2B74FF',
};

const athleteFocusDayText = {
  color: '#000',
  fontSize: 14,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusDayTextSelected = {
  color: '#fff',
};

const athleteFocusCounterItem = {
  borderWidth: 1,
  borderColor: '#FFFFFF',
  borderRadius: 22,
  padding: 18,
  backgroundColor: 'rgba(255,255,255,0.04)',
  marginTop: 14,
};

const athleteFocusCounterValue = {
  color: '#fff',
  fontSize: 18,
  fontFamily: 'FjallaOne-Regular',
  marginBottom: 19,
};

const athleteFocusCounterLabel = {
  color: 'rgba(255,255,255,0.60)',
  fontSize: 12,
  fontFamily: 'FjallaOne-Regular',
};

const athleteFocusShareRound = {
  marginTop: 16,
  alignSelf: 'center' as const,
  width: 69,
  height: 46,
  borderRadius: 999,
  backgroundColor: '#F21D16',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export default StatisticsScreen;

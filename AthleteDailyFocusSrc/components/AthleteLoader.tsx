import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { htmlAthletesLoader } from '../constants/htmlAthletesLoader';
import ScrollLayout from './ScrollLayout';

const AthleteLoader: React.FC = () => {
  const navigation = useNavigation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      navigation.navigate('WelcomeScreen');
    }, 5000);
  }, [navigation]);

  return (
    <ScrollLayout>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlAthletesLoader }}
          style={{ width: 160, height: 50, backgroundColor: 'transparent' }}
          scrollEnabled={false}
        />
      </View>
    </ScrollLayout>
  );
};

export default AthleteLoader;

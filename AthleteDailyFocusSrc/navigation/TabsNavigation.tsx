import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet, View } from 'react-native';
import HomeScrn from '../screens/HomeScrn';
import StatisticsScreen from '../screens/StatisticsScreen';
import AthleteNicknames from '../screens/AthleteNicknames';
import InformationScreen from '../screens/InformationScreen';

const Tab = createBottomTabNavigator();

const TabsNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.bottomTabBar,
        tabBarActiveTintColor: '#FFF',
        tabBarInactiveTintColor: '#FFF',
      }}
    >
      <Tab.Screen
        name="HomeScrn"
        component={HomeScrn}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabActive,
                !focused && { backgroundColor: 'transparent' },
              ]}
            >
              <Image
                source={require('../assets/tabIcons/home.png')}
                style={{ tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="StatisticsScreen"
        component={StatisticsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabActive,
                !focused && { backgroundColor: 'transparent' },
              ]}
            >
              <Image
                source={require('../assets/tabIcons/stats.png')}
                style={{ tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AthleteNicknames"
        component={AthleteNicknames}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabActive,
                !focused && { backgroundColor: 'transparent' },
              ]}
            >
              <Image
                source={require('../assets/tabIcons/nicknames.png')}
                style={{ tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="InformationScreen"
        component={InformationScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabActive,
                !focused && { backgroundColor: 'transparent' },
              ]}
            >
              <Image
                source={require('../assets/tabIcons/info.png')}
                style={{ tintColor: color }}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bottomTabBar: {
    position: 'absolute',
    elevation: 0,
    bottom: 50,
    marginHorizontal: 27,
    backgroundColor: '#015E61',
    borderRadius: 22,
    paddingTop: 25,
    height: 90,
    borderWidth: 1,
    borderColor: '#fff',
    borderTopWidth: 1,
  },
  tabActive: {
    padding: 9,
    backgroundColor: '#F21D16',
    borderRadius: 12,
    alignSelf: 'center',
  },
});

export default TabsNavigation;

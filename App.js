import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Platform, StatusBar, View } from 'react-native';
import PiPPlayer from './src/components/PiPPlayer';
import { COLORS } from './src/constants/colors';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PiPProvider } from './src/context/PiPContext';
import { VideoProvider } from './src/context/VideoContext';
import EventDetailScreen from './src/screens/EventDetailScreen';
import EventsScreen from './src/screens/EventsScreen';
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import LiveTVScreen from './src/screens/LiveTVScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import ShowDetails from './src/screens/ShowDetails';
import ShowDetailScreen from './src/screens/ShowDetailScreen';
import VideoPlayer from './src/screens/VideoPlayer';

const Stack = createNativeStackNavigator();
const Tabs  = createBottomTabNavigator();

function TabBarIcon({ name, color, size }) {
  return <Ionicons name={name} color={color} size={size} />;
}

function RootTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.BLACK,
          borderTopColor: 'rgba(255,255,255,0.06)',
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 6
        },
        tabBarActiveTintColor: COLORS.WHITE,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen}
        options={{ tabBarIcon: p => <TabBarIcon name="home" {...p} /> }} />
      <Tabs.Screen name="Events" component={EventsScreen}
        options={{ tabBarIcon: p => <TabBarIcon name="calendar" {...p} /> }} />
      <Tabs.Screen name="Live TV" component={LiveTVScreen}
        options={{ tabBarIcon: p => <TabBarIcon name="list" {...p} /> }} />
      <Tabs.Screen name="Search" component={SearchScreen}
        options={{ tabBarIcon: p => <TabBarIcon name="search" {...p} /> }} />
      <Tabs.Screen name="Library" component={LibraryScreen}
        options={{ tabBarIcon: p => <TabBarIcon name="bookmark" {...p} /> }} />
      <Tabs.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarIcon: p => <TabBarIcon name="person" {...p} /> }} />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.BLACK, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.ORANGE} />
      </View>
    );
  }

  // Allow guest access - no authentication required to browse content
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Root" component={RootTabs} />
      <Stack.Screen 
        name="VideoPlayer" 
        component={VideoPlayer}
        options={{ 
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom' 
        }}
      />
      <Stack.Screen 
        name="ShowDetails" 
        component={ShowDetails}
        options={{
          presentation: 'card',
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="ShowDetailScreen" 
        component={ShowDetailScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="EventDetail" 
        component={EventDetailScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom' 
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  // Wrap the app in PiPProvider and render PiPPlayer at the root
  return (
    <AuthProvider>
      <VideoProvider>
        <PiPProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" />
            <AppNavigator />
            {/* Global PiP mini-player, always rendered at root */}
            <PiPPlayer />
          </NavigationContainer>
        </PiPProvider>
      </VideoProvider>
    </AuthProvider>
  );
}

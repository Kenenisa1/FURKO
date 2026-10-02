import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

// Screens
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { PhoneVerificationScreen } from '../screens/auth/PhoneVerificationScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ReportWizardScreen } from '../screens/report/ReportWizardScreen';
import { MyReportsScreen } from '../screens/tracking/MyReportsScreen';
import { ReportDetailScreen } from '../screens/tracking/ReportDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size || 22} />
          ),
        }}
      />
      <Tab.Screen
        name="ReportTab"
        component={ReportWizardScreen}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" color={color} size={size || 24} />
          ),
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={MyReportsScreen}
        options={{
          tabBarLabel: 'My Reports',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" color={color} size={size || 22} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size || 22} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'MainTabs' : 'Welcome'}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Auth & Onboarding Flow matching requested pipeline */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* Main Application with Bottom Tabs */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Detail Screens */}
        <Stack.Screen name="ReportWizard" component={ReportWizardScreen} />
        <Stack.Screen name="MyReports" component={MyReportsScreen} />
        <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

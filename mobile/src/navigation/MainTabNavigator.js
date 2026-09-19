import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, typography, radii, spacing } from '../theme/index.js';

// Screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen.js';
import { ResumeUploadScreen } from '../screens/resume/ResumeUploadScreen.js';
import { ResumeScoreScreen } from '../screens/resume/ResumeScoreScreen.js';
import { JobMatcherScreen } from '../screens/jobs/JobMatcherScreen.js';
import { JobRecommendationsScreen } from '../screens/jobs/JobRecommendationsScreen.js';
import { RoadmapScreen } from '../screens/jobs/RoadmapScreen.js';
import { InterviewHubScreen } from '../screens/interview/InterviewHubScreen.js';
import { MockInterviewScreen } from '../screens/interview/MockInterviewScreen.js';
import { InterviewResultsScreen } from '../screens/interview/InterviewResultsScreen.js';
import { ProfileScreen } from '../screens/profile/ProfileScreen.js';

const Tab = createBottomTabNavigator();
const ResumeStackNav = createNativeStackNavigator();
const JobsStackNav = createNativeStackNavigator();
const InterviewStackNav = createNativeStackNavigator();

// Resume Stack
const ResumeNavigator = () => (
  <ResumeStackNav.Navigator screenOptions={{ headerShown: false }}>
    <ResumeStackNav.Screen name="ResumeUpload" component={ResumeUploadScreen} />
    <ResumeStackNav.Screen name="ResumeScore" component={ResumeScoreScreen} />
  </ResumeStackNav.Navigator>
);

// Jobs & Skills Stack
const JobsNavigator = () => (
  <JobsStackNav.Navigator screenOptions={{ headerShown: false }}>
    <JobsStackNav.Screen name="JobMatcher" component={JobMatcherScreen} />
    <JobsStackNav.Screen name="JobRecommendations" component={JobRecommendationsScreen} />
    <JobsStackNav.Screen name="Roadmap" component={RoadmapScreen} />
    <JobsStackNav.Screen name="MockInterview" component={MockInterviewScreen} />
  </JobsStackNav.Navigator>
);

// Interview Practice Stack
const InterviewNavigator = () => (
  <InterviewStackNav.Navigator screenOptions={{ headerShown: false }}>
    <InterviewStackNav.Screen name="InterviewHub" component={InterviewHubScreen} />
    <InterviewStackNav.Screen name="MockInterview" component={MockInterviewScreen} />
    <InterviewStackNav.Screen name="InterviewResults" component={InterviewResultsScreen} />
  </InterviewStackNav.Navigator>
);

// Tab Icon Component
const TabIcon = ({ icon, label, focused }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
  </View>
);

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📊" label="Overview" focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name="Resume"
        component={ResumeNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📄" label="Resume" focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎯" label="Matcher" focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name="Interview"
        component={InterviewNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎙️" label="Interview" focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚙️" label="Profile" focused={focused} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56
  },
  tabEmoji: {
    fontSize: 18,
    opacity: 0.6
  },
  tabEmojiFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }]
  },
  tabLabel: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 2,
    fontWeight: typography.weights.medium,
    marginTop: 2
  },
  tabLabelFocused: {
    color: colors.primaryLight,
    fontWeight: typography.weights.bold
  }
});

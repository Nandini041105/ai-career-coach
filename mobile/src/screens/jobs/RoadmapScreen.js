import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext.js';
import { colors, radii, spacing, typography, shadows } from '../../theme/index.js';
import { Header } from '../../components/Header.js';
import { Button } from '../../components/Button.js';
import { roadmapApi } from '../../api/client.js';

export const RoadmapScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const res = await roadmapApi.getLatest();
      if (res.data?.roadmap) {
        setRoadmap(res.data.roadmap);
      }
    } catch (e) {
      console.warn('[Roadmap] Load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    try {
      const res = await roadmapApi.generate({
        targetRole: user?.targetRole || 'Software Engineer'
      });
      if (res.data?.roadmap) {
        setRoadmap(res.data.roadmap);
        Alert.alert('Roadmap Generated!', 'Your customized 4-week curriculum is ready.');
      }
    } catch (error) {
      Alert.alert('Generation Failed', error.message || 'Could not generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = (weekIndex, taskIndex) => {
    const key = `${weekIndex}_${taskIndex}`;
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const weeks = roadmap?.weeks || [
    {
      weekNumber: 1,
      theme: 'Fundamentals & Architectural Deep Dive',
      focusAreas: ['Core Language Constructs', 'Timing & Clocking Fundamentals', 'Standard Protocols'],
      tasks: [
        'Review synchronous design best practices & reset synchronizers',
        'Implement parameterized circular FIFO buffer with full/empty flags',
        'Run linting checks and eliminate all latch inferences'
      ]
    },
    {
      weekNumber: 2,
      theme: 'Design Implementation & Verification',
      focusAreas: ['Bus Protocols (AXI4 / APB)', 'Finite State Machines (FSM)', 'Testbench Architecture'],
      tasks: [
        'Architect Moore vs Mealy FSM with one-hot encoding for control logic',
        'Design an APB slave peripheral interface with read/write registers',
        'Create self-checking testbench with random stimulus generation'
      ]
    },
    {
      weekNumber: 3,
      theme: 'Optimization & Industry Toolchains',
      focusAreas: ['Clock Domain Crossing (CDC)', 'Static Timing Analysis (STA)', 'Power Reduction'],
      tasks: [
        'Analyze setup and hold timing closure constraints',
        'Implement 2-stage flip-flop synchronizers and Gray code pointer CDC',
        'Optimize critical path logic depth to meet target clock frequency'
      ]
    },
    {
      weekNumber: 4,
      theme: 'Portfolio Project & Technical Interview Defense',
      focusAreas: ['System Integration', 'Git Architecture Docs', 'Mock Interview Defense'],
      tasks: [
        'Synthesize and package complete subsystem with waveform captures',
        'Write concise README documenting architectural trade-offs and PPA',
        'Complete 2 full AI Mock Interview technical rounds on this repository'
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="4-Week Learning Roadmap"
        subtitle={`Personalized for ${roadmap?.targetRole || user?.targetRole || 'Engineering'}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadRoadmap();
            }}
            tintColor={colors.primaryLight}
          />
        }
      >
        {/* Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerHeader}>
            <Text style={styles.bannerBadge}>⚡ STEP-BY-STEP CURRICULUM</Text>
            <TouchableOpacity onPress={handleGenerateRoadmap} disabled={generating}>
              <Text style={styles.regenerateText}>
                {generating ? 'Regenerating...' : '🔄 Refresh AI Roadmap'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bannerTitle}>Bridge Your Prioritized Skill Gaps</Text>
          <Text style={styles.bannerSubtitle}>
            Engineered week-by-week progression to transform missing skills into interview-ready strengths.
          </Text>
        </View>

        {/* 4-Week Timeline */}
        {weeks.map((week, wIdx) => (
          <View key={wIdx} style={styles.weekCard}>
            <View style={styles.weekHeader}>
              <View style={styles.weekNumberBadge}>
                <Text style={styles.weekNumberText}>WEEK {week.weekNumber || wIdx + 1}</Text>
              </View>
              <Text style={styles.weekTheme} numberOfLines={1}>
                {week.theme || week.title}
              </Text>
            </View>

            {/* Focus Areas Chips */}
            {week.focusAreas && (
              <View style={styles.focusTagsContainer}>
                {week.focusAreas.map((area, aIdx) => (
                  <View key={aIdx} style={styles.focusTag}>
                    <Text style={styles.focusTagText}>{area}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Tasks */}
            <View style={styles.tasksContainer}>
              <Text style={styles.tasksHeader}>Actionable Milestones:</Text>
              {(week.tasks || []).map((task, tIdx) => {
                const isChecked = completedTasks[`${wIdx}_${tIdx}`];
                return (
                  <TouchableOpacity
                    key={tIdx}
                    style={styles.taskItem}
                    activeOpacity={0.7}
                    onPress={() => toggleTask(wIdx, tIdx)}
                  >
                    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                      {isChecked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text
                      style={[
                        styles.taskText,
                        isChecked && styles.taskTextCompleted
                      ]}
                    >
                      {task}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Practice CTA */}
        <View style={styles.practiceCtaCard}>
          <Text style={styles.practiceCtaTitle}>Ready to Test Your Progress?</Text>
          <Text style={styles.practiceCtaSubtitle}>
            Run an AI Mock Interview round to assess your grasp of these weekly milestones.
          </Text>
          <Button
            title="Start Mock Interview Session →"
            onPress={() => navigation.navigate('Interview')}
            size="md"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl
  },
  bannerCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  bannerBadge: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold
  },
  regenerateText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  },
  bannerTitle: {
    color: colors.text,
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold
  },
  bannerSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 3,
    lineHeight: 16
  },
  weekCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2
  },
  weekNumberBadge: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    marginRight: spacing.sm
  },
  weekNumberText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.heavy
  },
  weekTheme: {
    color: colors.text,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    flex: 1
  },
  focusTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginVertical: spacing.xs
  },
  focusTag: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  focusTagText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.medium
  },
  tasksContainer: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs + 2
  },
  tasksHeader: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    marginBottom: spacing.xs
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginRight: spacing.sm,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: typography.weights.bold
  },
  taskText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs + 1,
    lineHeight: 18,
    flex: 1
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary
  },
  practiceCtaCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginTop: spacing.xs,
    ...shadows.sm
  },
  practiceCtaTitle: {
    color: colors.text,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold
  },
  practiceCtaSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
    marginBottom: spacing.md
  }
});

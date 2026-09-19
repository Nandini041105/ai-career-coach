import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext.js';
import { colors, radii, spacing, typography, shadows, getScoreColor } from '../../theme/index.js';
import { Header } from '../../components/Header.js';
import { MetricCard } from '../../components/MetricCard.js';
import { ScoreRing } from '../../components/ScoreRing.js';
import { Button } from '../../components/Button.js';
import { dashboardApi, resumeApi, analysisApi, interviewApi } from '../../api/client.js';

export const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [latestResume, setLatestResume] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Load summary, resumes, and latest analysis concurrently
      const [summaryRes, resumesRes, analysisRes] = await Promise.allSettled([
        dashboardApi.getSummary(),
        resumeApi.getAll(),
        analysisApi.getLatest()
      ]);

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value.data?.summary || summaryRes.value.data);
      }

      if (resumesRes.status === 'fulfilled' && resumesRes.value.data?.resumes?.length > 0) {
        setLatestResume(resumesRes.value.data.resumes[0]);
      } else {
        setLatestResume(null);
      }

      if (analysisRes.status === 'fulfilled' && analysisRes.value.data?.analysis) {
        setLatestAnalysis(analysisRes.value.data.analysis);
      } else {
        setLatestAnalysis(null);
      }
    } catch (e) {
      console.warn('[Dashboard] Data fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const resumeScore = latestAnalysis?.overallScore || summary?.latestResumeScore || 0;
  const interviewsCount = summary?.totalInterviews || 0;
  const matchesCount = summary?.totalMatches || 0;
  const averageMatchScore = summary?.averageMatchScore || 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title={`Hi, ${user?.name?.split(' ')[0] || 'Engineer'} 👋`}
        subtitle="Your Autonomous Career Engineering Hub"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primaryLight}
          />
        }
      >
        {/* Hero ATS Score Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>⚡ AI RESUME SCORECARD</Text>
            </View>
            <Text style={styles.targetRoleText}>{user?.targetRole || 'Software Engineer'}</Text>
          </View>

          {latestAnalysis ? (
            <View style={styles.scoreRow}>
              <ScoreRing
                score={resumeScore}
                maxScore={100}
                size={110}
                strokeWidth={7}
                label=""
              />
              <View style={styles.scoreDetails}>
                <Text style={styles.scoreTitle}>
                  {resumeScore >= 80 ? 'ATS Ready & Competitive' : 'Optimization Recommended'}
                </Text>
                <Text style={styles.scoreDescription}>
                  {latestAnalysis.strengths?.length || 0} Strengths Identified • {latestAnalysis.weaknesses?.length || 0} Gaps Detected
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Resume', { screen: 'ResumeScore' })}
                  style={styles.viewScorecardButton}
                >
                  <Text style={styles.viewScorecardText}>View Full Scorecard →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyResumeContainer}>
              <Text style={styles.emptyResumeTitle}>No Resume Analyzed Yet</Text>
              <Text style={styles.emptyResumeSubtitle}>
                Upload your PDF resume to receive a comprehensive ATS Quality Score and role-specific breakdown.
              </Text>
              <Button
                title="Upload Resume PDF"
                size="sm"
                onPress={() => navigation.navigate('Resume', { screen: 'ResumeUpload' })}
                style={styles.uploadPromptButton}
              />
            </View>
          )}
        </View>

        {/* Quick Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Resume ATS"
            value={resumeScore > 0 ? `${resumeScore}%` : 'N/A'}
            subtitle="Overall Quality"
            badge={resumeScore > 0 ? (resumeScore >= 75 ? 'Strong' : 'Needs Work') : null}
            badgeColor={getScoreColor(resumeScore)}
            style={styles.metricHalf}
            onPress={() => navigation.navigate('Resume')}
          />
          <MetricCard
            title="Job Matches"
            value={matchesCount.toString()}
            subtitle={averageMatchScore > 0 ? `Avg ${averageMatchScore}% fit` : 'No matches yet'}
            badge={matchesCount > 0 ? `${matchesCount} Active` : null}
            badgeColor={colors.info}
            style={styles.metricHalf}
            onPress={() => navigation.navigate('Jobs')}
          />
        </View>

        {/* Action Hub */}
        <Text style={styles.sectionTitle}>AI Coaching Modules</Text>
        <View style={styles.actionGrid}>
          {/* Module 1: Resume Analyzer */}
          <TouchableOpacity
            style={styles.moduleCard}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Resume')}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: colors.primaryGlow, borderColor: colors.primary }]}>
              <Text style={styles.moduleIcon}>📄</Text>
            </View>
            <Text style={styles.moduleTitle}>Resume Analyzer</Text>
            <Text style={styles.moduleDescription}>
              8-point ATS scoring, action verbs & quantifiable metrics
            </Text>
          </TouchableOpacity>

          {/* Module 2: Job Matcher & Gaps */}
          <TouchableOpacity
            style={styles.moduleCard}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Jobs')}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: colors.infoGlow, borderColor: colors.info }]}>
              <Text style={styles.moduleIcon}>🎯</Text>
            </View>
            <Text style={styles.moduleTitle}>Job Matcher</Text>
            <Text style={styles.moduleDescription}>
              Weighted matching against job descriptions & skill gap roadmap
            </Text>
          </TouchableOpacity>

          {/* Module 3: Mock Interview */}
          <TouchableOpacity
            style={styles.moduleCard}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Interview')}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: colors.successGlow, borderColor: colors.success }]}>
              <Text style={styles.moduleIcon}>🎙️</Text>
            </View>
            <Text style={styles.moduleTitle}>AI Mock Interview</Text>
            <Text style={styles.moduleDescription}>
              Interactive practice with instant rubric grading & model answers
            </Text>
          </TouchableOpacity>

          {/* Module 4: 4-Week Roadmap */}
          <TouchableOpacity
            style={styles.moduleCard}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Jobs', { screen: 'Roadmap' })}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: colors.warningGlow, borderColor: colors.warning }]}>
              <Text style={styles.moduleIcon}>🗺️</Text>
            </View>
            <Text style={styles.moduleTitle}>Learning Roadmap</Text>
            <Text style={styles.moduleDescription}>
              Prioritized 4-week step-by-step technical milestone curriculum
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Mock Interview Widget */}
        <View style={styles.interviewWidget}>
          <View style={styles.widgetHeader}>
            <View style={styles.widgetTitleRow}>
              <Text style={styles.widgetIcon}>💡</Text>
              <Text style={styles.widgetTitle}>Practice Technical Interview</Text>
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>AI Ready</Text>
            </View>
          </View>
          <Text style={styles.widgetSubtitle}>
            Test your domain knowledge for {user?.targetRole || 'engineering'}. Receive immediate scoring (1-10) and feedback.
          </Text>
          <Button
            title="Start Mock Interview Session"
            size="md"
            onPress={() => navigation.navigate('Interview')}
            style={styles.startInterviewButton}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xl
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    ...shadows.md
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  heroBadge: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  heroBadgeText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5
  },
  targetRoleText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs
  },
  scoreDetails: {
    flex: 1,
    marginLeft: spacing.md
  },
  scoreTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold
  },
  scoreDescription: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 4,
    lineHeight: 16
  },
  viewScorecardButton: {
    marginTop: spacing.sm,
    paddingVertical: 4
  },
  viewScorecardText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold
  },
  emptyResumeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md
  },
  emptyResumeTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold
  },
  emptyResumeSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md
  },
  uploadPromptButton: {
    minWidth: 180
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  metricHalf: {
    flex: 1,
    marginBottom: 0
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  moduleCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm
  },
  moduleIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs + 2
  },
  moduleIcon: {
    fontSize: 18
  },
  moduleTitle: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: 2
  },
  moduleDescription: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 1,
    lineHeight: 14
  },
  interviewWidget: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    ...shadows.sm
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  widgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  widgetIcon: {
    fontSize: 16,
    marginRight: spacing.xs
  },
  widgetTitle: {
    color: colors.text,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successGlow,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.pill
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4
  },
  liveText: {
    color: colors.success,
    fontSize: typography.sizes.xs - 2,
    fontWeight: typography.weights.bold
  },
  widgetSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    marginBottom: spacing.md
  },
  startInterviewButton: {
    marginTop: spacing.xs
  }
});

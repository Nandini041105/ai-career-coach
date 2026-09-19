import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography, shadows, getScoreColor } from '../../theme/index.js';
import { Header } from '../../components/Header.js';
import { ScoreRing } from '../../components/ScoreRing.js';
import { Button } from '../../components/Button.js';
import { analysisApi } from '../../api/client.js';

export const ResumeScoreScreen = ({ route, navigation }) => {
  const resumeId = route.params?.resumeId;
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'verbs' | 'bullets' | 'strengths'

  useEffect(() => {
    loadAnalysis();
  }, [resumeId]);

  const loadAnalysis = async () => {
    try {
      let res;
      if (resumeId) {
        res = await analysisApi.getByResumeId(resumeId);
      } else {
        res = await analysisApi.getLatest();
      }
      if (res.data?.analysis) {
        setAnalysis(res.data.analysis);
      }
    } catch (e) {
      console.warn('[ResumeScore] Load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalysis();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Resume Scorecard" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
          <Text style={styles.loadingText}>Loading AI Scorecard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysis) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Resume Scorecard" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={styles.noDataTitle}>No Analysis Found</Text>
          <Text style={styles.noDataSubtitle}>
            Upload a PDF resume to generate an objective 0-100 ATS quality analysis.
          </Text>
          <Button
            title="Upload Resume Now"
            onPress={() => navigation.navigate('ResumeUpload')}
            style={styles.uploadPromptButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const categoryScores = analysis.categoryScores || {};
  const categoriesList = [
    { key: 'skills', label: 'Technical Skills', score: categoryScores.skills || 0 },
    { key: 'projects', label: 'Engineering Projects', score: categoryScores.projects || 0 },
    { key: 'experience', label: 'Relevant Experience', score: categoryScores.experience || 0 },
    { key: 'education', label: 'Academic Credentials', score: categoryScores.education || 0 },
    { key: 'keywords', label: 'Domain ATS Keywords', score: categoryScores.keywords || 0 },
    { key: 'achievements', label: 'Quantifiable Metrics', score: categoryScores.achievements || 0 },
    { key: 'structure', label: 'Formatting & Structure', score: categoryScores.structure || 0 },
    { key: 'relevance', label: 'Target Role Alignment', score: categoryScores.relevance || 0 }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Resume Quality Scorecard"
        subtitle={`Target Track: ${analysis.targetRole || 'Software Engineer'}`}
        onBack={() => navigation.goBack()}
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
        {/* Score Ring Header Card */}
        <View style={styles.scoreHeroCard}>
          <ScoreRing
            score={analysis.overallScore || 0}
            maxScore={100}
            size={130}
            strokeWidth={9}
            label="Overall ATS Score"
            sublabel="Based on 8 automated criteria"
          />

          <View style={styles.summaryStatsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statPillNumber}>{analysis.actionVerbs?.strongVerbs?.length || 0}</Text>
              <Text style={styles.statPillLabel}>Action Verbs</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillNumber}>{analysis.quantifiableAchievements?.count || 0}</Text>
              <Text style={styles.statPillLabel}>Metrics Found</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillNumber}>{analysis.strengths?.length || 0}</Text>
              <Text style={styles.statPillLabel}>Key Strengths</Text>
            </View>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
            onPress={() => setActiveTab('categories')}
          >
            <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>
              Categories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'verbs' && styles.tabActive]}
            onPress={() => setActiveTab('verbs')}
          >
            <Text style={[styles.tabText, activeTab === 'verbs' && styles.tabTextActive]}>
              Verbs & Data
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bullets' && styles.tabActive]}
            onPress={() => setActiveTab('bullets')}
          >
            <Text style={[styles.tabText, activeTab === 'bullets' && styles.tabTextActive]}>
              AI Rewrites
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'strengths' && styles.tabActive]}
            onPress={() => setActiveTab('strengths')}
          >
            <Text style={[styles.tabText, activeTab === 'strengths' && styles.tabTextActive]}>
              Feedback
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Category Scores */}
        {activeTab === 'categories' && (
          <View style={styles.tabContentCard}>
            <Text style={styles.cardHeaderTitle}>8-Dimensional Breakdown</Text>
            {categoriesList.map((cat) => {
              const catColor = getScoreColor(cat.score);
              return (
                <View key={cat.key} style={styles.categoryRow}>
                  <View style={styles.categoryLabelRow}>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                    <Text style={[styles.categoryScoreNumber, { color: catColor }]}>
                      {cat.score} / 100
                    </Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${cat.score}%`, backgroundColor: catColor }
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Tab 2: Verbs & Metrics */}
        {activeTab === 'verbs' && (
          <View style={styles.tabContentCard}>
            <Text style={styles.cardHeaderTitle}>Action Verb Analysis</Text>
            <Text style={styles.cardSubtitle}>
              Top tech recruiters look for impactful power verbs in technical bullet points.
            </Text>

            <View style={styles.badgeSection}>
              <Text style={styles.badgeSectionTitle}>Strong Action Verbs Found:</Text>
              <View style={styles.tagWrap}>
                {(analysis.actionVerbs?.strongVerbs || ['Architected', 'Synthesized', 'Engineered', 'Optimized']).map((v, i) => (
                  <View key={i} style={styles.positiveTag}>
                    <Text style={styles.positiveTagText}>✓ {v}</Text>
                  </View>
                ))}
              </View>
            </View>

            {analysis.actionVerbs?.weakVerbs?.length > 0 && (
              <View style={styles.badgeSection}>
                <Text style={styles.badgeSectionTitle}>Passive Phrases to Replace:</Text>
                <View style={styles.tagWrap}>
                  {analysis.actionVerbs.weakVerbs.map((w, i) => (
                    <View key={i} style={styles.warningTag}>
                      <Text style={styles.warningTagText}>✕ {w}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.divider} />
            <Text style={styles.cardHeaderTitle}>Quantifiable Achievements</Text>
            <Text style={styles.cardSubtitle}>
              Resumes with measurable results (% speedup, power reduction, frequency, scale) rank 40% higher.
            </Text>
            <View style={styles.metricsFoundBox}>
              <Text style={styles.metricsCountText}>
                {analysis.quantifiableAchievements?.count || 0} metrics detected in your text
              </Text>
            </View>
          </View>
        )}

        {/* Tab 3: Bullet Improvements */}
        {activeTab === 'bullets' && (
          <View style={styles.tabContentCard}>
            <Text style={styles.cardHeaderTitle}>AI Bullet Rewrites</Text>
            <Text style={styles.cardSubtitle}>
              Actionable before-and-after suggestions to boost impact.
            </Text>

            {(analysis.bulletImprovements || [
              {
                original: 'Worked on RTL code for memory controller.',
                improved: 'Designed and verified high-throughput AXI4 memory controller in SystemVerilog, improving bandwidth by 35%.',
                reason: 'Replaces passive verb with strong technical action verb and quantifiable performance metric.'
              }
            ]).map((item, index) => (
              <View key={index} style={styles.bulletItemCard}>
                <View style={styles.bulletOriginalBox}>
                  <Text style={styles.bulletBadgeOriginal}>Original</Text>
                  <Text style={styles.bulletTextOriginal}>{item.original}</Text>
                </View>
                <View style={styles.bulletImprovedBox}>
                  <Text style={styles.bulletBadgeImproved}>AI Improved</Text>
                  <Text style={styles.bulletTextImproved}>{item.improved}</Text>
                </View>
                {item.reason && (
                  <Text style={styles.bulletReasonText}>💡 {item.reason}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Tab 4: Strengths & Feedback */}
        {activeTab === 'strengths' && (
          <View style={styles.tabContentCard}>
            <Text style={styles.cardHeaderTitle}>Strengths & Weaknesses</Text>

            <Text style={styles.feedbackSectionTitle}>What You Did Well:</Text>
            {(analysis.strengths || []).map((s, i) => (
              <View key={i} style={styles.feedbackRow}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.feedbackText}>{s}</Text>
              </View>
            ))}

            <Text style={[styles.feedbackSectionTitle, { marginTop: spacing.md }]}>
              Recommended Improvements:
            </Text>
            {(analysis.weaknesses || []).map((w, i) => (
              <View key={i} style={styles.feedbackRow}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.feedbackText}>{w}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Next Step CTA */}
        <View style={styles.bottomCtaCard}>
          <Text style={styles.bottomCtaTitle}>Next: Test Against a Job Description</Text>
          <Text style={styles.bottomCtaSubtitle}>
            See how your resume scores against specific employer job requirements.
          </Text>
          <Button
            title="Match Against a Job Description →"
            onPress={() => navigation.navigate('Jobs')}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.md
  },
  noDataTitle: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs
  },
  noDataSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  uploadPromptButton: {
    minWidth: 180
  },
  scoreHeroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  statPill: {
    alignItems: 'center'
  },
  statPillNumber: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.heavy
  },
  statPillLabel: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 1,
    marginTop: 2
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 3,
    marginBottom: spacing.md
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs + 3,
    alignItems: 'center',
    borderRadius: radii.md - 2
  },
  tabActive: {
    backgroundColor: colors.primary
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold
  },
  tabContentCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  cardHeaderTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: 4
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginBottom: spacing.md,
    lineHeight: 16
  },
  categoryRow: {
    marginBottom: spacing.sm + 2
  },
  categoryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  categoryLabel: {
    color: colors.text,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium
  },
  categoryScoreNumber: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  badgeSection: {
    marginBottom: spacing.md
  },
  badgeSectionTitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  positiveTag: {
    backgroundColor: colors.successGlow,
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  positiveTagText: {
    color: colors.success,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  },
  warningTag: {
    backgroundColor: colors.dangerGlow,
    borderColor: colors.danger,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  warningTagText: {
    color: colors.danger,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md
  },
  metricsFoundBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center'
  },
  metricsCountText: {
    color: colors.info,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold
  },
  bulletItemCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  bulletOriginalBox: {
    marginBottom: spacing.xs + 2
  },
  bulletBadgeOriginal: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 2,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase'
  },
  bulletTextOriginal: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    marginTop: 2
  },
  bulletImprovedBox: {
    backgroundColor: colors.primaryGlow,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.xs
  },
  bulletBadgeImproved: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs - 2,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase'
  },
  bulletTextImproved: {
    color: colors.text,
    fontSize: typography.sizes.xs + 1,
    lineHeight: 17,
    marginTop: 2,
    fontWeight: typography.weights.medium
  },
  bulletReasonText: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 1,
    fontStyle: 'italic',
    marginTop: 4
  },
  feedbackSectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs
  },
  checkIcon: {
    color: colors.success,
    marginRight: spacing.xs,
    fontSize: typography.sizes.sm
  },
  alertIcon: {
    fontSize: typography.sizes.xs,
    marginRight: spacing.xs,
    marginTop: 2
  },
  feedbackText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    flex: 1,
    lineHeight: 16
  },
  bottomCtaCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    ...shadows.sm
  },
  bottomCtaTitle: {
    color: colors.text,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold
  },
  bottomCtaSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
    marginBottom: spacing.md
  }
});

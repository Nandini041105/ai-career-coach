import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography, shadows, getScoreColor } from '../../theme/index.js';
import { Header } from '../../components/Header.js';
import { ScoreRing } from '../../components/ScoreRing.js';
import { Button } from '../../components/Button.js';

export const InterviewResultsScreen = ({ route, navigation }) => {
  const session = route.params?.session;

  const finalScore = session?.overallInterviewScore ?? session?.finalScore ?? session?.overallScore ?? 0;
  const questions = session?.questions || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Session Performance Scorecard"
        subtitle={`${session?.targetRole || 'Engineering'} • ${session?.interviewType || 'Technical'}`}
        onBack={() => navigation.navigate('InterviewHub')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Score Ring Header */}
        <View style={styles.scoreHeroCard}>
          <ScoreRing
            score={finalScore}
            maxScore={100}
            size={130}
            strokeWidth={9}
            label={finalScore >= 70 ? 'Interview Ready' : 'Needs Practice'}
            sublabel="Based on real-time rubric criteria"
          />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{questions.length}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {questions.filter((q) => {
                  const s = q.evaluation?.overallScore ?? q.evaluation?.score ?? q.evaluation?.rating ?? 0;
                  return s >= 7;
                }).length}
              </Text>
              <Text style={styles.statLabel}>High Ratings</Text>
            </View>
          </View>
        </View>

        {/* Question by Question Review */}
        <Text style={styles.sectionTitle}>Question-by-Question Review</Text>

        {questions.map((q, idx) => {
          const rating = q.evaluation?.overallScore ?? q.evaluation?.score ?? q.evaluation?.rating ?? 0;
          return (
            <View key={idx} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionIndexText}>Q{idx + 1}</Text>
                <View
                  style={[
                    styles.ratingBadge,
                    { backgroundColor: `${getScoreColor(rating * 10)}22`, borderColor: getScoreColor(rating * 10) }
                  ]}
                >
                  <Text style={[styles.ratingText, { color: getScoreColor(rating * 10) }]}>
                    {rating} / 10
                  </Text>
                </View>
              </View>

              <Text style={styles.questionPrompt}>{q.questionText || q.question || q.prompt}</Text>

              {q.userAnswer && (
                <View style={styles.answerBox}>
                  <Text style={styles.boxLabel}>Your Response:</Text>
                  <Text style={styles.answerText}>{q.userAnswer}</Text>
                </View>
              )}

              {(q.evaluation?.whatWentWell || q.evaluation?.strengths) && (
                <View style={styles.feedbackPoint}>
                  <Text style={styles.strengthText}>
                    ✓ {Array.isArray(q.evaluation?.strengths) ? q.evaluation.strengths[0] : (q.evaluation?.whatWentWell || q.evaluation?.strengths)}
                  </Text>
                </View>
              )}

              {(q.evaluation?.howToImprove || q.evaluation?.improvements) && (
                <View style={styles.feedbackPoint}>
                  <Text style={[styles.strengthText, { color: colors.warning }]}>
                    ⚠️ {Array.isArray(q.evaluation?.improvements) ? q.evaluation.improvements[0] : (q.evaluation?.howToImprove || q.evaluation?.improvements)}
                  </Text>
                </View>
              )}

              {(q.evaluation?.betterAnswerExample || q.evaluation?.modelAnswer) && (
                <View style={styles.modelAnswerBox}>
                  <Text style={styles.modelAnswerLabel}>AI Benchmark Answer:</Text>
                  <Text style={styles.modelAnswerText}>{q.evaluation?.betterAnswerExample || q.evaluation?.modelAnswer}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Return Button */}
        <Button
          title="Return to Interview Hub"
          onPress={() => navigation.navigate('InterviewHub')}
          size="lg"
          style={styles.doneButton}
        />
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.heavy
  },
  statLabel: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    marginTop: 2
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  questionIndexText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.heavy
  },
  ratingBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1
  },
  ratingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold
  },
  questionPrompt: {
    color: colors.text,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semibold,
    lineHeight: 20,
    marginBottom: spacing.xs
  },
  answerBox: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginVertical: spacing.xs
  },
  boxLabel: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 2,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    marginBottom: 2
  },
  answerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 16
  },
  feedbackPoint: {
    marginTop: spacing.xs
  },
  strengthText: {
    color: colors.success,
    fontSize: typography.sizes.xs,
    lineHeight: 16
  },
  modelAnswerBox: {
    backgroundColor: colors.primaryGlow,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginTop: spacing.xs
  },
  modelAnswerLabel: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold,
    marginBottom: 2
  },
  modelAnswerText: {
    color: colors.text,
    fontSize: typography.sizes.xs,
    lineHeight: 16
  },
  doneButton: {
    marginTop: spacing.md
  }
});

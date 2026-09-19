import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography, shadows, getScoreColor } from '../../theme/index.js';
import { Header } from '../../components/Header.js';
import { Input } from '../../components/Input.js';
import { Button } from '../../components/Button.js';
import { interviewApi } from '../../api/client.js';

export const MockInterviewScreen = ({ route, navigation }) => {
  const initialSession = route.params?.session;
  const [session, setSession] = useState(initialSession);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  if (!session || !session.questions || session.questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Mock Interview" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No active interview session found.</Text>
          <Button title="Back to Hub" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  const questions = session.questions;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      Alert.alert('Empty Answer', 'Please provide an answer before submitting for evaluation.');
      return;
    }

    setEvaluating(true);
    try {
      const res = await interviewApi.submitAnswer(
        session._id,
        currentIndex + 1,
        userAnswer.trim()
      );

      const evaluation = res.data?.evaluation || res.data?.feedback;
      setCurrentFeedback(evaluation);

      // Update question in state with answer & feedback
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = {
        ...currentQuestion,
        userAnswer: userAnswer.trim(),
        evaluation
      };
      setSession((prev) => ({ ...prev, questions: updatedQuestions }));
    } catch (error) {
      Alert.alert('Evaluation Error', error.message || 'Could not evaluate answer.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setUserAnswer('');
    setCurrentFeedback(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleCompleteInterview = async () => {
    try {
      const res = await interviewApi.complete(session._id);
      const completedSession = res.data?.session || session;
      navigation.replace('InterviewResults', { sessionId: session._id, session: completedSession });
    } catch (error) {
      // Navigate to results even if complete endpoint errors
      navigation.replace('InterviewResults', { sessionId: session._id, session });
    }
  };

  const rubricScore = currentFeedback?.overallScore ?? currentFeedback?.score ?? currentFeedback?.rating ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Live AI Mock Interview"
        subtitle={`Question ${currentIndex + 1} of ${questions.length}`}
        onBack={() => {
          Alert.alert(
            'Exit Interview?',
            'Your current interview progress will be lost if you leave now.',
            [
              { text: 'Stay', style: 'cancel' },
              { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() }
            ]
          );
        }}
      />

      {/* Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {session?.questionSource === 'job' && (
            <View style={styles.jobSessionBadge}>
              <Text style={styles.jobSessionBadgeText}>
                🎯 Target Vacancy: {session.targetRole}
              </Text>
            </View>
          )}

          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>
                  {currentQuestion?.category || currentQuestion?.type || 'Technical Depth'}
                </Text>
              </View>
              <Text style={styles.questionStep}>
                Step {currentIndex + 1} / {questions.length}
              </Text>
            </View>

            <Text style={styles.questionText}>
              {currentQuestion?.questionText || currentQuestion?.question || currentQuestion?.prompt}
            </Text>

            {currentQuestion?.context && (
              <View style={styles.contextBox}>
                <Text style={styles.contextText}>💡 Context: {currentQuestion.context}</Text>
              </View>
            )}
          </View>

          {/* Answer Input Card */}
          {!currentFeedback ? (
            <View style={styles.answerCard}>
              <Text style={styles.answerCardTitle}>Your Technical Response</Text>
              <Text style={styles.answerCardSubtitle}>
                State your engineering approach clearly. You can use your mobile keyboard's microphone button for voice dictation.
              </Text>

              <Input
                placeholder="Type or dictate your structured response here..."
                value={userAnswer}
                onChangeText={setUserAnswer}
                multiline
                numberOfLines={8}
              />

              <Button
                title="Submit for AI Rubric Evaluation 🚀"
                onPress={handleSubmitAnswer}
                loading={evaluating}
                size="lg"
                style={styles.submitButton}
              />
            </View>
          ) : (
            /* Instant Rubric Evaluation Card */
            <View style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackTitle}>AI Rubric Evaluation</Text>
                <View
                  style={[
                    styles.scorePill,
                    { backgroundColor: `${getScoreColor(rubricScore * 10)}22`, borderColor: getScoreColor(rubricScore * 10) }
                  ]}
                >
                  <Text style={[styles.scorePillText, { color: getScoreColor(rubricScore * 10) }]}>
                    {rubricScore} / 10
                  </Text>
                </View>
              </View>

              {/* Strengths */}
              {currentFeedback.strengths && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackSectionHeading}>✓ Strengths in Your Response:</Text>
                  <Text style={styles.feedbackBodyText}>
                    {Array.isArray(currentFeedback.strengths)
                      ? currentFeedback.strengths.join('\n• ')
                      : currentFeedback.strengths}
                  </Text>
                </View>
              )}

              {/* Areas for Improvement */}
              {currentFeedback.improvements && (
                <View style={styles.feedbackSection}>
                  <Text style={[styles.feedbackSectionHeading, { color: colors.warning }]}>
                    ⚠️ Suggested Refinements:
                  </Text>
                  <Text style={styles.feedbackBodyText}>
                    {Array.isArray(currentFeedback.improvements)
                      ? currentFeedback.improvements.join('\n• ')
                      : currentFeedback.improvements}
                  </Text>
                </View>
              )}

              {/* Model Answer */}
              {(currentFeedback.modelAnswer || currentFeedback.idealAnswer) && (
                <View style={styles.modelAnswerBox}>
                  <Text style={styles.modelAnswerLabel}>🏆 AI Benchmark Answer:</Text>
                  <Text style={styles.modelAnswerText}>
                    {currentFeedback.modelAnswer || currentFeedback.idealAnswer}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              {isLastQuestion ? (
                <Button
                  title="Finish Session & View Final Scorecard →"
                  onPress={handleCompleteInterview}
                  size="lg"
                  style={styles.nextButton}
                />
              ) : (
                <Button
                  title="Next Question →"
                  onPress={handleNextQuestion}
                  size="lg"
                  style={styles.nextButton}
                />
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: colors.surfaceElevated,
    width: '100%'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primaryLight
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  tagBadge: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill
  },
  tagText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold
  },
  questionStep: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium
  },
  questionText: {
    color: colors.text,
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    lineHeight: 22
  },
  contextBox: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginTop: spacing.sm
  },
  contextText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 16
  },
  answerCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    ...shadows.md
  },
  answerCardTitle: {
    color: colors.text,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold
  },
  answerCardSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
    marginBottom: spacing.md,
    lineHeight: 16
  },
  submitButton: {
    marginTop: spacing.xs
  },
  feedbackCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    ...shadows.md
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs + 2
  },
  feedbackTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold
  },
  scorePill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1
  },
  scorePillText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.heavy
  },
  feedbackSection: {
    marginBottom: spacing.sm + 2
  },
  feedbackSectionHeading: {
    color: colors.success,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    marginBottom: 2
  },
  feedbackBodyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 17
  },
  modelAnswerBox: {
    backgroundColor: colors.surfaceElevated,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginVertical: spacing.sm
  },
  modelAnswerLabel: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginBottom: 4
  },
  modelAnswerText: {
    color: colors.text,
    fontSize: typography.sizes.xs + 1,
    lineHeight: 18
  },
  nextButton: {
    marginTop: spacing.md
  },
  jobSessionBadge: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start'
  },
  jobSessionBadgeText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  }
});

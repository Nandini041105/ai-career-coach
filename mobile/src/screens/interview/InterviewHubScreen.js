import React, { useState, useEffect, useCallback } from 'react';
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
import { colors, radii, spacing, typography, shadows, getScoreColor } from '../../theme/index.js';
import { Header } from '../../components/Header.js';
import { Button } from '../../components/Button.js';
import { RolePicker } from '../../components/RolePicker.js';
import { interviewApi } from '../../api/client.js';

export const InterviewHubScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [interviewType, setInterviewType] = useState('technical'); // 'technical' | 'behavioral' | 'mixed'
  const [questionSource, setQuestionSource] = useState('role');   // 'role' | 'resume' | 'job'
  const [questionCount, setQuestionCount] = useState(3);           // 3 | 5
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Engineer');
  const [starting, setStarting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await interviewApi.getHistory();
      if (res.data?.sessions) {
        setHistory(res.data.sessions);
      }
    } catch (e) {
      console.warn('[InterviewHub] History load error:', e);
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleStartInterview = async () => {
    setStarting(true);
    try {
      const res = await interviewApi.start({
        interviewType,
        questionSource,
        totalQuestions: questionCount,
        targetRole
      });

      const session = res.data?.session;
      if (session) {
        navigation.navigate('MockInterview', { session });
      }
    } catch (error) {
      Alert.alert('Could Not Start Session', error.message || 'Please check backend connection.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="AI Mock Interview Coach"
        subtitle="Real-time rubric grading & instant feedback"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadHistory();
            }}
            tintColor={colors.primaryLight}
          />
        }
      >
        {/* Setup Configuration Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configure Practice Session</Text>
          <Text style={styles.cardSubtitle}>
            AI generates tailored technical & scenario questions based on your discipline.
          </Text>

          {/* Role Track */}
          <Text style={styles.sectionLabel}>Target Engineering Track</Text>
          <RolePicker
            selectedRole={targetRole}
            onSelectRole={setTargetRole}
            layout="horizontal"
          />

          {/* Interview Type Selector */}
          <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>Assessment Mode</Text>
          <View style={styles.segmentedControl}>
            {[
              { id: 'technical', label: 'Technical Depth' },
              { id: 'behavioral', label: 'STAR Behavioral' },
              { id: 'mixed', label: 'Comprehensive' }
            ].map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.segment,
                  interviewType === mode.id && styles.segmentActive
                ]}
                onPress={() => setInterviewType(mode.id)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    interviewType === mode.id && styles.segmentTextActive
                  ]}
                >
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Question Source Selector */}
          <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>Question Focus</Text>
          <View style={styles.segmentedControl}>
            {[
              { id: 'job', label: '🎯 Job Description' },
              { id: 'resume', label: '📄 Resume' },
              { id: 'role', label: '⚙️ Role' },
              { id: 'mixed', label: '🔀 Mixed' }
            ].map((source) => (
              <TouchableOpacity
                key={source.id}
                style={[
                  styles.segment,
                  questionSource === source.id && styles.segmentActive
                ]}
                onPress={() => setQuestionSource(source.id)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    questionSource === source.id && styles.segmentTextActive
                  ]}
                >
                  {source.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Question Count Selector */}
          <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>Session Length</Text>
          <View style={styles.segmentedControl}>
            {[
              { count: 3, label: '3 Questions (~5 mins)' },
              { count: 5, label: '5 Questions (~10 mins)' }
            ].map((item) => (
              <TouchableOpacity
                key={item.count}
                style={[
                  styles.segment,
                  questionCount === item.count && styles.segmentActive
                ]}
                onPress={() => setQuestionCount(item.count)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    questionCount === item.count && styles.segmentTextActive
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Launch AI Interview Practice 🎙️"
            onPress={handleStartInterview}
            loading={starting}
            size="lg"
            style={styles.startButton}
          />
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Past Interview Sessions ({history.length})</Text>

          {loadingHistory && <ActivityIndicator size="small" color={colors.primaryLight} />}

          {history.length === 0 && !loadingHistory ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No completed interview sessions yet.</Text>
              <Text style={styles.emptySubtext}>
                Complete a session above to view your score progression and feedback.
              </Text>
            </View>
          ) : (
            history.map((session) => {
              const score = session.finalScore || session.overallScore || 0;
              return (
                <TouchableOpacity
                  key={session._id}
                  style={styles.historyCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('InterviewResults', { sessionId: session._id, session })}
                >
                  <View style={styles.historyHeader}>
                    <View>
                      <Text style={styles.historyRole}>{session.targetRole || 'Software Engineer'}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(session.createdAt).toLocaleDateString()} • {session.interviewType || 'Technical'}
                      </Text>
                    </View>
                    {score > 0 && (
                      <View style={[styles.historyScoreBadge, { backgroundColor: `${getScoreColor(score)}22`, borderColor: getScoreColor(score) }]}>
                        <Text style={[styles.historyScoreText, { color: getScoreColor(score) }]}>
                          {score}/100
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.historySummaryText} numberOfLines={2}>
                    {session.feedbackSummary || `${session.questions?.length || 0} questions evaluated with model rubric answers.`}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
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
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.md
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
    marginBottom: spacing.md,
    lineHeight: 16
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: 3,
    marginBottom: spacing.xs
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.xs + 3,
    alignItems: 'center',
    borderRadius: radii.sm
  },
  segmentActive: {
    backgroundColor: colors.primary
  },
  segmentText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold
  },
  startButton: {
    marginTop: spacing.md
  },
  historySection: {
    marginTop: spacing.xs
  },
  historyTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center'
  },
  emptyText: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold
  },
  emptySubtext: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: 4
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs
  },
  historyRole: {
    color: colors.text,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold
  },
  historyDate: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 1,
    marginTop: 2
  },
  historyScoreBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1
  },
  historyScoreText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold
  },
  historySummaryText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 16
  }
});

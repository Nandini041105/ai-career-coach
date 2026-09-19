import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext.js';
import { colors, radii, spacing, typography, shadows, getScoreColor } from '../../theme/index.js';
import { Header } from '../../components/Header.js';
import { Button } from '../../components/Button.js';
import { jobApi, interviewApi } from '../../api/client.js';

const LOCATIONS = [
  { id: 'All', label: 'All Hubs' },
  { id: 'Bengaluru', label: 'Bengaluru' },
  { id: 'Hyderabad', label: 'Hyderabad' },
  { id: 'Pune', label: 'Pune' },
  { id: 'Chennai', label: 'Chennai' },
  { id: 'Delhi-NCR', label: 'Delhi-NCR' },
  { id: 'Mumbai', label: 'Mumbai' },
  { id: 'Remote', label: '🌐 Remote' }
];

const ROLE_TRACKS = [
  { id: 'All', label: 'All Disciplines' },
  { id: 'RTL Design Engineer', label: 'RTL Design' },
  { id: 'FPGA Design Engineer', label: 'FPGA Design' },
  { id: 'VLSI Engineer', label: 'VLSI / ASIC' },
  { id: 'Physical Design Engineer', label: 'Physical Design' },
  { id: 'Embedded Systems Engineer', label: 'Embedded Systems' },
  { id: 'Software Engineer', label: 'Software Eng' },
  { id: 'Data/AI Engineer', label: 'Data / AI' }
];

export const JobRecommendationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedRole, setSelectedRole] = useState(user?.targetRole || 'RTL Design Engineer');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [resumeMeta, setResumeMeta] = useState({ resumeFound: false, resumeFileName: null, skillsCount: 0 });
  const [startingInterviewId, setStartingInterviewId] = useState(null);

  const fetchJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await jobApi.getRecommendations({
        location: selectedLocation === 'All' ? '' : selectedLocation,
        role: selectedRole === 'All' ? '' : selectedRole,
        search: searchQuery.trim()
      });

      if (res.data?.success) {
        setJobs(res.data.jobs || []);
        setResumeMeta({
          resumeFound: res.data.resumeFound || false,
          resumeFileName: res.data.resumeFileName || null,
          skillsCount: res.data.candidateSkillsCount || 0
        });
      }
    } catch (err) {
      console.warn('[JobRecommendations] Fetch error:', err.message);
      Alert.alert('Unable to load vacancies', err.message || 'Please check your connection to the backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedLocation, selectedRole, searchQuery]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleOpenApply = async (job) => {
    const targetUrl = job.applyUrl || job.naukriUrl || job.linkedInUrl;
    if (!targetUrl) {
      Alert.alert('Link Not Available', 'No application URL specified for this job vacancy.');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(targetUrl);
      if (canOpen) {
        await Linking.openURL(targetUrl);
      } else {
        await Linking.openURL(targetUrl);
      }
    } catch (error) {
      Alert.alert('Error Opening Link', `Could not navigate to: ${targetUrl}`);
    }
  };

  const handleStartJobInterview = async (job) => {
    setStartingInterviewId(job.id);
    try {
      // 1. Request tailored interview session based on this exact job posting
      const res = await interviewApi.start({
        interviewType: 'technical',
        questionSource: 'job',
        totalQuestions: 5,
        targetRole: job.jobTitle || selectedRole,
        jobTitle: job.jobTitle,
        company: job.company,
        requiredSkills: job.requiredSkills || [],
        jobDescriptionText: job.description || `Role: ${job.jobTitle} at ${job.company}`
      });

      const session = res.data?.session;
      if (session) {
        // Navigate across to Interview stack with the newly created job-tailored session
        navigation.navigate('Interview', {
          screen: 'MockInterview',
          params: { session }
        });
      } else {
        Alert.alert('Interview Setup Failed', 'Could not create interview session.');
      }
    } catch (error) {
      Alert.alert(
        'Could Not Prepare Interview',
        error.message || 'Ensure backend server is running and reachable.'
      );
    } finally {
      setStartingInterviewId(null);
    }
  };

  const renderWorkModeBadge = (mode) => {
    let badgeColor = colors.info;
    let badgeBg = colors.infoGlow;

    if (mode === 'Remote') {
      badgeColor = colors.success;
      badgeBg = colors.successGlow;
    } else if (mode === 'On-site') {
      badgeColor = colors.warning;
      badgeBg = colors.warningGlow;
    }

    return (
      <View style={[styles.workModeBadge, { backgroundColor: badgeBg, borderColor: badgeColor }]}>
        <Text style={[styles.workModeText, { color: badgeColor }]}>{mode || 'Hybrid'}</Text>
      </View>
    );
  };

  const renderAtsBadge = (score) => {
    let badgeColor = colors.scorePoor;
    let badgeBg = colors.dangerGlow;
    let icon = '🔴';
    let label = 'Skill Gaps';

    if (score >= 85) {
      badgeColor = colors.scoreExcellent;
      badgeBg = colors.successGlow;
      icon = '🟢';
      label = 'Strong Match';
    } else if (score >= 70) {
      badgeColor = colors.scoreGood;
      badgeBg = colors.infoGlow;
      icon = '🔵';
      label = 'Good Match';
    } else if (score >= 50) {
      badgeColor = colors.scoreFair;
      badgeBg = colors.warningGlow;
      icon = '🟡';
      label = 'Moderate Fit';
    }

    return (
      <View style={[styles.atsBadge, { backgroundColor: badgeBg, borderColor: badgeColor }]}>
        <Text style={styles.atsScoreText}>
          {icon} <Text style={[styles.atsScoreNumber, { color: badgeColor }]}>{score}%</Text> ATS Fit
        </Text>
        <Text style={[styles.atsScoreLabel, { color: badgeColor }]}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Live Job Vacancies"
        subtitle="1-Click Apply & AI Mock Interview Prep"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchJobs(true)}
            tintColor={colors.primaryLight}
          />
        }
      >
        {/* Resume Alignment Status Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerIcon}>
            <Text style={{ fontSize: 20 }}>📄</Text>
          </View>
          <View style={{ flex: 1 }}>
            {resumeMeta.resumeFound ? (
              <>
                <Text style={styles.bannerTitle}>
                  Matched against: <Text style={{ color: colors.primaryLight }}>{resumeMeta.resumeFileName || 'Uploaded Resume'}</Text>
                </Text>
                <Text style={styles.bannerSubtitle}>
                  Cross-referencing {resumeMeta.skillsCount} detected skills with live employer requirements.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.bannerTitle}>No Active Resume Uploaded</Text>
                <Text style={styles.bannerSubtitle}>
                  Showing standard market ATS scores. Upload your resume in the Resume tab for 1-to-1 gap discovery!
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Location Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Preferred Indian Tech Hub</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {LOCATIONS.map((loc) => {
              const isSelected = selectedLocation === loc.id;
              return (
                <TouchableOpacity
                  key={loc.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedLocation(loc.id)}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected
                    ]}
                  >
                    {loc.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Discipline / Role Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Discipline Track</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {ROLE_TRACKS.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedRole(r.id)}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipRoleSelected : styles.chipUnselected
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search Input Filter */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search by company or tech skill (e.g. Qualcomm, UVM)..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => fetchJobs(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Vacancy Feed Count */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedCountText}>
            {loading ? 'Discovering openings...' : `Found ${jobs.length} Matching Vacancies`}
          </Text>
          <TouchableOpacity onPress={() => fetchJobs(true)}>
            <Text style={styles.refreshLink}>⚡ Refresh Feed</Text>
          </TouchableOpacity>
        </View>

        {/* Job Listings List */}
        {loading && !refreshing ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primaryLight} />
            <Text style={styles.loadingText}>Analyzing vacancies & calculating ATS match scores...</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyTitle}>No Matching Vacancies Found</Text>
            <Text style={styles.emptySubtitle}>
              Try selecting "All Hubs" or clearing your search filters to explore more opportunities.
            </Text>
            <Button
              title="Reset Filters"
              onPress={() => {
                setSelectedLocation('All');
                setSelectedRole('All');
                setSearchQuery('');
              }}
              variant="secondary"
              size="sm"
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          jobs.map((job) => {
            const isInterviewLoading = startingInterviewId === job.id;
            const matched = job.matchedSkills || [];
            const missing = job.missingSkills || [];

            return (
              <View key={job.id} style={styles.jobCard}>
                {/* Top Row: Company & Location & WorkMode */}
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.companyRow}>
                      <Text style={styles.companyName}>{job.company}</Text>
                      <Text style={styles.verifiedBadge}>✓</Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Text style={styles.locationIcon}>📍</Text>
                      <Text style={styles.locationText}>{job.location}{job.state ? `, ${job.state}` : ''}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    {renderWorkModeBadge(job.workMode)}
                    <Text style={styles.postedTimeText}>{job.postedAt || 'Recent'}</Text>
                  </View>
                </View>

                {/* Job Title */}
                <Text style={styles.jobTitleText}>{job.jobTitle}</Text>

                {/* Salary & Experience Pills */}
                <View style={styles.metaPillsRow}>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaPillText}>💰 {job.salaryRange || 'Competitive'}</Text>
                  </View>
                  {job.experienceRequired && (
                    <View style={styles.metaPill}>
                      <Text style={styles.metaPillText}>⏳ {job.experienceRequired}</Text>
                    </View>
                  )}
                  <View style={styles.metaPill}>
                    <Text style={styles.metaPillText}>💼 {job.employmentType || 'Full-time'}</Text>
                  </View>
                </View>

                {/* ATS Match Scorecard Badge */}
                <View style={styles.scoreRow}>
                  {renderAtsBadge(job.atsMatchScore || 70)}
                  <View style={styles.matchProgressBarBg}>
                    <View
                      style={[
                        styles.matchProgressBarFill,
                        {
                          width: `${Math.min(100, job.atsMatchScore || 70)}%`,
                          backgroundColor: getScoreColor(job.atsMatchScore || 70)
                        }
                      ]}
                    />
                  </View>
                </View>

                {/* Matched Skills Section (Emerald Green) */}
                <View style={styles.skillsSection}>
                  <Text style={styles.skillsHeadingGreen}>
                    ✓ Matched Skills ({matched.length})
                  </Text>
                  <View style={styles.skillTagsWrap}>
                    {matched.length > 0 ? (
                      matched.map((skill, idx) => (
                        <View key={idx} style={styles.matchedSkillChip}>
                          <Text style={styles.matchedSkillText}>✓ {skill}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noSkillsText}>No direct resume keyword matches.</Text>
                    )}
                  </View>
                </View>

                {/* Missing Skills Section (Rose/Red) */}
                {missing.length > 0 && (
                  <View style={styles.skillsSection}>
                    <Text style={styles.skillsHeadingRed}>
                      ⚠️ Missing Skills ({missing.length})
                    </Text>
                    <View style={styles.skillTagsWrap}>
                      {missing.map((skill, idx) => (
                        <View key={idx} style={styles.missingSkillChip}>
                          <Text style={styles.missingSkillText}>! {skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Job Summary Description */}
                {job.description && (
                  <Text style={styles.descriptionSnippet} numberOfLines={3}>
                    {job.description}
                  </Text>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  {/* Button 1: External Apply */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenApply(job)}
                    style={styles.applyButton}
                  >
                    <Text style={styles.applyButtonText}>🚀 Apply on Naukri / LinkedIn</Text>
                  </TouchableOpacity>

                  {/* Button 2: Mock Interview Prep */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleStartJobInterview(job)}
                    disabled={isInterviewLoading}
                    style={[styles.interviewButton, isInterviewLoading && { opacity: 0.7 }]}
                  >
                    {isInterviewLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.interviewButtonText}>🎙️ Practice Mock Interview</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm
  },
  bannerTitle: {
    color: colors.text,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold
  },
  bannerSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs - 1,
    marginTop: 2
  },
  filterSection: {
    marginBottom: spacing.sm
  },
  filterSectionTitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    marginRight: spacing.xs + 2,
    borderWidth: 1
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight
  },
  chipRoleSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  chipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium
  },
  chipTextUnselected: {
    color: colors.textSecondary
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.sm,
    height: 42
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.xs
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.xs + 1,
    paddingVertical: 0
  },
  clearSearchText: {
    color: colors.textTertiary,
    fontSize: 14,
    paddingHorizontal: 4
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm
  },
  feedCountText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  },
  refreshLink: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  },
  centerLoading: {
    paddingVertical: spacing.xl * 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.md,
    textAlign: 'center'
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md
  },
  emptyEmoji: {
    fontSize: 38,
    marginBottom: spacing.sm
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: 4
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 18
  },
  jobCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  companyName: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold
  },
  verifiedBadge: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  locationIcon: {
    fontSize: 10,
    marginRight: 2
  },
  locationText: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 1
  },
  workModeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1
  },
  workModeText: {
    fontSize: typography.sizes.xs - 2,
    fontWeight: typography.weights.bold
  },
  postedTimeText: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 2
  },
  jobTitleText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
    marginVertical: spacing.xs
  },
  metaPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  metaPill: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.md
  },
  metaPillText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.medium
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.sm
  },
  atsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    gap: 6
  },
  atsScoreText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text
  },
  atsScoreNumber: {
    fontWeight: typography.weights.heavy
  },
  atsScoreLabel: {
    fontSize: typography.sizes.xs - 2,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase'
  },
  matchProgressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    marginLeft: spacing.md,
    overflow: 'hidden'
  },
  matchProgressBarFill: {
    height: '100%',
    borderRadius: 3
  },
  skillsSection: {
    marginTop: spacing.xs + 2
  },
  skillsHeadingGreen: {
    color: colors.success,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginBottom: 4
  },
  skillsHeadingRed: {
    color: colors.danger,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginBottom: 4
  },
  skillTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs - 2
  },
  matchedSkillChip: {
    backgroundColor: colors.successGlow,
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  matchedSkillText: {
    color: colors.success,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.semibold
  },
  missingSkillChip: {
    backgroundColor: colors.dangerGlow,
    borderColor: colors.danger,
    borderWidth: 1,
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  missingSkillText: {
    color: colors.danger,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.semibold
  },
  noSkillsText: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 1,
    fontStyle: 'italic'
  },
  descriptionSnippet: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceHighlight,
    padding: spacing.sm,
    borderRadius: radii.md
  },
  actionsRow: {
    flexDirection: 'column',
    gap: spacing.xs + 2,
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold
  },
  interviewButton: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.accent,
    borderWidth: 1.5,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  interviewButtonText: {
    color: colors.text,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold
  }
});

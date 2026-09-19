import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext.js';
import { colors, radii, spacing, typography, shadows, getScoreColor } from '../../theme/index.js';
import { Header } from '../../components/Header.js';
import { Input } from '../../components/Input.js';
import { Button } from '../../components/Button.js';
import { ScoreRing } from '../../components/ScoreRing.js';
import { RolePicker } from '../../components/RolePicker.js';
import { jobApi, matchApi, interviewApi } from '../../api/client.js';

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

const SAMPLE_JD = {
  title: 'Hardware RTL Design Engineer',
  company: 'Quantum Silicon Technologies',
  description: `Requirements:
- 3+ years experience in digital design using Verilog / SystemVerilog.
- Strong knowledge of clock domain crossing (CDC), FIFO architectures, and FSM design.
- Hands-on experience with simulation tools (VCS / ModelSim / QuestaSim) and linting (SpyGlass).
- Familiarity with AXI / AHB bus protocols, PCIe, or DDR memory controllers.
- Synthesis and Static Timing Analysis (STA) with Synopsys Design Compiler is a strong plus.`
};

export const JobMatcherScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const initialTab = route.params?.tab || 'vacancies'; // 'vacancies' | 'custom'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Live Vacancies State
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [recommendedRole, setRecommendedRole] = useState(user?.targetRole || 'RTL Design Engineer');
  const [searchQuery, setSearchQuery] = useState('');
  const [vacancies, setVacancies] = useState([]);
  const [loadingVacancies, setLoadingVacancies] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resumeMeta, setResumeMeta] = useState({ resumeFound: false, resumeFileName: null, skillsCount: 0 });
  const [startingInterviewId, setStartingInterviewId] = useState(null);

  // Custom JD Matcher State
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'RTL Design Engineer');
  const [calculating, setCalculating] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const fetchVacancies = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingVacancies(true);
    }

    try {
      const res = await jobApi.getRecommendations({
        location: selectedLocation === 'All' ? '' : selectedLocation,
        role: recommendedRole === 'All' ? '' : recommendedRole,
        search: searchQuery.trim()
      });

      if (res.data?.success) {
        setVacancies(res.data.jobs || []);
        setResumeMeta({
          resumeFound: res.data.resumeFound || false,
          resumeFileName: res.data.resumeFileName || null,
          skillsCount: res.data.candidateSkillsCount || 0
        });
      }
    } catch (err) {
      console.warn('[JobMatcher] Vacancy load error:', err.message);
    } finally {
      setLoadingVacancies(false);
      setRefreshing(false);
    }
  }, [selectedLocation, recommendedRole, searchQuery]);

  useEffect(() => {
    if (activeTab === 'vacancies') {
      fetchVacancies();
    }
  }, [activeTab, fetchVacancies]);

  // Handle external application link
  const handleOpenApply = async (job) => {
    const targetUrl = job.applyUrl || job.naukriUrl || job.linkedInUrl;
    if (!targetUrl) {
      Alert.alert('No Apply Link', 'No application link provided for this vacancy.');
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
      Alert.alert('Link Navigation Error', `Unable to open: ${targetUrl}`);
    }
  };

  // Handle direct mock interview preparation
  const handleStartJobInterview = async (job) => {
    setStartingInterviewId(job.id);
    try {
      const res = await interviewApi.start({
        interviewType: 'technical',
        questionSource: 'job',
        totalQuestions: 5,
        targetRole: job.jobTitle || recommendedRole,
        jobTitle: job.jobTitle,
        company: job.company,
        requiredSkills: job.requiredSkills || [],
        jobDescriptionText: job.description || `Position: ${job.jobTitle} at ${job.company}`
      });

      const session = res.data?.session;
      if (session) {
        navigation.navigate('Interview', {
          screen: 'MockInterview',
          params: { session }
        });
      } else {
        Alert.alert('Could Not Start', 'No interview session returned from backend.');
      }
    } catch (error) {
      Alert.alert(
        'Interview Preparation Error',
        error.message || 'Unable to connect to AI Mock Interview service.'
      );
    } finally {
      setStartingInterviewId(null);
    }
  };

  const handleFillSample = () => {
    setJobTitle(SAMPLE_JD.title);
    setCompany(SAMPLE_JD.company);
    setJobDescription(SAMPLE_JD.description);
    setTargetRole('RTL Design Engineer');
  };

  const handleMatchJob = async () => {
    if (!jobDescription.trim()) {
      Alert.alert('Missing Job Description', 'Please enter or paste the target job description.');
      return;
    }

    setCalculating(true);
    try {
      const jobRes = await jobApi.create({
        title: jobTitle || 'Target Technical Position',
        company: company || 'Employer',
        rawText: jobDescription,
        targetRole
      });

      const jobId = jobRes.data?.job?._id || jobRes.data?._id;

      const matchRes = await matchApi.calculate({
        jobDescriptionId: jobId,
        targetRole
      });

      setMatchResult(matchRes.data?.match || matchRes.data);
    } catch (error) {
      Alert.alert('Matching Error', error.message || 'Could not analyze job match. Ensure a resume is uploaded first.');
    } finally {
      setCalculating(false);
    }
  };

  const overallScore = matchResult?.overallScore || matchResult?.score || 0;
  const customMatchedSkills = matchResult?.matchedSkills || matchResult?.matchedKeywords || [];
  const customMissingSkills = matchResult?.missingSkills || matchResult?.skillGaps || [];

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
        title="Jobs & Skill Alignment"
        subtitle="Live Vacancies & ATS Match Scoring"
      />

      {/* Segment Tab Controller */}
      <View style={styles.segmentWrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('vacancies')}
          style={[styles.segmentBtn, activeTab === 'vacancies' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'vacancies' && styles.segmentTextActive]}>
            ✨ Live Vacancies
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('custom')}
          style={[styles.segmentBtn, activeTab === 'custom' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'custom' && styles.segmentTextActive]}>
            📝 Custom JD Matcher
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          activeTab === 'vacancies' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchVacancies(true)}
              tintColor={colors.primaryLight}
            />
          ) : undefined
        }
      >
        {/* ===================== TAB 1: LIVE VACANCIES ===================== */}
        {activeTab === 'vacancies' ? (
          <>
            {/* Resume Info Banner */}
            <View style={styles.bannerContainer}>
              <View style={styles.bannerIcon}>
                <Text style={{ fontSize: 18 }}>📄</Text>
              </View>
              <View style={{ flex: 1 }}>
                {resumeMeta.resumeFound ? (
                  <>
                    <Text style={styles.bannerTitle}>
                      Matching: <Text style={{ color: colors.primaryLight }}>{resumeMeta.resumeFileName || 'Active Resume'}</Text>
                    </Text>
                    <Text style={styles.bannerSubtitle}>
                      Cross-referenced against {resumeMeta.skillsCount} detected candidate skills.
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.bannerTitle}>No Resume Uploaded Yet</Text>
                    <Text style={styles.bannerSubtitle}>
                      Upload a PDF in Resume tab for 1-to-1 ATS gap discovery.
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Location Selector Chips */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Preferred Location Hub</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {LOCATIONS.map((loc) => {
                  const isSelected = selectedLocation === loc.id;
                  return (
                    <TouchableOpacity
                      key={loc.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedLocation(loc.id)}
                      style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
                    >
                      <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : styles.chipTextUnselected]}>
                        {loc.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Role Track Selector */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Target Discipline</Text>
              <RolePicker
                selectedRole={recommendedRole}
                onSelectRole={setRecommendedRole}
                layout="horizontal"
              />
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                placeholder="Search by company or skill (e.g. Qualcomm, UVM)..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                returnKeyType="search"
                onSubmitEditing={() => fetchVacancies(false)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Status Bar */}
            <View style={styles.statusBarRow}>
              <Text style={styles.statusCountText}>
                {loadingVacancies ? 'Searching live feeds...' : `${vacancies.length} Matching Vacancies`}
              </Text>
              <TouchableOpacity onPress={() => fetchVacancies(true)}>
                <Text style={styles.statusRefreshText}>⚡ Refresh</Text>
              </TouchableOpacity>
            </View>

            {/* Listings */}
            {loadingVacancies && !refreshing ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator size="large" color={colors.primaryLight} />
                <Text style={styles.loadingText}>Fetching vacancies & computing ATS scores...</Text>
              </View>
            ) : vacancies.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🔎</Text>
                <Text style={styles.emptyTitle}>No matching vacancies found</Text>
                <Text style={styles.emptySubtitle}>
                  Try selecting "All Hubs" or clearing search query to see all open positions.
                </Text>
                <Button
                  title="Show All Hubs"
                  onPress={() => {
                    setSelectedLocation('All');
                    setSearchQuery('');
                  }}
                  variant="secondary"
                  size="sm"
                  style={{ marginTop: spacing.md }}
                />
              </View>
            ) : (
              vacancies.map((job) => {
                const isInterviewLoading = startingInterviewId === job.id;
                const matched = job.matchedSkills || [];
                const missing = job.missingSkills || [];

                return (
                  <View key={job.id} style={styles.jobCard}>
                    {/* Header: Company, Location & Work Mode */}
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.companyRow}>
                          <Text style={styles.companyName}>{job.company}</Text>
                          <Text style={styles.verifiedCheck}>✓</Text>
                        </View>
                        <View style={styles.locationRow}>
                          <Text style={styles.locationIcon}>📍</Text>
                          <Text style={styles.locationText}>{job.location}{job.state ? `, ${job.state}` : ''}</Text>
                        </View>
                      </View>

                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <View style={[
                          styles.workModeBadge,
                          job.workMode === 'Remote' ? styles.workModeRemote :
                          job.workMode === 'On-site' ? styles.workModeOnsite : styles.workModeHybrid
                        ]}>
                          <Text style={[
                            styles.workModeText,
                            job.workMode === 'Remote' ? { color: colors.success } :
                            job.workMode === 'On-site' ? { color: colors.warning } : { color: colors.info }
                          ]}>
                            {job.workMode || 'Hybrid'}
                          </Text>
                        </View>
                        <Text style={styles.postedTime}>{job.postedAt || 'Recent'}</Text>
                      </View>
                    </View>

                    {/* Job Title */}
                    <Text style={styles.jobTitle}>{job.jobTitle}</Text>

                    {/* Meta Tags */}
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

                    {/* ATS Match Score Badge */}
                    <View style={styles.atsScoreRow}>
                      {renderAtsBadge(job.atsMatchScore || 70)}
                      <View style={styles.matchBarBg}>
                        <View
                          style={[
                            styles.matchBarFill,
                            {
                              width: `${Math.min(100, job.atsMatchScore || 70)}%`,
                              backgroundColor: getScoreColor(job.atsMatchScore || 70)
                            }
                          ]}
                        />
                      </View>
                    </View>

                    {/* Matched Skills */}
                    <View style={styles.skillsBlock}>
                      <Text style={styles.matchedHeading}>✓ Matched Skills ({matched.length})</Text>
                      <View style={styles.skillsTagWrap}>
                        {matched.length > 0 ? (
                          matched.map((sk, idx) => (
                            <View key={idx} style={styles.matchedTag}>
                              <Text style={styles.matchedTagText}>✓ {sk}</Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.emptySkillNote}>No direct skill overlap identified.</Text>
                        )}
                      </View>
                    </View>

                    {/* Missing Skills */}
                    {missing.length > 0 && (
                      <View style={styles.skillsBlock}>
                        <Text style={styles.missingHeading}>⚠️ Missing Skills ({missing.length})</Text>
                        <View style={styles.skillsTagWrap}>
                          {missing.map((sk, idx) => (
                            <View key={idx} style={styles.missingTag}>
                              <Text style={styles.missingTagText}>! {sk}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Job Snippet */}
                    {job.description && (
                      <Text style={styles.jobSnippet} numberOfLines={3}>
                        {job.description}
                      </Text>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                      {/* Apply on Naukri / LinkedIn */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleOpenApply(job)}
                        style={styles.applyBtn}
                      >
                        <Text style={styles.applyBtnText}>🚀 Apply on Naukri / LinkedIn</Text>
                      </TouchableOpacity>

                      {/* Practice Mock Interview */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleStartJobInterview(job)}
                        disabled={isInterviewLoading}
                        style={[styles.practiceBtn, isInterviewLoading && { opacity: 0.7 }]}
                      >
                        {isInterviewLoading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.practiceBtnText}>🎙️ Practice Mock Interview</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          /* ===================== TAB 2: CUSTOM JD MATCHER ===================== */
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Paste Target Job Description</Text>
                <TouchableOpacity onPress={handleFillSample} style={styles.sampleButton}>
                  <Text style={styles.sampleButtonText}>⚡ Auto-fill Sample JD</Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Job Title"
                placeholder="e.g. RTL Design Engineer"
                value={jobTitle}
                onChangeText={setJobTitle}
              />

              <Input
                label="Company"
                placeholder="e.g. Apple / NVIDIA / Qualcomm"
                value={company}
                onChangeText={setCompany}
              />

              <View style={styles.rolePickerContainer}>
                <Text style={styles.fieldLabel}>Discipline Track</Text>
                <RolePicker
                  selectedRole={targetRole}
                  onSelectRole={setTargetRole}
                  layout="horizontal"
                />
              </View>

              <Input
                label="Job Description / Requirements Text"
                placeholder="Paste technical requirements, responsibilities, and qualifications here..."
                value={jobDescription}
                onChangeText={setJobDescription}
                multiline
                numberOfLines={6}
              />

              <Button
                title="Calculate Job Match Score"
                onPress={handleMatchJob}
                loading={calculating}
                size="lg"
                style={styles.matchButton}
              />
            </View>

            {/* Match Result Display */}
            {matchResult && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Matching Scorecard</Text>
                  <Text style={styles.resultSubtitle}>
                    Comparison against your active resume
                  </Text>
                </View>

                <ScoreRing
                  score={overallScore}
                  maxScore={100}
                  size={120}
                  strokeWidth={8}
                  label={overallScore >= 75 ? 'Strong Candidate Fit' : 'Moderate Alignment'}
                  sublabel={`${overallScore}% weighted match`}
                />

                {/* Matched Skills */}
                <View style={styles.skillsSection}>
                  <Text style={styles.skillsSectionTitle}>
                    Matched Technical Skills ({customMatchedSkills.length})
                  </Text>
                  <View style={styles.tagsContainer}>
                    {customMatchedSkills.length > 0 ? (
                      customMatchedSkills.map((skill, idx) => (
                        <View key={idx} style={styles.matchedTag}>
                          <Text style={styles.matchedTagText}>✓ {typeof skill === 'string' ? skill : skill.name}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptySkillsText}>No direct keyword matches found.</Text>
                    )}
                  </View>
                </View>

                {/* Missing Skills (Skill Gaps) */}
                <View style={styles.skillsSection}>
                  <Text style={[styles.skillsSectionTitle, { color: colors.warning }]}>
                    Prioritized Skill Gaps ({customMissingSkills.length})
                  </Text>
                  <View style={styles.tagsContainer}>
                    {customMissingSkills.length > 0 ? (
                      customMissingSkills.map((skill, idx) => (
                        <View key={idx} style={styles.missingTag}>
                          <Text style={styles.missingTagText}>
                            ! {typeof skill === 'string' ? skill : skill.name || skill.skill}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptySkillsText}>No critical skill gaps identified!</Text>
                    )}
                  </View>
                </View>

                {/* Roadmap CTA */}
                <Button
                  title="Generate 4-Week Learning Roadmap →"
                  onPress={() => navigation.navigate('Roadmap', { matchId: matchResult._id, targetRole })}
                  variant="secondary"
                  size="md"
                  style={styles.roadmapCtaButton}
                />
              </View>
            )}
          </>
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
  segmentWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill
  },
  segmentBtnActive: {
    backgroundColor: colors.primary
  },
  segmentText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
  filterTitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold,
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
  statusBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm
  },
  statusCountText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  },
  statusRefreshText: {
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
  cardHeaderRow: {
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
  verifiedCheck: {
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
  workModeRemote: {
    backgroundColor: colors.successGlow,
    borderColor: colors.success
  },
  workModeHybrid: {
    backgroundColor: colors.infoGlow,
    borderColor: colors.info
  },
  workModeOnsite: {
    backgroundColor: colors.warningGlow,
    borderColor: colors.warning
  },
  workModeText: {
    fontSize: typography.sizes.xs - 2,
    fontWeight: typography.weights.bold
  },
  postedTime: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 2
  },
  jobTitle: {
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
  atsScoreRow: {
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
  matchBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    marginLeft: spacing.md,
    overflow: 'hidden'
  },
  matchBarFill: {
    height: '100%',
    borderRadius: 3
  },
  skillsBlock: {
    marginTop: spacing.xs + 2
  },
  matchedHeading: {
    color: colors.success,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginBottom: 4
  },
  missingHeading: {
    color: colors.danger,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginBottom: 4
  },
  skillsTagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs - 2
  },
  matchedTag: {
    backgroundColor: colors.successGlow,
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  matchedTagText: {
    color: colors.success,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.semibold
  },
  missingTag: {
    backgroundColor: colors.dangerGlow,
    borderColor: colors.danger,
    borderWidth: 1,
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  missingTagText: {
    color: colors.danger,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.semibold
  },
  emptySkillNote: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 1,
    fontStyle: 'italic'
  },
  jobSnippet: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceHighlight,
    padding: spacing.sm,
    borderRadius: radii.md
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: spacing.xs + 2,
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold
  },
  practiceBtn: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.accent,
    borderWidth: 1.5,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  practiceBtnText: {
    color: colors.text,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold
  },

  // Custom JD Form Styles
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold
  },
  sampleButton: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  sampleButtonText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.semibold
  },
  rolePickerContainer: {
    marginBottom: spacing.md
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs
  },
  matchButton: {
    marginTop: spacing.sm
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.md
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  resultTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold
  },
  resultSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2
  },
  skillsSection: {
    width: '100%',
    marginTop: spacing.md
  },
  skillsSectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  emptySkillsText: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontStyle: 'italic'
  },
  roadmapCtaButton: {
    width: '100%',
    marginTop: spacing.lg
  }
});

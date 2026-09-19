import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext.js';
import { colors, radii, spacing, typography, shadows, getScoreColor } from '../../theme/index.js';
import { Header } from '../../components/Header.js';
import { Input } from '../../components/Input.js';
import { Button } from '../../components/Button.js';
import { ScoreRing } from '../../components/ScoreRing.js';
import { RolePicker } from '../../components/RolePicker.js';
import { jobApi, matchApi } from '../../api/client.js';

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

export const JobMatcherScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'RTL Design Engineer');
  const [calculating, setCalculating] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

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
      // 1. Create or save Job Description
      const jobRes = await jobApi.create({
        title: jobTitle || 'Target Technical Position',
        company: company || 'Employer',
        rawText: jobDescription,
        targetRole
      });

      const jobId = jobRes.data?.job?._id || jobRes.data?._id;

      // 2. Compute Match against user's latest resume
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
  const matchedSkills = matchResult?.matchedSkills || matchResult?.matchedKeywords || [];
  const missingSkills = matchResult?.missingSkills || matchResult?.skillGaps || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Job Matcher & Skill Gaps"
        subtitle="ATS Weighted Alignment & Gap Discovery"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Target Job Details</Text>
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
                Matched Technical Skills ({matchedSkills.length})
              </Text>
              <View style={styles.tagsContainer}>
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((skill, idx) => (
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
                Prioritized Skill Gaps ({missingSkills.length})
              </Text>
              <View style={styles.tagsContainer}>
                {missingSkills.length > 0 ? (
                  missingSkills.map((skill, idx) => (
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
  matchedTag: {
    backgroundColor: colors.successGlow,
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill
  },
  matchedTagText: {
    color: colors.success,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  },
  missingTag: {
    backgroundColor: colors.warningGlow,
    borderColor: colors.warning,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill
  },
  missingTagText: {
    color: colors.warning,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
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

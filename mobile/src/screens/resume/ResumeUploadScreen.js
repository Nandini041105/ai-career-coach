import React, { useState, useEffect } from 'react';
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
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../context/AuthContext.js';
import { colors, radii, spacing, typography, shadows } from '../../theme/index.js';
import { Header } from '../../components/Header.js';
import { Button } from '../../components/Button.js';
import { resumeApi, analysisApi } from '../../api/client.js';

export const ResumeUploadScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setLoadingList(true);
    try {
      const res = await resumeApi.getAll();
      if (res.data?.resumes) {
        setResumes(res.data.resumes);
      }
    } catch (e) {
      console.warn('[ResumeUpload] Load resumes error:', e);
    } finally {
      setLoadingList(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
      }
    } catch (error) {
      Alert.alert('File Picker Error', 'Could not open document picker.');
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a PDF resume file first.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', {
        uri: selectedFile.uri,
        name: selectedFile.name || 'resume.pdf',
        type: 'application/pdf'
      });
      formData.append('targetRole', user?.targetRole || 'Software Engineer');

      // 1. Upload Resume
      const uploadRes = await resumeApi.upload(formData);
      const resumeId = uploadRes.data?.resume?._id;

      // 2. Trigger AI Analysis
      await analysisApi.analyze({
        resumeId,
        targetRole: user?.targetRole || 'Software Engineer'
      });

      setUploading(false);
      setSelectedFile(null);
      await loadResumes();

      Alert.alert(
        'Upload & Analysis Complete!',
        'Your resume has been parsed and scored by the AI engine.',
        [
          {
            text: 'View Scorecard',
            onPress: () => navigation.navigate('ResumeScore', { resumeId })
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } catch (error) {
      setUploading(false);
      Alert.alert('Upload Failed', error.message || 'Error parsing resume file.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Resume Upload & Parsing"
        subtitle="Native PDF extraction & ATS scoring"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Upload Dropzone Container */}
        <View style={styles.uploadCard}>
          <TouchableOpacity
            onPress={handlePickDocument}
            activeOpacity={0.7}
            style={[
              styles.dropzone,
              selectedFile && styles.dropzoneSelected
            ]}
          >
            <View style={styles.dropzoneIconBox}>
              <Text style={styles.dropzoneIcon}>{selectedFile ? '📄' : '📁'}</Text>
            </View>

            {selectedFile ? (
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text style={styles.fileSize}>
                  {formatFileSize(selectedFile.size)} • PDF Document
                </Text>
                <Text style={styles.changeText}>Tap to choose a different file</Text>
              </View>
            ) : (
              <View style={styles.instructions}>
                <Text style={styles.dropzoneTitle}>Select PDF Resume</Text>
                <Text style={styles.dropzoneSubtitle}>
                  Tap here to browse documents on your device (Files, Downloads, Google Drive)
                </Text>
                <View style={styles.pdfBadge}>
                  <Text style={styles.pdfBadgeText}>Supports PDF up to 10MB</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {selectedFile && (
            <Button
              title="Upload & Score Resume"
              onPress={handleUploadAndAnalyze}
              loading={uploading}
              size="lg"
              style={styles.uploadButton}
            />
          )}
        </View>

        {/* Existing Uploaded Resumes */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Uploaded Resumes ({resumes.length})</Text>
            {loadingList && <ActivityIndicator size="small" color={colors.primaryLight} />}
          </View>

          {resumes.length === 0 && !loadingList ? (
            <View style={styles.emptyHistoryCard}>
              <Text style={styles.emptyHistoryText}>
                No resumes uploaded yet. Select a PDF above to get started.
              </Text>
            </View>
          ) : (
            resumes.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.resumeItemCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ResumeScore', { resumeId: item._id })}
              >
                <View style={styles.resumeItemIcon}>
                  <Text style={styles.pdfSmallIcon}>📄</Text>
                </View>
                <View style={styles.resumeItemContent}>
                  <Text style={styles.resumeItemName} numberOfLines={1}>
                    {item.originalName || 'Resume.pdf'}
                  </Text>
                  <Text style={styles.resumeItemDate}>
                    Uploaded {new Date(item.createdAt).toLocaleDateString()} • {item.targetRole || 'Software Engineer'}
                  </Text>
                </View>
                <View style={styles.viewScoreBadge}>
                  <Text style={styles.viewScoreBadgeText}>Scorecard →</Text>
                </View>
              </TouchableOpacity>
            ))
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xl
  },
  uploadCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.md
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated
  },
  dropzoneSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow
  },
  dropzoneIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  dropzoneIcon: {
    fontSize: 28
  },
  instructions: {
    alignItems: 'center'
  },
  dropzoneTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold
  },
  dropzoneSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm
  },
  pdfBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  pdfBadgeText: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 1
  },
  fileDetails: {
    alignItems: 'center'
  },
  fileName: {
    color: colors.text,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    textAlign: 'center'
  },
  fileSize: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2
  },
  changeText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium
  },
  uploadButton: {
    marginTop: spacing.md
  },
  historySection: {
    marginTop: spacing.xs
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold
  },
  emptyHistoryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center'
  },
  emptyHistoryText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    textAlign: 'center'
  },
  resumeItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm
  },
  resumeItemIcon: {
    marginRight: spacing.sm
  },
  pdfSmallIcon: {
    fontSize: 24
  },
  resumeItemContent: {
    flex: 1
  },
  resumeItemName: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold
  },
  resumeItemDate: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 1,
    marginTop: 2
  },
  viewScoreBadge: {
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill
  },
  viewScoreBadgeText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  }
});

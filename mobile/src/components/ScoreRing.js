import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, getScoreColor, radii, typography, spacing } from '../theme/index.js';

export const ScoreRing = ({
  score = 0,
  maxScore = 100,
  size = 120,
  strokeWidth = 8,
  label = 'Overall Score',
  sublabel = null
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));
  const scoreColor = getScoreColor(percentage);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: scoreColor,
            shadowColor: scoreColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 5
          }
        ]}
      >
        <View style={styles.innerContent}>
          <Text style={[styles.scoreNumber, { fontSize: size * 0.28, color: colors.text }]}>
            {score}
          </Text>
          <Text style={[styles.scoreMax, { fontSize: size * 0.11, color: colors.textTertiary }]}>
            / {maxScore}
          </Text>
        </View>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm
  },
  outerRing: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreNumber: {
    fontWeight: typography.weights.heavy,
    letterSpacing: -0.5
  },
  scoreMax: {
    fontWeight: typography.weights.medium,
    marginTop: -2
  },
  label: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold
  },
  sublabel: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.sizes.xs
  }
});

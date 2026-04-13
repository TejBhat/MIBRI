import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Button } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { apiService } from "../services/api";
import { storageService } from "../services/storage";
import type { Evaluation, Interview } from "../types";

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ evaluationId: string; interviewId: string }>();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);

        // Load evaluation from API
        const user = await storageService.getUser();
        if (!user) {
          Alert.alert("Error", "User data not found");
          router.replace("/(tabs)/upload");
          return;
        }

        // Get evaluations
        const evaluations = await apiService.getEvaluations(user.email);
        const foundEvaluation = evaluations.find(
          (e) => e.id === params.evaluationId
        );

        if (foundEvaluation) {
          setEvaluation(foundEvaluation);
        }

        // Get interview
        const interviews = await apiService.getInterviews(user.email);
        const foundInterview = interviews.find(
          (i) => i.id === params.interviewId
        );
        if (foundInterview) {
          setInterview(foundInterview);
        }
      } catch (error) {
        console.error("Load results error:", error);
        Alert.alert("Error", "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  if (loading) {
    return (
      <ImageBackground
        source={require("../../assets/images/mibribackground.jpg")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={[styles.container, { justifyContent: "center" }]}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </ImageBackground>
    );
  }

  if (!evaluation) {
    return (
      <ImageBackground
        source={require("../../assets/images/mibribackground.jpg")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={[styles.container, { justifyContent: "center" }]}>
          <Text style={styles.errorText}>Results not found</Text>
          <Button
            mode="contained"
            onPress={() => router.replace("/(tabs)/upload")}
            style={styles.button}
          >
            Go Back
          </Button>
        </View>
      </ImageBackground>
    );
  }

  const scoreColor = (score: number) => {
    if (score >= 8) return "#4CAF50";
    if (score >= 6) return "#FFD700";
    return "#FF6B6B";
  };

  return (
    <ImageBackground
      source={require("../../assets/images/mibribackground.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <LinearGradient
            colors={["rgba(255, 215, 0, 0.2)", "rgba(255, 215, 0, 0.05)"]}
            style={styles.scoreGradient}
          >
            <Text style={styles.scoreLabel}>Overall Score</Text>
            <Text style={[styles.score, { color: scoreColor(evaluation.scores.overall) }]}>
              {evaluation.scores.overall.toFixed(1)} / 10
            </Text>
            <Text style={styles.scoreDescription}>
              {evaluation.scores.overall >= 8
                ? "Excellent Performance! 🎉"
                : evaluation.scores.overall >= 6
                  ? "Good Job! Keep Practicing 👍"
                  : "Keep Improving! 💪"}
            </Text>
          </LinearGradient>
        </View>

        {/* Breakdown Scores */}
        <View style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>

          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreItemLabel}>Technical</Text>
              <View style={styles.scoreItemBar}>
                <View
                  style={[
                    styles.scoreItemFill,
                    {
                      width: `${evaluation.scores.technical * 10}%`,
                      backgroundColor: scoreColor(evaluation.scores.technical),
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreItemValue}>{evaluation.scores.technical.toFixed(1)}</Text>
            </View>

            <View style={styles.scoreItem}>
              <Text style={styles.scoreItemLabel}>Communication</Text>
              <View style={styles.scoreItemBar}>
                <View
                  style={[
                    styles.scoreItemFill,
                    {
                      width: `${evaluation.scores.communication * 10}%`,
                      backgroundColor: scoreColor(evaluation.scores.communication),
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreItemValue}>{evaluation.scores.communication.toFixed(1)}</Text>
            </View>

            <View style={styles.scoreItem}>
              <Text style={styles.scoreItemLabel}>Confidence</Text>
              <View style={styles.scoreItemBar}>
                <View
                  style={[
                    styles.scoreItemFill,
                    {
                      width: `${evaluation.scores.confidence * 10}%`,
                      backgroundColor: scoreColor(evaluation.scores.confidence),
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreItemValue}>{evaluation.scores.confidence.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        {evaluation.summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Feedback</Text>
            <Text style={styles.summaryText}>{evaluation.summary}</Text>
          </View>
        )}

        {/* Strengths */}
        {evaluation.strengths && evaluation.strengths.length > 0 && (
          <View style={styles.listCard}>
            <Text style={styles.sectionTitle}>💪 Strengths</Text>
            {evaluation.strengths.map((strength, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>✓</Text>
                <Text style={styles.listText}>{strength}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Areas to Improve */}
        {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
          <View style={styles.listCard}>
            <Text style={styles.sectionTitle}>📈 Areas to Improve</Text>
            {evaluation.weaknesses.map((weakness, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>→</Text>
                <Text style={styles.listText}>{weakness}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Improvement Plan */}
        {evaluation.improvementPlan && evaluation.improvementPlan.length > 0 && (
          <View style={styles.listCard}>
            <Text style={styles.sectionTitle}>🎯 Improvement Plan</Text>
            {evaluation.improvementPlan.map((plan, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>{index + 1}.</Text>
                <Text style={styles.listText}>{plan}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => router.replace("/(tabs)/interview")}
          style={styles.retakeButton}
          contentStyle={{ height: 56 }}
          labelStyle={styles.retakeButtonLabel}
        >
          🔄 Retake Interview
        </Button>
        <Button
          mode="text"
          onPress={() => router.replace("/dashboard")}
          style={styles.homeButton}
          labelStyle={styles.homeButtonLabel}
        >
          Home
        </Button>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 200,
  },
  scoreCard: {
    marginBottom: 24,
  },
  scoreGradient: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  scoreLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
    marginBottom: 12,
  },
  score: {
    fontSize: 48,
    fontWeight: "900",
    marginBottom: 12,
  },
  scoreDescription: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  breakdownCard: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: 16,
  },
  scoreBreakdown: {
    gap: 16,
  },
  scoreItem: {
    gap: 8,
  },
  scoreItemLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  scoreItemBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreItemFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreItemValue: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "right",
  },
  summaryCard: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  summaryText: {
    fontSize: 13,
    color: "#FFFFFF",
    lineHeight: 20,
  },
  listCard: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  listBullet: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "700",
    minWidth: 24,
  },
  listText: {
    flex: 1,
    fontSize: 13,
    color: "#FFFFFF",
    lineHeight: 18,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    gap: 12,
  },
  retakeButton: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
  },
  retakeButtonLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000",
  },
  homeButton: {
    borderRadius: 12,
  },
  homeButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  errorText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
  },
});
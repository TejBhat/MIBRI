import { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../services/api";
import { storageService } from "../services/storage";
import type { Interview, InterviewQuestion, User, Resume } from "../types";

const { width, height } = Dimensions.get("window");

export default function InterviewScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "questions" | "interview">("setup");
  const [duration, setDuration] = useState<"5min" | "10min" | "15min">("10min");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  
  // ✅ FIX: Use NodeJS.Timeout | number | null for React Native
  const timerRef = useRef<NodeJS.Timeout | number | null>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const savedUser = await storageService.getUser();
      const savedResume = await storageService.getResume();
      setUser(savedUser);
      setResume(savedResume);
    };
    loadData();
  }, []);

  // Timer logic with correct cleanup
  useEffect(() => {
    if (step === "interview" && interview) {
      const totalSeconds = interview.duration_minutes * 60;
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev >= totalSeconds) {
            handleEndInterview();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current as NodeJS.Timeout);
        }
      };
    }
  }, [step, interview]);

  // ... rest of your interview screen code remains the same
  
  const startInterview = async () => {
    if (!user) {
      Alert.alert("Error", "User data not found. Please upload resume first.");
      return;
    }

    try {
      setLoading(true);

      const newInterview = await apiService.startInterview(user.email, duration);

      setInterview(newInterview);
      setUserAnswers(new Array(newInterview.questions.length).fill(""));
      setTimerSeconds(0);
      setCurrentQuestion(0);
      setStep("interview");

      await storageService.saveCurrentInterview(newInterview);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start interview";
      Alert.alert("Error", errorMessage);
      console.error("Start interview error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (text: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = text;
    setUserAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (interview && currentQuestion < interview.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleEndInterview = async () => {
    if (!interview) return;

    Alert.alert(
      "End Interview",
      "Are you sure you want to end the interview?",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "End",
          onPress: async () => {
            await submitInterview();
          },
        },
      ]
    );
  };

  const submitInterview = async () => {
    if (!interview || !user || !resume) {
      Alert.alert("Error", "Missing interview data");
      return;
    }

    try {
      setSubmitting(true);

      await apiService.submitAnswers(interview.id, userAnswers);

      const evaluation = await apiService.submitForEvaluation(
        user.email,
        interview.id,
        resume.resume_text,
        interview.questions,
        userAnswers
      );

      router.push({
        pathname: "/(tabs)/result",
        params: {
          evaluationId: evaluation.id,
          interviewId: interview.id,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit interview";
      Alert.alert("Error", errorMessage);
      console.error("Submit interview error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Setup step
  if (step === "setup") {
    return (
      <ImageBackground
        source={require("../../assets/images/mibribackground.jpg")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <ScrollView contentContainerStyle={styles.setupContent}>
          <Text style={styles.setupTitle}>Choose Interview Duration</Text>

          <View style={styles.durationCards}>
            {(["5min", "10min", "15min"] as const).map((dur) => (
              <TouchableOpacity
                key={dur}
                onPress={() => setDuration(dur)}
                style={[
                  styles.durationCard,
                  duration === dur && styles.durationCardSelected,
                ]}
              >
                <Text style={styles.durationText}>
                  {dur === "5min" ? "5" : dur === "10min" ? "10" : "15"}
                </Text>
                <Text style={styles.durationLabel}>minutes</Text>
                <Text style={styles.durationQuestions}>
                  {dur === "5min" ? "5-6" : dur === "10min" ? "8-10" : "12-15"} Q
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.setupInfo}>
            <Text style={styles.setupInfoText}>
              💡 You can pause and resume anytime. Your answers are saved automatically.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.setupButtonContainer}>
          <Button
            mode="contained"
            onPress={startInterview}
            loading={loading}
            disabled={loading}
            style={styles.startButton}
            contentStyle={{ height: 56 }}
            labelStyle={styles.startButtonLabel}
          >
            {loading ? "Starting..." : "Start Interview"}
          </Button>
          <Button
            mode="text"
            onPress={() => router.back()}
            style={styles.backButton}
            labelStyle={styles.backButtonLabel}
          >
            Back
          </Button>
        </View>
      </ImageBackground>
    );
  }

  // Interview step
  if (step === "interview" && interview) {
    const question = interview.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / interview.questions.length) * 100;
    const remainingSeconds = interview.duration_minutes * 60 - timerSeconds;

    return (
      <ImageBackground
        source={require("../../assets/images/mibribackground.jpg")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.interviewHeader}>
          <View style={styles.timerBox}>
            <Ionicons name="timer" size={20} color="#FFD700" />
            <Text
              style={[
                styles.timerText,
                remainingSeconds < 60 && styles.timerWarning,
              ]}
            >
              {formatTimer(timerSeconds)}
            </Text>
          </View>

          <View style={styles.progressBox}>
            <Text style={styles.progressText}>
              {currentQuestion + 1} / {interview.questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleEndInterview}
            style={styles.endButton}
          >
            <Ionicons name="close" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.questionContent}>
          <View style={styles.questionCard}>
            <LinearGradient
              colors={["rgba(255, 215, 0, 0.2)", "rgba(255, 215, 0, 0.05)"]}
              style={styles.questionBox}
            >
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {question.category === "technical" ? "🔧" : "🤝"}{" "}
                  {question.category}
                </Text>
              </View>

              <Text style={styles.questionText}>{question.question}</Text>

              <View style={styles.difficultyBar}>
                <Text style={styles.difficultyLabel}>Difficulty:</Text>
                <View style={styles.difficultyDots}>
                  {[1, 2, 3].map((dot) => (
                    <View
                      key={dot}
                      style={[
                        styles.difficultyDot,
                        {
                          backgroundColor:
                            (question.difficulty === "easy" && dot === 1) ||
                            (question.difficulty === "medium" && dot <= 2) ||
                            (question.difficulty === "hard" && dot <= 3)
                              ? "#FFD700"
                              : "rgba(255, 255, 255, 0.3)",
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.answerSection}>
            <Text style={styles.answerLabel}>Your Answer</Text>
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>
                {userAnswers[currentQuestion] ||
                  "Start typing or speaking your answer..."}
              </Text>
            </View>

            <Text style={styles.tipsText}>
              💡 Speak clearly and take your time. Answer should be 30-60 seconds.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.questionNavigation}>
          <Button
            mode="outlined"
            onPress={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            style={styles.navButton}
            labelStyle={styles.navButtonLabel}
          >
            ← Previous
          </Button>

          {currentQuestion === interview.questions.length - 1 ? (
            <Button
              mode="contained"
              onPress={handleEndInterview}
              loading={submitting}
              disabled={submitting}
              style={styles.submitButton}
              contentStyle={{ height: 50 }}
              labelStyle={styles.submitButtonLabel}
            >
              {submitting ? "Submitting..." : "Submit Interview"}
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={goToNextQuestion}
              style={styles.nextButton}
              contentStyle={{ height: 50 }}
              labelStyle={styles.nextButtonLabel}
            >
              Next →
            </Button>
          )}
        </View>
      </ImageBackground>
    );
  }

  return null;
}

// Styles (same as before)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  setupContent: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    paddingBottom: 200,
  },
  setupTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 32,
  },
  durationCards: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
    gap: 12,
  },
  durationCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  durationCardSelected: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderColor: "#FFD700",
  },
  durationText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFD700",
    marginBottom: 8,
  },
  durationLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 8,
  },
  durationQuestions: {
    fontSize: 12,
    color: "#FFD700",
    fontWeight: "600",
  },
  setupInfo: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  setupInfoText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  setupButtonContainer: {
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
  startButton: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
  },
  startButtonLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000",
  },
  backButton: {
    borderRadius: 12,
  },
  backButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  interviewHeader: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFD700",
  },
  timerWarning: {
    color: "#FF6B6B",
  },
  progressBox: {
    flex: 1,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 6,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
  },
  endButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  questionContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 200,
  },
  questionCard: {
    marginBottom: 24,
  },
  questionBox: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: "#FFD700",
    fontWeight: "700",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    lineHeight: 26,
  },
  difficultyBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  difficultyLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },
  difficultyDots: {
    flexDirection: "row",
    gap: 6,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  answerSection: {
    marginBottom: 24,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: 12,
  },
  answerBox: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    justifyContent: "flex-start",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  answerText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 20,
  },
  tipsText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontStyle: "italic",
  },
  questionNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    flexDirection: "row",
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderColor: "#FFD700",
  },
  navButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFD700",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#FFD700",
  },
  nextButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
  },
  submitButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
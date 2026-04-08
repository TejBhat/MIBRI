import { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Define your navigation stack types
type RootStackParamList = {
  interview: { duration: string };
  // Add other screens here
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DurationOption {
  id: string;
  minutes: number;
  questions: string;
  description: string;
  icon: string;
  color: string;
  gradient: [string, string];
  badge?: string;
}

const DURATIONS: DurationOption[] = [
  {
    id: "5min",
    minutes: 5,
    questions: "5-6",
    description: "Quick practice run",
    icon: "⚡",
    color: "#FF6B35",
    gradient: ["rgba(255, 107, 53, 0.4)", "rgba(255, 107, 53, 0.1)"],
  },
  {
    id: "10min",
    minutes: 10,
    questions: "8-10",
    description: "Standard session",
    icon: "🎯",
    color: "#FFD700",
    gradient: ["rgba(255, 215, 0, 0.4)", "rgba(255, 215, 0, 0.1)"],
    badge: "Most Popular",
  },
  {
    id: "15min",
    minutes: 15,
    questions: "12-15",
    description: "Full interview prep",
    icon: "🏆",
    color: "#00D4FF",
    gradient: ["rgba(0, 212, 255, 0.4)", "rgba(0, 212, 255, 0.1)"],
  },
];

export default function Interview() {
  const navigation = useNavigation<NavigationProp>();
  const [selected, setSelected] = useState<string | null>(null);

  const startInterview = () => {
    if (selected) {
      const duration = DURATIONS.find((d) => d.id === selected);
      console.log("Starting interview with duration:", duration?.minutes, "min");
      // Navigate to interview screen
      navigation.navigate("interview", { duration: selected });
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={require("../../assets/images/mibribackground.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Dark overlay */}
      <View style={styles.overlay} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.stepBadge}>Step 2 of 4</Text>
          <Text style={styles.title}>Choose Interview Duration</Text>
          <Text style={styles.subtitle}>
            Select how long you want to practice
          </Text>
        </View>

        {/* Cards Container */}
        <View style={styles.cardsContainer}>
          {DURATIONS.map((duration) => (
            <TouchableOpacity
              key={duration.id}
              onPress={() => setSelected(duration.id)}
              activeOpacity={0.7}
              style={styles.cardWrapper}
            >
              {duration.badge && selected === duration.id && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badge}>{duration.badge}</Text>
                </View>
              )}

              <LinearGradient
                colors={
                  selected === duration.id
                    ? [
                        `rgba(${
                          duration.id === "5min"
                            ? "255, 107, 53"
                            : duration.id === "10min"
                              ? "255, 215, 0"
                              : "0, 212, 255"
                        }, 0.5)`,
                        `rgba(${
                          duration.id === "5min"
                            ? "255, 107, 53"
                            : duration.id === "10min"
                              ? "255, 215, 0"
                              : "0, 212, 255"
                        }, 0.15)`,
                      ]
                    : duration.gradient
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.card,
                  selected === duration.id && styles.cardSelected,
                ]}
              >
                {/* Left Icon Section */}
                <View style={styles.iconSection}>
                  <Text style={styles.icon}>{duration.icon}</Text>
                </View>

                {/* Middle Content Section */}
                <View style={styles.contentSection}>
                  <Text style={[styles.durationTime, { color: duration.color }]}>
                    {duration.minutes} min
                  </Text>
                  <Text style={styles.questionsCount}>
                    ~{duration.questions} questions
                  </Text>
                  <Text style={styles.description}>
                    {duration.description}
                  </Text>
                </View>

                {/* Right Checkmark */}
                <View style={styles.checkmarkSection}>
                  {selected === duration.id && (
                    <View
                      style={[
                        styles.checkmark,
                        {
                          backgroundColor: duration.color,
                          shadowColor: duration.color,
                        },
                      ]}
                    >
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features Info Box */}
        <View style={styles.featuresBox}>
          <Text style={styles.featuresTitle}>📋 What's Included:</Text>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🎤</Text>
            <Text style={styles.featureText}>AI-generated interview questions</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Real-time speech recognition</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>
              Detailed feedback & improvement plan
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Tip: Start with 5 minutes if this is your first interview!
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          disabled={!selected}
          onPress={startInterview}
          style={[
            styles.startButton,
            !selected && styles.startButtonDisabled,
          ]}
          contentStyle={{ height: 56 }}
          labelStyle={styles.startButtonLabel}
        >
          Start Interview
        </Button>
        <Button
          mode="text"
          onPress={goBack}
          style={styles.backButton}
          contentStyle={{ height: 50 }}
          labelStyle={styles.backButtonLabel}
        >
          Back
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 200,
  },

  header: {
    marginBottom: 32,
    marginTop: 8,
  },

  stepBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFD700",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    letterSpacing: 0.3,
    opacity: 0.9,
  },

  cardsContainer: {
    marginBottom: 28,
    gap: 16,
  },

  badgeContainer: {
    position: "absolute",
    top: -8,
    right: 16,
    zIndex: 10,
  },

  badge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    backgroundColor: "#FFD700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },

  cardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 215, 0, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  cardSelected: {
    borderColor: "rgba(255, 215, 0, 0.8)",
    backgroundColor: "rgba(255, 215, 0, 0.14)",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },

  iconSection: {
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
    width: 48,
  },

  icon: {
    fontSize: 40,
  },

  contentSection: {
    flex: 1,
    justifyContent: "center",
  },

  durationTime: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  questionsCount: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 3,
  },

  description: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "500",
  },

  checkmarkSection: {
    marginLeft: 12,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },

  checkmarkText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  featuresBox: {
    backgroundColor: "rgba(255, 215, 0, 0.12)",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#FFD700",
  },

  featuresTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: 12,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  featureIcon: {
    fontSize: 16,
    marginRight: 10,
  },

  featureText: {
    flex: 1,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },

  infoBox: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#FFD700",
  },

  infoText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    gap: 12,
  },

  startButton: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    elevation: 8,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  startButtonDisabled: {
    backgroundColor: "rgba(255, 215, 0, 0.4)",
    elevation: 0,
    shadowOpacity: 0,
  },

  startButtonLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.5,
  },

  backButton: {
    borderRadius: 12,
  },

  backButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
import { router } from "expo-router";
import { Text, StyleSheet, ImageBackground, View } from "react-native";
import { Button } from "react-native-paper";

export default function DashBoard() {
  return (
    <ImageBackground
      source={require("../../assets/images/mibribackground.jpg")}
      style={styles.wholescreen}
      resizeMode="cover"
    >
      {/* Dark overlay for better text contrast */}
      <View style={styles.overlay} />

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>MIBRI</Text>
        <Text style={styles.subtitle}>Mock Interview Before Real Interview</Text>

        <Button
          mode="contained"
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          onPress={() =>router.push("/(tabs)/upload") }
            // Navigate to resume upload
        >
          📄 Upload Resume
        </Button>

        <Text style={styles.description}>
          Start your mock interview journey today
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wholescreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },

  contentContainer: {
    alignItems: "center",
    zIndex: 1,
  },

  title: {
    fontWeight: "900",
    fontSize: 72,
    color: "#FFD700",
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },

  subtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 48,
    letterSpacing: 0.5,
    fontWeight: "500",
  },

  button: {
    borderRadius: 50,
    width: 240,
    backgroundColor: "#FFD700",
    elevation: 8,
    marginBottom: 32,
  },

  buttonContent: {
    height: 56,
    justifyContent: "center",
  },

  buttonLabel: {
    fontWeight: "700",
    fontSize: 18,
    color: "#000000",
    letterSpacing: 0.5,
  },

  description: {
    fontSize: 13,
    color: "#ffffff",
    letterSpacing: 0.3,
  },
});
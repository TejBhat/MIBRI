import { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Button } from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Define your navigation stack types
type RootStackParamList = {
  interview: undefined;
  // Add other screens here
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ResumeFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export default function Upload() {
  const navigation = useNavigation<NavigationProp>();
  const [resume, setResume] = useState<ResumeFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const pickResume = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("User cancelled");
        setLoading(false);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Validate file size (max 10MB)
        if (file.size && file.size > 10 * 1024 * 1024) {
          setError("File size exceeds 10 MB limit");
          setLoading(false);
          return;
        }

        const resumeData: ResumeFile = {
          uri: file.uri,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType || "application/pdf",
        };

        setResume(resumeData);
        setError(null);
        console.log("File picked:", resumeData);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error picking document";
      setError("Error: " + errorMessage);
      console.error("Pick error:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadToBackend = async () => {
    if (!resume) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      
      // Create proper file object for FormData
      const fileToUpload: any = {
        uri: resume.uri,
        name: resume.name,
        type: resume.mimeType || "application/pdf",
      };
      
      formData.append("resume", fileToUpload);

      // Replace with your actual backend URL
      const response = await fetch("http://your-server:5000/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Upload failed with status ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Upload success:", data);
      setUploadSuccess(true);
      setError(null);

      // Navigate to duration selection after 1.5 seconds
      setTimeout(() => {
        navigation.navigate("interview");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setError("Upload error: " + errorMessage);
      console.error("Upload error:", error);
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
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
        <TouchableOpacity
  style={styles.backButton}
  onPress={() => navigation.goBack()}
>
<Ionicons name="arrow-back" size={24} color="#FFD700" />
</TouchableOpacity>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upload Your Resume</Text>
          <Text style={styles.subtitle}>
            Your resume helps us generate personalized questions
          </Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <LinearGradient
            colors={["rgba(255, 215, 0, 0.15)", "rgba(255, 215, 0, 0.05)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoCard}
          >
            <Text style={styles.infoIcon}>✓</Text>
            <Text style={styles.infoText}>PDF format only</Text>
          </LinearGradient>

          <LinearGradient
            colors={["rgba(255, 215, 0, 0.15)", "rgba(255, 215, 0, 0.05)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoCard}
          >
            <Text style={styles.infoIcon}>✓</Text>
            <Text style={styles.infoText}>Max 10 MB file size</Text>
          </LinearGradient>

          <LinearGradient
            colors={["rgba(255, 215, 0, 0.15)", "rgba(255, 215, 0, 0.05)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoCard}
          >
            <Text style={styles.infoIcon}>✓</Text>
            <Text style={styles.infoText}>Stored securely</Text>
          </LinearGradient>
        </View>

        {/* File Display Section */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {uploadSuccess ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Upload Successful!</Text>
            <Text style={styles.successSubtext}>
              Redirecting to interview setup...
            </Text>
          </View>
        ) : resume ? (
          <LinearGradient
            colors={["rgba(76, 175, 80, 0.2)", "rgba(76, 175, 80, 0.05)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fileBox}
          >
            <Text style={styles.fileIcon}>📄</Text>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {resume.name}
              </Text>
              {resume.size && (
                <Text style={styles.fileSize}>
                  {(resume.size / 1024).toFixed(2)} KB
                </Text>
              )}
            </View>
            <Text style={styles.checkIcon}>✓</Text>
          </LinearGradient>
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderIcon}>📁</Text>
            <Text style={styles.placeholderText}>No file selected</Text>
            <Text style={styles.placeholderSubtext}>
              Tap "Select Resume" to choose a PDF file
            </Text>
          </View>
        )}

        {/* Upload Tips */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>💡 Tips for best results:</Text>
          <Text style={styles.tipItem}>• Use recent resume with current skills</Text>
          <Text style={styles.tipItem}>• Include relevant experience and projects</Text>
          <Text style={styles.tipItem}>• Ensure good PDF formatting</Text>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.buttonContainer}>
        {!uploadSuccess && (
          <>
            <Button
              mode="contained"
              onPress={pickResume}
              loading={loading}
              disabled={loading || uploading}
              style={styles.selectButton}
              contentStyle={{ height: 56 }}
              labelStyle={styles.selectButtonLabel}
            >
              {resume ? "Change Resume" : "Select Resume"}
            </Button>

            <Button
              mode="contained"
              onPress={uploadToBackend}
              loading={uploading}
              disabled={!resume || uploading || loading}
              style={[
                styles.uploadButton,
                (!resume || uploading || loading) &&
                  styles.uploadButtonDisabled,
              ]}
              contentStyle={{ height: 56 }}
              labelStyle={styles.uploadButtonLabel}
            >
              {uploading ? "Uploading..." : "Continue"}
            </Button>
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
  position: "absolute",
  top: 50,
  left: 20,
  zIndex: 20,
  backgroundColor: "rgba(0,0,0,0.5)",
  padding: 10,
  borderRadius: 25,
},

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  scrollContent: {
  paddingHorizontal: 20,
  paddingTop: 95,   
  paddingBottom: 200,
},

  header: {
    marginBottom: 32,
    marginTop: 8,
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

  infoSection: {
    marginBottom: 28,
    gap: 10,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },

  infoIcon: {
    fontSize: 16,
    marginRight: 12,
    fontWeight: "bold",
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  errorBox: {
    flexDirection: "row",
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
    alignItems: "center",
  },

  errorIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#FF6B6B",
    fontWeight: "500",
  },

  successBox: {
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.4)",
  },

  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 4,
  },

  successSubtext: {
    fontSize: 13,
    color: "#A5D6A7",
    fontWeight: "500",
  },

  fileBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "rgba(76, 175, 80, 0.4)",
  },

  fileIcon: {
    fontSize: 32,
    marginRight: 14,
  },

  fileInfo: {
    flex: 1,
  },

  fileName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  fileSize: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },

  checkIcon: {
    fontSize: 24,
    color: "#4CAF50",
    marginLeft: 12,
  },

  placeholderBox: {
    alignItems: "center",
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    borderRadius: 14,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(244, 67, 54, 0.3)",
  },

  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  placeholderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  placeholderSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },

  tipsBox: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#FFD700",
  },

  tipsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: 10,
  },

  tipItem: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginBottom: 6,
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
    backgroundColor: "#000",
    gap: 12,
  },

  selectButton: {
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFD700",
  },

  selectButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFD700",
    letterSpacing: 0.5,
  },

  uploadButton: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    elevation: 8,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  uploadButtonDisabled: {
    backgroundColor: "rgba(255, 215, 0, 0.4)",
    elevation: 0,
    shadowOpacity: 0,
  },

  uploadButtonLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.5,
  },
});
import { API_ENDPOINTS } from "../constants/config";
import type {
  User,
  Resume,
  Interview,
  Evaluation,
  ApiResponse,
  InterviewQuestion,
} from "../types";

class ApiService {
  private baseUrl = API_ENDPOINTS["HEALTH"].replace("/health", "");

  /**
   * Check backend health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }

  /**
   * ==================== RESUME OPERATIONS ====================
   */

  /**
   * Upload resume PDF
   */
  async uploadResume(
    uri: string,
    filename: string,
    email: string,
    fullName: string
  ): Promise<{ user: User; resume: Resume }> {
    try {
      const formData = new FormData();

      // Create file object for FormData
      const fileToUpload = {
        uri,
        name: filename,
        type: "application/pdf",
      } as any;

      formData.append("resume", fileToUpload);
      formData.append("email", email);
      formData.append("fullName", fullName);

      const response = await fetch(API_ENDPOINTS.UPLOAD_RESUME, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Resume uploaded successfully");
      return {
        user: data.user,
        resume: data.resume,
      };
    } catch (error) {
      console.error("Resume upload error:", error);
      throw error;
    }
  }

  /**
   * Get user's resumes
   */
  async getResumes(email: string): Promise<Resume[]> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.GET_RESUMES}/${email}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch resumes: ${response.status}`);
      }

      const data = await response.json();
      return data.resumes || [];
    } catch (error) {
      console.error("Get resumes error:", error);
      throw error;
    }
  }

  /**
   * ==================== INTERVIEW OPERATIONS ====================
   */

  /**
   * Start new interview
   */
  async startInterview(
    email: string,
    duration: "5min" | "10min" | "15min"
  ): Promise<Interview> {
    try {
      const response = await fetch(`${API_ENDPOINTS.START_INTERVIEW}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          duration,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to start interview`);
      }

      const data = await response.json();
      console.log("🎤 Interview started");
      return data.interview;
    } catch (error) {
      console.error("Start interview error:", error);
      throw error;
    }
  }

  /**
   * Submit interview answers
   */
  async submitAnswers(
    interviewId: string,
    userAnswers: string[]
  ): Promise<Interview> {
    try {
      const response = await fetch(`${API_ENDPOINTS.SUBMIT_ANSWERS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId,
          userAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit answers`);
      }

      const data = await response.json();
      console.log("✅ Answers submitted");
      return data.interview;
    } catch (error) {
      console.error("Submit answers error:", error);
      throw error;
    }
  }

  /**
   * Get user's interviews
   */
  async getInterviews(email: string): Promise<Interview[]> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.GET_INTERVIEWS}/${email}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch interviews`);
      }

      const data = await response.json();
      return data.interviews || [];
    } catch (error) {
      console.error("Get interviews error:", error);
      throw error;
    }
  }

  /**
   * ==================== EVALUATION OPERATIONS ====================
   */

  /**
   * Submit for evaluation
   */
  async submitForEvaluation(
    email: string,
    interviewId: string,
    resumeText: string,
    questions: InterviewQuestion[],
    userAnswers: string[]
  ): Promise<Evaluation> {
    try {
      const response = await fetch(`${API_ENDPOINTS.SUBMIT_EVALUATION}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          interviewId,
          resumeText,
          questions,
          userAnswers,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get evaluation");
      }

      const data = await response.json();
      console.log("📊 Evaluation received");
      return data.evaluation;
    } catch (error) {
      console.error("Submit evaluation error:", error);
      throw error;
    }
  }

  /**
   * Get user's evaluations
   */
  async getEvaluations(email: string): Promise<Evaluation[]> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.GET_EVALUATIONS}/${email}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch evaluations`);
      }

      const data = await response.json();
      return data.evaluations || [];
    } catch (error) {
      console.error("Get evaluations error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
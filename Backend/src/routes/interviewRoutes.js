import express from "express";
import {
  generateInterviewQuestions,
  generateFollowUpQuestion,
} from "../services/mistralService.js";
import {
  getUser,
  getLatestResume,
  createInterview,
  updateInterviewAnswers,
  getInterview,
  getUserInterviews,
} from "../services/supabaseService.js";

const router = express.Router();

/**
 * POST /api/interview/start
 * Start a new interview session
 */
router.post("/start", async (req, res) => {
  try {
    const { email, duration } = req.body;

    if (!email || !duration) {
      return res
        .status(400)
        .json({ error: "Email and duration are required" });
    }

    console.log(`🎤 Starting interview for ${email} (${duration})`);

    // Step 1: Get user
    const user = await getUser(email);
    if (!user) {
      return res.status(404).json({
        error: "User not found. Please upload resume first.",
      });
    }

    // Step 2: Get latest resume
    const resume = await getLatestResume(user.id);
    if (!resume) {
      return res.status(404).json({
        error: "No resume found. Please upload resume first.",
      });
    }

    // Step 3: Generate questions using Mistral
    const questionMap = {
      "5min": 5,
      "10min": 8,
      "15min": 12,
    };

    const numberOfQuestions = questionMap[duration] || 8;

    console.log(
      ` Generating ${numberOfQuestions} questions for ${duration} interview`
    );

    const questions = await generateInterviewQuestions(
      resume.resume_text,
      duration,
      numberOfQuestions
    );

    // Step 4: Create interview record in Supabase
    const interview = await createInterview(
      user.id,
      resume.id,
      parseInt(duration),
      questions
    );

    res.json({
      success: true,
      interview: {
        id: interview.id,
        duration_minutes: interview.duration_minutes,
        questions: interview.questions,
        status: interview.status,
        startedAt: interview.started_at,
      },
    });
  } catch (error) {
    console.error("Start interview error:", error);
    res.status(500).json({
      error: error.message || "Failed to start interview",
      status: 500,
    });
  }
});

/**
 * POST /api/interview/submit-answers
 * Submit interview answers
 */
router.post("/submit-answers", async (req, res) => {
  try {
    const { interviewId, userAnswers } = req.body;

    if (!interviewId || !userAnswers) {
      return res
        .status(400)
        .json({ error: "Interview ID and answers are required" });
    }

    console.log(`Submitting answers for interview ${interviewId}`);

    // Update interview with answers
    const updatedInterview = await updateInterviewAnswers(
      interviewId,
      userAnswers
    );

    res.json({
      success: true,
      interview: {
        id: updatedInterview.id,
        status: updatedInterview.status,
        completedAt: updatedInterview.ended_at,
      },
    });
  } catch (error) {
    console.error("Submit answers error:", error);
    res.status(500).json({
      error: error.message || "Failed to submit answers",
      status: 500,
    });
  }
});

/**
 * POST /api/interview/follow-up
 * Generate follow-up question based on user's answer
 */
router.post("/follow-up", async (req, res) => {
  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      return res
        .status(400)
        .json({ error: "Question and answer are required" });
    }

    console.log(" Generating follow-up question");

    const followUp = await generateFollowUpQuestion(question, userAnswer);

    res.json({
      success: true,
      originalQuestion: question,
      userAnswer,
      followUpQuestion: followUp,
      model: "Mistral-7B",
    });
  } catch (error) {
    console.error("Follow-up generation error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate follow-up",
      status: 500,
    });
  }
});

/**
 * GET /api/interview/:email
 * Get all interviews for a user
 */
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Get user
    const user = await getUser(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get interviews
    const interviews = await getUserInterviews(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      interviews: interviews.map((i) => ({
        id: i.id,
        duration_minutes: i.duration_minutes,
        status: i.status,
        startedAt: i.started_at,
        endedAt: i.ended_at,
        questionCount: i.questions?.length || 0,
      })),
    });
  } catch (error) {
    console.error("Get interviews error:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch interviews",
      status: 500,
    });
  }
});

export default router;
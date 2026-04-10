import express from "express";
import { evaluateInterview } from "../services/mistralService.js";
import {
  getUser,
  getInterview,
  saveEvaluation,
  getEvaluation,
} from "../services/supabaseService.js";

const router = express.Router();

/**
 * POST /api/evaluation/submit
 * Submit interview for evaluation and save to Supabase
 */
router.post("/submit", async (req, res) => {
  try {
    const { email, interviewId, resumeText, questions, userAnswers } =
      req.body;

    // Validation
    if (!email || !interviewId) {
      return res
        .status(400)
        .json({ error: "Email and interview ID are required" });
    }

    if (!resumeText || !questions || !userAnswers) {
      return res.status(400).json({
        error: "Resume text, questions, and answers are required",
      });
    }

    if (questions.length !== userAnswers.length) {
      return res.status(400).json({
        error: "Number of questions must match number of answers",
      });
    }

    console.log(`Evaluating interview ${interviewId} for ${email}`);

    // Step 1: Verify user
    const user = await getUser(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 2: Verify interview belongs to user
    const interview = await getInterview(interviewId);
    if (!interview || interview.user_id !== user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Step 3: Get evaluation from Mistral
    console.log("Getting AI evaluation from Mistral...");
    const aiEvaluation = await evaluateInterview(
      resumeText,
      questions,
      userAnswers
    );

    // Step 4: Save evaluation to Supabase
    const evaluation = await saveEvaluation(
      interviewId,
      aiEvaluation.overallScore,
      aiEvaluation.technicalScore,
      aiEvaluation.communicationScore,
      aiEvaluation.confidenceScore,
      aiEvaluation.strengths,
      aiEvaluation.weaknesses,
      aiEvaluation.specificMistakes,
      aiEvaluation.improvedAnswers,
      aiEvaluation.improvementPlan,
      aiEvaluation.summary
    );

    console.log(`Evaluation saved: ${evaluation.id}`);

    res.json({
      success: true,
      evaluation: {
        id: evaluation.id,
        interviewId: evaluation.interview_id,
        scores: {
          overall: evaluation.overall_score,
          technical: evaluation.technical_score,
          communication: evaluation.communication_score,
          confidence: evaluation.confidence_score,
        },
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        improvementPlan: evaluation.improvement_plan,
        summary: evaluation.summary,
        createdAt: evaluation.created_at,
      },
      timestamp: new Date(),
      model: "Mistral-7B",
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({
      error: error.message || "Failed to evaluate interview",
      status: 500,
    });
  }
});

/**
 * GET /api/evaluation/:email
 * Get all evaluations for a user
 */
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Get user
    const user = await getUser(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get evaluations (we'll fetch via interviews and join manually)
    const interviews = await getUserInterviews(user.id);

    const evaluations = [];
    for (const interview of interviews) {
      const evaluation = await getEvaluation(interview.id);
      if (evaluation) {
        evaluations.push({
          ...evaluation,
          interviewDuration: interview.duration_minutes,
        });
      }
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      evaluations: evaluations.map((e) => ({
        id: e.id,
        interviewId: e.interview_id,
        overallScore: e.overall_score,
        technicalScore: e.technical_score,
        communicationScore: e.communication_score,
        confidenceScore: e.confidence_score,
        createdAt: e.created_at,
      })),
    });
  } catch (error) {
    console.error("Get evaluations error:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch evaluations",
      status: 500,
    });
  }
});

export default router;
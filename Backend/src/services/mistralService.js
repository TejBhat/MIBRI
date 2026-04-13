import { HfInference } from "@huggingface/inference";
import fs from "fs";

// Initialize Hugging Face client with Mistral
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Model to use
const MODEL = "mistralai/Mistral-7B-Instruct-v0.1";

/**
 * Generate interview questions based on resume
 */
export async function generateInterviewQuestions(
  resumeText,
  duration,
  numberOfQuestions
) {
  try {
    const prompt = `You are an expert technical interviewer. Based on the following resume, generate exactly ${numberOfQuestions} interview questions.

Resume Content:
${resumeText}

Duration: ${duration} minutes
Interview Type: Behavioral and Technical Mix

Generate questions in JSON format ONLY (no other text):
[
  {
    "questionId": 1,
    "question": "Question text here",
    "category": "technical",
    "difficulty": "medium"
  }
]

Remember: Return ONLY valid JSON array, no markdown, no explanations.`;

    console.log(
      `🎯 Requesting Mistral for ${numberOfQuestions} questions...`
    );

    const response = await hf.textGeneration({
      model: MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 2000,
        temperature: 0.7,
        top_p: 0.95,
      },
    });

    // Extract JSON from response
    const responseText = response.generated_text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from Mistral response");
    }

    const questions = JSON.parse(jsonMatch[0]);
    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate interview questions");
  }
}

/**
 * Generate comprehensive evaluation
 */
export async function evaluateInterview(resumeText, questions, userAnswers) {
  try {
    const interviewTranscript = questions
      .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${userAnswers[i] || "No answer provided"}`)
      .join("\n\n");

    const prompt = `You are an expert technical interview evaluator. Evaluate this mock interview comprehensively.

Resume:
${resumeText}

Interview Transcript:
${interviewTranscript}

Provide evaluation in STRICT JSON format (NO other text):
{
  "overallScore": 7.5,
  "technicalScore": 8.0,
  "communicationScore": 7.2,
  "confidenceScore": 7.1,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "specificMistakes": ["mistake 1", "mistake 2"],
  "improvedAnswers": [
    {
      "questionId": 1,
      "originalAnswer": "user's answer",
      "improvedAnswer": "better version"
    }
  ],
  "improvementPlan": ["action 1", "action 2", "action 3"],
  "summary": "Overall feedback summary"
}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.`;

    console.log("Requesting Mistral for evaluation...");

    const response = await hf.textGeneration({
      model: MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 3000,
        temperature: 0.7,
        top_p: 0.95,
      },
    });

    const responseText = response.generated_text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from Mistral response");
    }

    const evaluation = JSON.parse(jsonMatch[0]);
    return evaluation;
  } catch (error) {
    console.error("Error evaluating interview:", error);
    throw new Error("Failed to evaluate interview");
  }
}

/**
 * Extract text from PDF
 */
export async function extractPDFText(filePath) {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to extract PDF text");
  }
}

/**
 * Generate follow-up question based on user's answer
 */
export async function generateFollowUpQuestion(question, userAnswer) {
  try {
    const prompt = `As a technical interviewer, generate a thoughtful follow-up question.

Original Question: "${question}"

Candidate's Answer: "${userAnswer}"

Generate ONE concise follow-up question (1-2 sentences) that digs deeper. Return ONLY the question text, nothing else.`;

    console.log(" Requesting Mistral for follow-up...");

    const response = await hf.textGeneration({
      model: MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.95,
      },
    });

    return response.generated_text.trim();
  } catch (error) {
    console.error("Error generating follow-up:", error);
    throw new Error("Failed to generate follow-up question");
  }
}
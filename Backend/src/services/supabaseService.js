import supabase from "../config/supabase.js";

/**
 * ==================== USER OPERATIONS ====================
 */

/**
 * Create or get user
 */
export async function createOrGetUser(email, fullName) {
  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      console.log(`User found: ${email}`);
      return existingUser;
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          email,
          full_name: fullName,
        },
      ])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    console.log(`New user created: ${email}`);
    return newUser;
  } catch (error) {
    console.error("User operation error:", error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUser(email) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
}

/**
 * ==================== RESUME OPERATIONS ====================
 */

/**
 * Save resume to database
 */
export async function saveResume(
  userId,
  filename,
  fileUrl,
  resumeText,
  extractedSkills = []
) {
  try {
    const { data, error } = await supabase
      .from("resumes")
      .insert([
        {
          user_id: userId,
          filename,
          file_path: fileUrl,
          resume_text: resumeText,
          extracted_skills: extractedSkills,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log(`📄 Resume saved to database: ${filename}`);
    return data;
  } catch (error) {
    console.error("Save resume error:", error);
    throw error;
  }
}

/**
 * Get user's resumes
 */
export async function getUserResumes(userId) {
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get resumes error:", error);
    throw error;
  }
}

/**
 * Get latest resume for user
 */
export async function getLatestResume(userId) {
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  } catch (error) {
    console.error("Get latest resume error:", error);
    throw error;
  }
}

/**
 * ==================== INTERVIEW OPERATIONS ====================
 */

/**
 * Create interview
 */
export async function createInterview(userId, resumeId, durationMinutes, questions) {
  try {
    const { data, error } = await supabase
      .from("interviews")
      .insert([
        {
          user_id: userId,
          resume_id: resumeId,
          duration_minutes: durationMinutes,
          status: "in_progress",
          questions: questions,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log(`Interview created: ${data.id}`);
    return data;
  } catch (error) {
    console.error("Create interview error:", error);
    throw error;
  }
}

/**
 * Update interview with answers
 */
export async function updateInterviewAnswers(interviewId, userAnswers) {
  try {
    const { data, error } = await supabase
      .from("interviews")
      .update({
        user_answers: userAnswers,
        status: "completed",
        ended_at: new Date(),
      })
      .eq("id", interviewId)
      .select()
      .single();

    if (error) throw error;

    console.log(`Interview completed: ${interviewId}`);
    return data;
  } catch (error) {
    console.error("Update interview error:", error);
    throw error;
  }
}

/**
 * Get interview
 */
export async function getInterview(interviewId) {
  try {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", interviewId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get interview error:", error);
    throw error;
  }
}

/**
 * Get user's interviews
 */
export async function getUserInterviews(userId) {
  try {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get interviews error:", error);
    throw error;
  }
}

/**
 * ==================== EVALUATION OPERATIONS ====================
 */

/**
 * Save evaluation
 */
export async function saveEvaluation(
  interviewId,
  overallScore,
  technicalScore,
  communicationScore,
  confidenceScore,
  strengths,
  weaknesses,
  specificMistakes,
  improvedAnswers,
  improvementPlan,
  summary
) {
  try {
    const { data, error } = await supabase
      .from("evaluations")
      .insert([
        {
          interview_id: interviewId,
          overall_score: overallScore,
          technical_score: technicalScore,
          communication_score: communicationScore,
          confidence_score: confidenceScore,
          strengths,
          weaknesses,
          specific_mistakes: specificMistakes,
          improved_answers: improvedAnswers,
          improvement_plan: improvementPlan,
          summary,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log(`Evaluation saved: ${data.id}`);
    return data;
  } catch (error) {
    console.error("Save evaluation error:", error);
    throw error;
  }
}

/**
 * Get evaluation for interview
 */
export async function getEvaluation(interviewId) {
  try {
    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .eq("interview_id", interviewId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  } catch (error) {
    console.error("Get evaluation error:", error);
    throw error;
  }
}

/**
 * ==================== UTILITY FUNCTIONS ====================
 */

/**
 * Check Supabase connection
 */
export async function checkConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count()");
    if (error) throw error;
    console.log("Supabase connection successful");
    return true;
  } catch (error) {
    console.error("Supabase connection failed:", error);
    return false;
  }
}
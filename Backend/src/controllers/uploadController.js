import supabase from "../config/supabase.js";
import { extractPDFText } from "../services/mistralService.js";
import {
  createOrGetUser,
  saveResume,
} from "../services/supabaseService.js";

export const uploadResume = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { email, fullName } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log(`📄 Resume uploaded: ${file.originalname}`);

    // Step 1: Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log(`File uploaded to storage: ${fileName}`);

    // Step 2: Get public URL
    const { data: urlData } = supabase.storage
      .from("resumes")
      .getPublicUrl(fileName);

    const fileUrl = urlData.publicUrl;

    // Step 3: Extract text from PDF
    const resumeText = await extractPDFText(file.path);
    console.log(`Resume text extracted (${resumeText.length} chars)`);

    // Step 4: Create or get user
    const user = await createOrGetUser(email, fullName || "User");
    console.log(`👤 User: ${user.id}`);

    // Step 5: Save resume to database
    const resume = await saveResume(
      user.id,
      file.originalname,
      fileUrl,
      resumeText
    );

    res.json({
      success: true,
      message: "Resume uploaded and saved successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
      },
      resume: {
        id: resume.id,
        filename: resume.filename,
        size: file.size,
        fileUrl: fileUrl,
        uploadedAt: resume.created_at,
        textPreview: resumeText.substring(0, 500),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    res.status(500).json({
      error: error.message || "Failed to process resume",
      status: 500,
    });
  }
};
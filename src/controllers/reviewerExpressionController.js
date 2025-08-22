import { prisma } from "../config/db.js";

/* ------------------------- helpers ------------------------- */

/**
 * Accepts:
 *  - array: ["a","b"]
 *  - JSON string: '["a","b"]'
 *  - CSV string:  "a, b"
 *  - scalar: "a"
 * Returns: array<string>
 */
function parseSmartArray(v) {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map((s) => `${s}`.trim()).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    if (
      (s.startsWith("[") && s.endsWith("]")) ||
      (s.startsWith("{") && s.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed))
          return parsed.map((x) => `${x}`.trim()).filter(Boolean);
      } catch (_) {
        /* ignore */
      }
    }
    return s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

/** read body from multipart (prefers `req.body.data` JSON if present) */
function extractBodyFromMultipart(req) {
  if (req.body && typeof req.body.data === "string") {
    try {
      return JSON.parse(req.body.data);
    } catch {
      throw new Error('Invalid JSON in "data" field');
    }
  }
  return req.body || {};
}

/** capture Cloudinary URL from either .single() or .fields() upload */
function extractCvUrl(req) {
  let f = null;
  if (req.file) f = req.file; // single('cvFile')
  if (!f && req.files && req.files.cvFile && req.files.cvFile[0]) {
    f = req.files.cvFile[0]; // fields([{ name:'cvFile' }])
  }
  if (!f) return null;

  // multer-storage-cloudinary usually sets .path to the final URL
  let cvUrl = f.path || f.secure_url || f.url || null;

  // Fallback: reconstruct a URL from public_id (filename) + format if needed
  if (!cvUrl && f.filename) {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    const fmt =
      f.format ||
      (f.mimetype === "application/pdf"
        ? "pdf"
        : f.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ? "docx"
        : (f.originalname && f.originalname.split(".").pop()) || "pdf");
    // Folder is fixed in the reviewer uploader: cv_reviewer_expression
    cvUrl = `https://res.cloudinary.com/${cloud}/raw/upload/cv_reviewer_expression/${f.filename}.${fmt}`;
  }
  return cvUrl;
}

/* ------------------------- controllers ------------------------- */

/**
 * POST /api/reviewer-expression
 * Public endpoint (multipart/form-data):
 *   - Either send individual text fields, OR a single text field `data` with JSON
 *   - File field: cvFile (pdf/docx) -> Cloudinary folder 'cv_reviewer_expression'
 */
export const createReviewerExpression = async (req, res) => {
  try {
    let body;
    try {
      body = extractBodyFromMultipart(req);
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message });
    }

    const {
      name,
      email,
      phone,
      currentJobTitle,
      institution,
      education,
      subjectArea,
      methodologicalExpertise,
      researchInterest,
      previousPeerReviewExperience,
      conflictOfInterest,
    } = body;

    if (!name || !currentJobTitle || !institution) {
      return res.status(400).json({
        success: false,
        message: "name, currentJobTitle and institution are required",
      });
    }

    const payload = {
      name,
      email,
      phone,
      currentJobTitle,
      institution,
      education: parseSmartArray(education),
      subjectArea: parseSmartArray(subjectArea),
      methodologicalExpertise: parseSmartArray(methodologicalExpertise),
      researchInterest: parseSmartArray(researchInterest),
      previousPeerReviewExperience: previousPeerReviewExperience || null,
      conflictOfInterest: conflictOfInterest || null,
      status: "PENDING",
      cvUrl: null,
    };

    // attach Cloudinary URL if a file was uploaded
    payload.cvUrl = extractCvUrl(req);

    const created = await prisma.ReviewerExpression.create({ data: payload });
    return res.status(201).json({
      success: true,
      message: "Reviewer expression submitted successfully",
      data: created,
    });
  } catch (error) {
    console.error("createReviewerExpression error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/reviewer-expression/:id
 * Super Admin only
 */
export const getReviewerExpressionById = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await prisma.ReviewerExpression.findUnique({ where: { id } });
    if (!row)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    console.error("getReviewerExpressionById error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PATCH /api/reviewer-expression/:id/status
 * Super Admin only
 * body: { status: "PENDING" | "ACCEPTED" | "REJECTED" }
 */
export const updateReviewerExpressionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "ACCEPTED", "REJECTED"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const updated = await prisma.ReviewerExpression.update({
      where: { id },
      data: { status },
    });

    return res.json({
      success: true,
      message: "Status updated",
      data: updated,
    });
  } catch (error) {
    console.error("updateReviewerExpressionStatus error:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Reviewer record not found" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * DELETE /api/reviewer-expression/:id
 * Super Admin only
 */
export const deleteReviewerExpression = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ReviewerExpression.delete({ where: { id } });
    return res.json({ success: true, message: "Reviewer record deleted" });
  } catch (error) {
    console.error("deleteReviewerExpression error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllFormFilled = async (req, res) => {
  try {
    const rows = await prisma.ReviewerExpression.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("getAllFormFilled error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/reviewer-expression
 * Super Admin only — list with optional ?status=PENDING|ACCEPTED|REJECTED&page=&limit=
 */
// export const listReviewerExpressions = async (req, res) => {
//   try {
//     const { status, page = 1, limit = 20 } = req.query;
//     const take = Math.min(parseInt(limit, 10) || 20, 100);
//     const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

//     const where = {};
//     if (status && ["PENDING", "ACCEPTED", "REJECTED"].includes(status)) {
//       where.status = status;
//     }

//     const [items, total] = await Promise.all([
//       prisma.ReviewerExpression.findMany({
//         where,
//         orderBy: { createdAt: "desc" },
//         skip,
//         take,
//       }),
//       prisma.ReviewerExpression.count({ where }),
//     ]);

//     return res.json({ success: true, data: items, total, page: Number(page), limit: take });
//   } catch (error) {
//     console.error("listReviewerExpressions error:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

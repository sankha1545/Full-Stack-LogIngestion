// backend/routes/contact.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Helper: map front-end free-text inquiry to InquiryType enum.
 * Add mappings for the exact options your front-end uses.
 */
function mapInquiryToEnum(inquiryText) {
  if (!inquiryText) return "OTHER";
  const s = inquiryText.toLowerCase();

  if (s.includes("pricing") || s.includes("price")) return "PRICING";
  if (s.includes("enterprise") || s.includes("sso") || s.includes("saml")) return "ENTERPRISE";
  if (s.includes("integrat") || s.includes("api")) return "INTEGRATIONS";
  if (s.includes("general") || s.includes("product information") || s.includes("general product")) return "GENERAL";
  // fallback
  return "OTHER";
}

function validatePayload(body) {
  const errors = {};
  if (!body.fullName || !body.fullName.trim()) errors.fullName = "fullName required";
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.email = "valid email required";
  // phone can be set via phoneDialCode + phoneLocal OR phoneFull
  if (!( (body.phoneDialCode && body.phoneLocal) || (body.phoneFull) )) errors.phone = "phone required (dial code + number or full string)";
  if (!body.company || !body.company.trim()) errors.company = "company required";
  if (!body.inquiry || !body.inquiry.trim()) errors.inquiry = "inquiry required";
  return errors;
}

/**
 * POST /api/contact
 * Accepts JSON payload aligned with frontend:
 * {
 *  fullName, email,
 *  phoneDialCode, phoneLocal, phoneFull,
 *  company, employees, inquiry,
 *  country, state, message, marketingOk, source
 * }
 */
router.post("/", async (req, res, next) => {
  try {
    const body = req.body || {};

    // Coerce some alternative shapes (frontend might send name)
    if (!body.fullName && (body.name || (body.firstName || body.lastName))) {
      if (body.name) body.fullName = body.name;
      else body.fullName = `${body.firstName || ""} ${body.lastName || ""}`.trim();
    }

    // If frontend sends phone combined string in `phone`, support that too.
    if (!body.phoneFull && body.phone) {
      body.phoneFull = body.phone;
    }

    // Validate
    const errors = validatePayload(body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: "validation_failed", details: errors });
    }

    // Map inquiry to enum
    const inquiryEnum = mapInquiryToEnum(body.inquiry);

    // Build create data
    const createData = {
      fullName: body.fullName,
      email: body.email,
      phoneDialCode: body.phoneDialCode || null,
      phoneLocal: body.phoneLocal || null,
      phoneFull: body.phoneFull || (body.phoneDialCode && body.phoneLocal ? `${body.phoneDialCode} ${body.phoneLocal}` : null),
      company: body.company,
      employees: body.employees || null,
      inquiry: inquiryEnum,
      country: body.country || null,
      state: body.state || null,
      message: body.message || null,
      marketingOk: !!body.marketingOk,
      source: body.source || "contact-sales-page",
      ref: body.ref || null,
      userId: body.userId || null,
    };

    const created = await prisma.contactRequest.create({
      data: createData,
    });

    // Return 201 with the created id as `ref`
    return res.status(201).json({ status: "ok", ref: created.id });
  } catch (err) {
    console.error("Contact POST error:", err);
    return next(err);
  }
});

// Optional: GET /api/contact/:id -> fetch a contact request
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const rec = await prisma.contactRequest.findUnique({
      where: { id },
    });
    if (!rec) return res.status(404).json({ error: "not_found" });
    return res.json(rec);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

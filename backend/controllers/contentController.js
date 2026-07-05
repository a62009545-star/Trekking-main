import { Contact, Gallery, FAQ } from '../models/index.js';
import cloudinary from '../utils/cloudinary.js';

// Helper: delete a gallery image from Cloudinary by its public_id.
// Errors are logged but not thrown — a failed cleanup shouldn't block the request.
const deleteGalleryFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`Failed to delete Cloudinary image ${publicId}:`, err.message);
  }
};

// ===================== CONTACT =====================

// POST /api/contact
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const contact = await Contact.create({ name, email, phone, subject, message });

    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', data: contact });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/contact (admin)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/contact/:id/read (admin)
export const markContactRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/contact/:id (admin)
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== GALLERY =====================

// GET /api/gallery (public)
export const getGalleryImages = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const images = await Gallery.find(filter).sort('-createdAt');
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/gallery (admin, multipart)
// req.files[].path = Cloudinary secure URL, req.files[].filename = Cloudinary public_id
export const uploadGalleryImagesHandler = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    const { category = 'Other', title } = req.body;

    const docs = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
      title,
      category,
    }));

    const created = await Gallery.insertMany(docs);

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/gallery/admin (admin) — includes inactive
export const getAllGalleryImagesAdmin = async (req, res) => {
  try {
    const images = await Gallery.find().sort('-createdAt');
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/gallery/:id (admin)
export const deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    await deleteGalleryFile(image.filename);
    await image.deleteOne();

    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== FAQ =====================

// GET /api/faq (public)
export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort('order');
    res.json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/faq (admin)
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, order, isActive } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'question and answer are required' });
    }

    const faq = await FAQ.create({ question, answer, order, isActive });
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/faq/:id (admin)
export const updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    res.json({ success: true, data: faq });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/faq/:id (admin)
export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
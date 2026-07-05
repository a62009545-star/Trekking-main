import Package from '../models/Package.js';
import cloudinary from '../utils/cloudinary.js';

// Helper: turn a title into a URL-safe slug
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Helper: parse JSON-string fields that arrive via multipart/form-data
const parseJSONFields = (body) => {
  const jsonFields = [
    'duration',
    'price',
    'location',
    'groupSize',
    'highlights',
    'included',
    'excluded',
    'itinerary',
    'bestSeason',
    'tags',
  ];

  const parsed = { ...body };

  jsonFields.forEach((field) => {
    if (parsed[field] && typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field]);
      } catch {
        // leave as-is if not valid JSON (e.g. plain string passed by mistake)
      }
    }
  });

  return parsed;
};

// Helper: build image objects from Cloudinary upload results.
// multer-storage-cloudinary populates file.path with the secure URL and
// file.filename with the Cloudinary public_id (needed later for deletion).
const buildImageObjects = (files) => {
  if (!files || files.length === 0) return [];
  return files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
};

// Helper: delete an image from Cloudinary by its public_id.
// Errors are logged but not thrown — a failed cleanup shouldn't block
// the package delete/update operation itself.
const deleteImageFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`Failed to delete Cloudinary image ${publicId}:`, err.message);
  }
};

// ---------- PUBLIC ----------

// GET /api/packages
export const getPackages = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      minPrice,
      maxPrice,
      featured,
      sort = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (featured === 'true') filter.isFeatured = true;

    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
    }

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const [packages, total] = await Promise.all([
      Package.find(filter).sort(sort).skip(skip).limit(limitNum),
      Package.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: packages,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/packages/:slug
export const getPackageBySlug = async (req, res) => {
  try {
    const pkg = await Package.findOne({ slug: req.params.slug, isActive: true });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, data: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- ADMIN ----------

// GET /api/packages/admin/all
export const getAllPackagesAdmin = async (req, res) => {
  try {
    const packages = await Package.find().sort('-createdAt');
    res.json({ success: true, data: packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/packages/admin/:id
export const getPackageByIdAdmin = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, data: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/packages
export const createPackage = async (req, res) => {
  try {
    const data = parseJSONFields(req.body);

    if (!data.slug && data.title) {
      data.slug = slugify(data.title);
    }

    data.images = buildImageObjects(req.files);

    const pkg = await Package.create(data);
    res.status(201).json({ success: true, data: pkg });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A package with this slug already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/packages/:id
export const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const data = parseJSONFields(req.body);

    if (data.title && !req.body.slug) {
      data.slug = slugify(data.title);
    }

    // Append any newly uploaded images to existing ones
    if (req.files && req.files.length > 0) {
      const newImages = buildImageObjects(req.files);
      data.images = [...pkg.images, ...newImages];
    }

    Object.assign(pkg, data);
    await pkg.save();

    res.json({ success: true, data: pkg });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A package with this slug already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/packages/:id
export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    // Clean up images from Cloudinary
    await Promise.all(pkg.images.map((img) => deleteImageFile(img.filename)));

    await pkg.deleteOne();
    res.json({ success: true, message: 'Package deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/packages/:id/image
export const deletePackageImage = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, message: 'filename is required' });
    }

    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    pkg.images = pkg.images.filter((img) => img.filename !== filename);
    await pkg.save();

    await deleteImageFile(filename);

    res.json({ success: true, data: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
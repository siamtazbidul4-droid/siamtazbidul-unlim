import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { CategoryModel } from '../../database/models/Category';
import { ProductModel } from '../../database/models/Product';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { requireDatabase } from '../../middleware/dbGuard';
import { logAuditActivity } from '../../utils/auditLogger';

export const categoriesRouter = Router();

// Apply requireDatabase to categories endpoints
categoriesRouter.use(requireDatabase);

// GET /api/categories
categoriesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.find().sort({ order: 1, name: 1 }).lean();

    // Dynamically update itemCount from live products
    const counts = await ProductModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    counts.forEach((c) => {
      countMap[c._id?.toLowerCase()] = c.count;
    });

    const enriched = categories.map((cat) => ({
      ...cat,
      liveCount: countMap[cat.name.toLowerCase()] || cat.itemCount,
    }));

    res.json({ success: true, categories: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/categories (Admin)
categoriesRouter.post(
  '/',
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const category = await CategoryModel.create(req.body);

      await logAuditActivity({
        action: 'CREATE_CATEGORY',
        module: 'Categories',
        actorName: req.user!.name,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        details: `Created new product category "${category.name}" (Slug: ${category.slug})`,
        recordId: category._id.toString(),
        ipAddress: req.ip || '127.0.0.1',
      });

      res.status(201).json({ success: true, category });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/categories/:id (Admin)
categoriesRouter.put(
  '/:id',
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = mongoose.Types.ObjectId.isValid(req.params.id)
        ? { _id: req.params.id }
        : { slug: req.params.id.toLowerCase() };

      const category = await CategoryModel.findOneAndUpdate(query, req.body, { new: true });
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

      await logAuditActivity({
        action: 'UPDATE_CATEGORY',
        module: 'Categories',
        actorName: req.user!.name,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        details: `Updated category "${category.name}"`,
        recordId: category._id.toString(),
        ipAddress: req.ip || '127.0.0.1',
      });

      res.json({ success: true, category });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/categories/:id (Admin with dependent products validation)
categoriesRouter.delete(
  '/:id',
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = mongoose.Types.ObjectId.isValid(req.params.id)
        ? { _id: req.params.id }
        : { slug: req.params.id.toLowerCase() };

      const category = await CategoryModel.findOne(query);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

      // Check dependent products
      const dependentCount = await ProductModel.countDocuments({
        $or: [{ category: category.name }, { category: category.slug }],
      });

      if (dependentCount > 0 && !req.query.force) {
        return res.status(400).json({
          success: false,
          code: 'DEPENDENT_PRODUCTS_EXIST',
          message: `Cannot delete category "${category.name}" because it has ${dependentCount} associated product(s). Please reassign or delete those products first.`,
        });
      }

      await CategoryModel.findByIdAndDelete(category._id);

      await logAuditActivity({
        action: 'DELETE_CATEGORY',
        module: 'Categories',
        actorName: req.user!.name,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        details: `Deleted category "${category.name}" (Slug: ${category.slug})`,
        recordId: category._id.toString(),
        ipAddress: req.ip || '127.0.0.1',
      });

      res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

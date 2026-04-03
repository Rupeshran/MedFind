const SearchLog = require('../models/SearchLog');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');

// @GET /api/demand/trending
exports.getTrending = async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    // Trending from search logs
    const searchTrends = await SearchLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$query', count: { $sum: 1 }, lastSearched: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ]);

    // Top searched medicines from the Medicine model
    const topMedicines = await Medicine.find({ isActive: true })
      .sort({ searchCount: -1 })
      .limit(parseInt(limit))
      .select('name brand composition dosageForm strength searchCount category')
      .populate('category', 'name icon');

    // Daily search volume (last 7 days)
    const dailyVolume = await SearchLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          uniqueQueries: { $addToSet: '$query' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          totalSearches: '$count',
          uniqueQueries: { $size: '$uniqueQueries' },
          _id: 0,
        },
      },
    ]);

    // Category-wise demand
    const categoryDemand = await Medicine.aggregate([
      { $match: { isActive: true, searchCount: { $gt: 0 } } },
      { $group: { _id: '$category', totalSearches: { $sum: '$searchCount' }, medicineCount: { $sum: 1 } } },
      { $sort: { totalSearches: -1 } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          category: { $ifNull: ['$category.name', 'Uncategorized'] },
          icon: { $ifNull: ['$category.icon', '💊'] },
          totalSearches: 1,
          medicineCount: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        searchTrends,
        topMedicines,
        dailyVolume,
        categoryDemand,
      },
    });
  } catch (err) {
    console.error('Demand trending error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/demand/predictions
exports.getPredictions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get search trends for the last 30 days vs previous 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    const recentTrends = await SearchLog.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$query', recentCount: { $sum: 1 } } },
    ]);

    const olderTrends = await SearchLog.aggregate([
      { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      { $group: { _id: '$query', olderCount: { $sum: 1 } } },
    ]);

    // Merge and calculate growth
    const olderMap = {};
    olderTrends.forEach(t => { olderMap[t._id] = t.olderCount; });

    const predictions = recentTrends
      .map(t => {
        const older = olderMap[t._id] || 0;
        const growth = older > 0 ? ((t.recentCount - older) / older * 100) : (t.recentCount > 2 ? 100 : 0);
        return {
          query: t._id,
          recentSearches: t.recentCount,
          previousSearches: older,
          growthPercent: Math.round(growth),
          trend: growth > 20 ? 'rising' : growth > -10 ? 'stable' : 'declining',
          predicted: growth > 20 ? 'high_demand' : growth > -10 ? 'normal' : 'low_demand',
        };
      })
      .filter(p => p.recentSearches > 1)
      .sort((a, b) => b.growthPercent - a.growthPercent)
      .slice(0, parseInt(limit));

    // Seasonal predictions based on common patterns
    const month = now.getMonth();
    const seasonalPredictions = [];
    if (month >= 5 && month <= 8) { // Monsoon (Jun-Sep)
      seasonalPredictions.push(
        { medicine: 'Paracetamol', reason: 'Monsoon fever season', expectedDemand: 'high' },
        { medicine: 'Cetirizine', reason: 'Seasonal allergies', expectedDemand: 'high' },
        { medicine: 'Loperamide', reason: 'Waterborne infections', expectedDemand: 'moderate' },
        { medicine: 'ORS', reason: 'Dehydration from infections', expectedDemand: 'high' },
      );
    } else if (month >= 10 || month <= 1) { // Winter (Nov-Feb)
      seasonalPredictions.push(
        { medicine: 'Vitamin D3', reason: 'Less sunlight exposure', expectedDemand: 'high' },
        { medicine: 'Cetirizine', reason: 'Cold and flu season', expectedDemand: 'moderate' },
        { medicine: 'Ambroxol', reason: 'Cough season', expectedDemand: 'high' },
        { medicine: 'Vitamin C', reason: 'Immunity boost', expectedDemand: 'moderate' },
      );
    } else { // Spring/Summer
      seasonalPredictions.push(
        { medicine: 'ORS', reason: 'Heat and dehydration', expectedDemand: 'high' },
        { medicine: 'Sunscreen', reason: 'Sun exposure', expectedDemand: 'moderate' },
        { medicine: 'Cetirizine', reason: 'Pollen allergies', expectedDemand: 'moderate' },
      );
    }

    res.json({
      success: true,
      data: {
        predictions,
        seasonalPredictions,
        analysisWindow: { from: thirtyDaysAgo, to: now },
      },
    });
  } catch (err) {
    console.error('Demand prediction error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

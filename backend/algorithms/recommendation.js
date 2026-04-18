import { db } from "../config/db.js";

export const getBikeRecommendations = (userId, callback) => {
  // Step 1: Get favourite bike types
  const favQuery = `
    SELECT b.type, COUNT(*) as fav_count
    FROM favourites f JOIN bikes b ON f.bike_id = b.id
    WHERE f.user_id = ?
    GROUP BY b.type ORDER BY fav_count DESC
  `;

  db.query(favQuery, [userId], (err, favTypes) => {
    if (err) return callback(err, null);

    // Step 2: Get rental history types
    const historyQuery = `
      SELECT b.type, COUNT(*) as frequency
      FROM rentals r JOIN bikes b ON r.bike_id = b.id
      WHERE r.user_id = ? AND r.status IN ('returned', 'confirmed')
      GROUP BY b.type ORDER BY frequency DESC
    `;

    db.query(historyQuery, [userId], (err, historyTypes) => {
      if (err) return callback(err, null);

      // Merge favourite types + rental history types (favourites first, higher weight)
      const typeScores = {};
      favTypes.forEach(f => { typeScores[f.type] = (typeScores[f.type] || 0) + f.fav_count * 2; });
      historyTypes.forEach(h => { typeScores[h.type] = (typeScores[h.type] || 0) + h.frequency; });

      const preferredTypes = Object.keys(typeScores);

      if (preferredTypes.length === 0) {
        // New user with no history and no favourites — show popular bikes
        const popularQuery = `
          SELECT b.*, COUNT(r.id) as rental_count,
                 CASE
                   WHEN b.type LIKE '%Electric%' THEN 1.2
                   WHEN b.type LIKE '%Hybrid%' THEN 1.1
                   ELSE 1.0
                 END as boost_factor
          FROM bikes b
          LEFT JOIN rentals r ON b.id = r.bike_id
          WHERE b.available = true
          GROUP BY b.id
          ORDER BY (rental_count * boost_factor) DESC
          LIMIT 8
        `;
        return db.query(popularQuery, callback);
      }

      // Get favourite bike IDs to show them first
      const favBikeQuery = `SELECT bike_id FROM favourites WHERE user_id = ?`;
      db.query(favBikeQuery, [userId], (err, favBikes) => {
        if (err) return callback(err, null);

        const favBikeIds = favBikes.map(f => f.bike_id);
        const typeList = preferredTypes.map(t => `'${t}'`).join(',');

        // Recommend bikes matching preferred types, favourited bikes appear first
        const recommendQuery = `
          SELECT b.*, COUNT(r.id) as rental_count,
                 CASE WHEN f.bike_id IS NOT NULL THEN 1 ELSE 0 END as is_favourite
          FROM bikes b
          LEFT JOIN rentals r ON b.id = r.bike_id
          LEFT JOIN favourites f ON b.id = f.bike_id AND f.user_id = ?
          WHERE b.available = true AND b.type IN (${typeList})
          GROUP BY b.id
          ORDER BY is_favourite DESC, rental_count DESC
          LIMIT 8
        `;

        db.query(recommendQuery, [userId], callback);
      });
    });
  });
};

export const calculateDynamicPrice = (basePrice, demand, seasonality = 1, userTier = 'regular') => {
  const demandMultiplier = 1 + (demand * 0.1);
  const tierDiscount = userTier === 'premium' ? 0.9 : userTier === 'frequent' ? 0.95 : 1.0;
  return Math.round(basePrice * demandMultiplier * seasonality * tierDiscount * 100) / 100;
};

export const optimizeAvailability = (startDate, endDate, callback) => {
  const query = `
    SELECT bike_id, COUNT(*) as conflicts
    FROM rentals
    WHERE status IN ('pending', 'confirmed')
    AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))
    GROUP BY bike_id
  `;
  db.query(query, [startDate, startDate, endDate, endDate], callback);
};

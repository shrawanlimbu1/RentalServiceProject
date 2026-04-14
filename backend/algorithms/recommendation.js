import { db } from "../config/db.js";

// Enhanced recommendation algorithm with favorites
export const getBikeRecommendations = (userId, callback) => {
  // Get user's rental history
  const userHistoryQuery = `
    SELECT DISTINCT b.type, COUNT(*) as frequency
    FROM rentals r
    JOIN bikes b ON r.bike_id = b.id
    WHERE r.user_id = ? AND r.status IN ('returned', 'confirmed')
    GROUP BY b.type
    ORDER BY frequency DESC
  `;
  
  db.query(userHistoryQuery, [userId], (err, userPreferences) => {
    if (err) return callback(err, null);
    
    if (userPreferences.length === 0) {
      // New user - recommend popular bikes with variety
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
      db.query(popularQuery, callback);
    } else {
      // Recommend based on user preferences
      const preferredTypes = userPreferences.map(p => `'${p.type}'`).join(',');
      const recommendQuery = `
        SELECT b.*, COUNT(r.id) as rental_count
        FROM bikes b
        LEFT JOIN rentals r ON b.id = r.bike_id
        WHERE b.available = true AND b.type IN (${preferredTypes})
        GROUP BY b.id
        ORDER BY rental_count DESC
        LIMIT 8
      `;
      db.query(recommendQuery, callback);
    }
  });
};

// Dynamic pricing algorithm with user preference consideration
export const calculateDynamicPrice = (basePrice, demand, seasonality = 1, userTier = 'regular') => {
  const demandMultiplier = 1 + (demand * 0.1);
  const tierDiscount = userTier === 'premium' ? 0.9 : userTier === 'frequent' ? 0.95 : 1.0;
  const finalPrice = basePrice * demandMultiplier * seasonality * tierDiscount;
  return Math.round(finalPrice * 100) / 100;
};

// Availability optimization
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
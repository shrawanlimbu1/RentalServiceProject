import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const useFavourites = (user) => {
  const [favouriteIds, setFavouriteIds] = useState(new Set());

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:5000/api/favourites/${user.id}`)
        .then(res => setFavouriteIds(new Set(res.data.map(f => f.bike_id))))
        .catch(() => {});
    }
  }, [user]);

  const toggleFavourite = async (bikeId, e) => {
    if (e) e.stopPropagation();
    if (!user) { toast.error('Please login to save favourites'); return; }

    const isFav = favouriteIds.has(bikeId);
    try {
      if (isFav) {
        await axios.delete('http://localhost:5000/api/favourites', { data: { user_id: user.id, bike_id: bikeId } });
        setFavouriteIds(prev => { const s = new Set(prev); s.delete(bikeId); return s; });
        toast.success('Removed from favourites');
      } else {
        await axios.post('http://localhost:5000/api/favourites', { user_id: user.id, bike_id: bikeId });
        setFavouriteIds(prev => new Set([...prev, bikeId]));
        toast.success('Added to favourites');
      }
    } catch {
      toast.error('Failed to update favourites');
    }
  };

  return { favouriteIds, toggleFavourite };
};

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/bikes';

export const getAllBikes = () => axios.get(API_URL);
export const addBike = (bikeData) => axios.post(API_URL, bikeData);
export const updateBike = (id, bikeData) => axios.put(`${API_URL}/${id}`, bikeData);
export const deleteBike = (id) => axios.delete(`${API_URL}/${id}`);

// File này sẽ được tạo trong backend

const axios = require('axios');

// Địa chỉ Flask server
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';

// Hàm gọi API predict
const predictDisease = async (imagePath) => {
  try {
    const formData = new FormData();
    const fileBuffer = require('fs').readFileSync(imagePath);
    formData.append('image', fileBuffer, 'image.jpg');
    
    const response = await axios.post(
      `${ML_API_URL}/api/predict`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Lỗi gọi ML API:', error.message);
    throw error;
  }
};

module.exports = {
  predictDisease,
  ML_API_URL
};

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Lấy URL MongoDB từ biến môi trường
    const mongoURL = process.env.MONGO_URI || 'mongodb+srv://root:123@cluster0.fxgs6dj.mongodb.net/vuon-cay-db?appName=Cluster0';
    
    // Kết nối MongoDB
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✓ Kết nối MongoDB thành công!');
    console.log(`Database: ${mongoURL}`);
  } catch (error) {
    console.error('✗ Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};

// Xử lý ngắt kết nối
mongoose.connection.on('disconnected', () => {
  console.log('⚠ Ngắt kết nối từ MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('✗ Lỗi MongoDB:', error.message);
});

module.exports = connectDB;

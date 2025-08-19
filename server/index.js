// index.js
import app from './src/app.js';
import listEndpoints from 'express-list-endpoints';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
  // In endpoints để chắc chắn đã mount
  console.log(JSON.stringify(listEndpoints(app), null, 2));
});

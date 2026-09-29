require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Fleet Studio Git-Diff Backend Server Running   `);
  console.log(` Port:    http://localhost:${PORT}             `);
  console.log(` Health:  http://localhost:${PORT}/health      `);
  console.log(`===============================================`);
});

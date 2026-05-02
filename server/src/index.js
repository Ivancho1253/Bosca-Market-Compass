require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const app = require('./app');

const PORT = process.env.SERVER_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Luigi Bosca MIS API running on http://localhost:${PORT}`);
});

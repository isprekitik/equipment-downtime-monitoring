import express from 'express';
import cors from 'cors';

import equipmentRoutes from './equipment.js';
import dashboardRoutes from './dashboard.js';


const app = express();


app.use(cors());

app.use(express.json());


app.get('/', (req, res) => {
  res.json({
    message:
      'Equipment Downtime Monitoring API running',
  });
});


app.use(
  '/api/equipment',
  equipmentRoutes
);


app.use(
  '/api/dashboard',
  dashboardRoutes
);


const PORT =
  process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(
    `Server running at http://localhost:${PORT}`
  );
});
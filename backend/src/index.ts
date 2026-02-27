import express from 'express';
import cors from 'cors';
import { reasonsRouter } from './routes/reasons.js';
import { fieldsRouter } from './routes/fields.js';
import { evaluateRouter } from './routes/evaluate.js';
import { ordersRouter } from './routes/orders.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/reasons', reasonsRouter);
app.use('/api/condition-fields', fieldsRouter);
app.use('/api/conditions/evaluate', evaluateRouter);
app.use('/api/orders', ordersRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});

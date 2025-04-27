import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import userRoutes from './routes/user.routes';
import expenseRoutes from './routes/expense.routes';
import budgetRoutes from './routes/budget.routes';
import analyticsRoutes from "./routes/analytics.routes";
import transactionRoutes from "./routes/transaction.routes";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/transactions", transactionRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
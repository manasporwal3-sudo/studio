import { config } from 'dotenv';
config();

import '@/ai/flows/recommend-restock-orders-flow.ts';
import '@/ai/flows/predict-demand-flow.ts';
import '@/ai/flows/generate-dashboard-insights-flow.ts';
import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import empleadosRoutes from './routes/empleados.routes.js';
import horariosRoutes from './routes/horarios.routes.js';
import marcacionesRoutes from './routes/marcaciones.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true, name: 'Control Asistencia API' }));

app.use('/api/auth', authRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/marcaciones', marcacionesRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API escuchando en http://localhost:${port}`));

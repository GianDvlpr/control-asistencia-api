import { Router } from 'express';
import { getPool, sql } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth(), async (_req, res) => {
    try {
        const pool = await getPool();
        const rs = await pool.request().execute('sp_Horario_Listar');
        res.json(rs.recordset);
    } catch (e) {
        res.status(500).json({ message: 'Error listando horarios', error: e.message });
    }
});

router.post('/', auth(), async (req, res) => {
    try {
        const { descripcion, hora_entrada, hora_salida, tolerancia_min } = req.body;
        const pool = await getPool();
        const rs = await pool.request()
            .input('descripcion', sql.VarChar(100), descripcion)
            .input('hora_entrada', sql.Time, hora_entrada)
            .input('hora_salida', sql.Time, hora_salida)
            .input('tolerancia_min', sql.Int, tolerancia_min ?? 10)
            .execute('sp_Horario_Crear');
        res.status(201).json({ id_horario: rs.recordset[0].id_horario });
    } catch (e) {
        res.status(500).json({ message: 'Error creando horario', error: e.message });
    }
});

export default router;

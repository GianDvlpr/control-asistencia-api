import { Router } from 'express';
import { getPool, sql } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth(), async (_req, res) => {
    try {
        const pool = await getPool();
        const rs = await pool.request().execute('sp_Empleado_Listar');
        res.json(rs.recordset);
    } catch (e) {
        res.status(500).json({ message: 'Error listando empleados', error: e.message });
    }
});

router.get('/:id', auth(), async (req, res) => {
    try {
        const pool = await getPool();
        const rs = await pool.request()
            .input('id_empleado', sql.Int, req.params.id)
            .execute('sp_Empleado_PorId');
        if (rs.recordset.length === 0) return res.status(404).json({ message: 'No encontrado' });
        res.json(rs.recordset[0]);
    } catch (e) {
        res.status(500).json({ message: 'Error obteniendo empleado', error: e.message });
    }
});

router.post('/', auth(), async (req, res) => {
    try {
        const { nombres, apellidos, dni, cargo, area, fecha_ingreso } = req.body;
        const pool = await getPool();
        const rs = await pool.request()
            .input('nombres', sql.VarChar(100), nombres)
            .input('apellidos', sql.VarChar(100), apellidos)
            .input('dni', sql.Char(8), dni)
            .input('cargo', sql.VarChar(80), cargo)
            .input('area', sql.VarChar(80), area)
            .input('fecha_ingreso', sql.Date, fecha_ingreso)
            .execute('sp_Empleado_Crear');
        res.status(201).json({ id_empleado: rs.recordset[0].id_empleado });
    } catch (e) {
        res.status(500).json({ message: 'Error creando empleado', error: e.message });
    }
});

export default router;

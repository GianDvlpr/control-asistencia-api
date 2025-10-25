import { Router } from 'express';
import { getPool, sql } from '../db.js';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { usuario, clave } = req.body;
        if (!usuario || !clave) return res.status(400).json({ message: 'usuario y clave requeridos' });

        const pool = await getPool();
        const result = await pool.request()
            .input('usuario', sql.VarChar(50), usuario)
            .input('clave_plain', sql.VarChar(200), clave)
            .execute('sp_LoginUsuario');

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result.recordset[0];
        const token = jwt.sign({
            sub: user.id_usuario,
            usuario: user.usuario,
            rol: user.rol
        }, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({ token, usuario: user.usuario, rol: user.rol });
    } catch (e) {
        res.status(500).json({ message: 'Error en login', error: e.message });
    }
});

export default router;

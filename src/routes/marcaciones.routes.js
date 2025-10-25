import { Router } from "express";
import { getPool, sql } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth(), async (req, res) => {
  try {
    const { id_empleado, desde, hasta } = req.query;
    if (!desde || !hasta)
      return res
        .status(400)
        .json({ message: "desde y hasta son requeridos (YYYY-MM-DD)" });

    const pool = await getPool();
    const rs = await pool
      .request()
      .input(
        "id_empleado",
        id_empleado ? sql.Int : sql.Int,
        id_empleado ?? null
      )
      .input("desde", sql.Date, desde)
      .input("hasta", sql.Date, hasta)
      .execute("sp_Marcacion_ListarPorRango");

    res.json(rs.recordset);
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error listando marcaciones", error: e.message });
  }
});

router.post("/", auth(), async (req, res) => {
  try {
    const {
      id_empleado,
      id_horario,
      fecha_marcacion,
      hora_entrada,
      hora_salida,
      observacion,
    } = req.body;

    const normalizeTime = (t) => (t && /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t);

    const pool = await getPool();
    const rs = await pool
      .request()
      .input("id_empleado", sql.Int, id_empleado)
      .input("id_horario", sql.Int, id_horario ?? null)
      .input("fecha_marcacion", sql.Date, fecha_marcacion)
      .input("hora_entrada", sql.Time, normalizeTime(hora_entrada) ?? null)
      .input("hora_salida", sql.Time, normalizeTime(hora_salida) ?? null)
      .input("observacion", sql.VarChar(200), observacion ?? null)
      .execute("sp_Marcacion_Registrar");

    res.status(201).json({ id_marcacion: rs.recordset[0].id_marcacion });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error registrando marcación", error: e.message });
  }
});

router.post('/', auth(), async (req, res) => {
  try {
    const {
      id_empleado,
      id_horario,
      fecha_marcacion,
      hora_entrada,
      hora_salida,
      observacion
    } = req.body;

    // 🔧 normaliza hora → 'HH:mm:ss' o null
    const parseHora = (t) => {
      if (!t) return null;
      if (typeof t !== 'string') return null;
      // Si viene HH:mm, agrega :00
      if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
      // Si viene HH:mm:ss, devuélvelo igual
      if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
      return null; // cualquier otro formato => null
    };

    const hEntrada = parseHora(hora_entrada);
    const hSalida  = parseHora(hora_salida);

    const pool = await getPool();
    const rs = await pool.request()
      .input('id_empleado', sql.Int, id_empleado)
      .input('id_horario', sql.Int, id_horario ?? null)
      .input('fecha_marcacion', sql.Date, fecha_marcacion)
      // ⚠️ usa solo si el valor es válido; si no, pásalo como null
      .input('hora_entrada', sql.Time, hEntrada)
      .input('hora_salida', sql.Time, hSalida)
      .input('observacion', sql.VarChar(200), observacion ?? null)
      .execute('sp_Marcacion_Registrar');

    res.status(201).json({ id_marcacion: rs.recordset[0]?.id_marcacion });
  } catch (e) {
    console.error('❌ error en POST /api/marcaciones:', e);
    res.status(500).json({
      message: 'Error registrando marcación',
      error: e.message
    });
  }
});

router.patch("/:id/salida", auth(), async (req, res) => {
  try {
    const { hora_salida, observacion } = req.body;
    const pool = await getPool();
    const rs = await pool
      .request()
      .input("id_marcacion", sql.Int, req.params.id)
      .input("hora_salida", sql.Time, hora_salida)
      .input("observacion", sql.VarChar(200), observacion ?? null)
      .execute("sp_Marcacion_ActualizarSalida");

    if (rs.recordset.length === 0)
      return res.status(404).json({ message: "No encontrado" });
    res.json(rs.recordset[0]);
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error actualizando salida", error: e.message });
  }
});

export default router;

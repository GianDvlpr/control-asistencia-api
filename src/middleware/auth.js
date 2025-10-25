import jwt from 'jsonwebtoken';

export function auth(required = true) {
    return (req, res, next) => {
        const hdr = req.headers.authorization || '';
        const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;

        if (!token) {
            if (!required) return next();
            return res.status(401).json({ message: 'No autorizado' });
        }

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = payload;
            next();
        } catch {
            return res.status(401).json({ message: 'Token inválido' });
        }
    };
}

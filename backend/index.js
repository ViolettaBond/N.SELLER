import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '1234',
    port: 5432,
});

pool.connect()
    .then(() => console.log('DB connected'))
    .catch((err) => console.error('DB connection error:', err));

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Нет токена' });

    try {
        const decoded = jwt.verify(token, 'SECRET_KEY');
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Неверный токен' });
    }
}
function requireAdminOrSeller(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Не авторизован' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'seller') {
        return res.status(403).json({
            error: 'Доступ запрещен. Только администраторы и продавцы могут выполнять это действие',
        });
    }

    next();
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Требуются права администратора' });
    }
    next();
}

app.get('/api/tariffs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tariffs ORDER BY id');
        res.json(result.rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'database error' });
    }
});

// app.get('/api/car', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT * FROM car ORDER BY id');
//         res.json(result.rows);
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ error: 'database error' });
//     }
// });

app.get('/api/car', async (req, res) => {
    const { queryName, proizvoditel } = req.query;

    try {
        if (queryName === 'proizvoditel_filter') {
            const selected = proizvoditel ? proizvoditel.split(',') : [];

            if (selected.length === 0) {
                const allItems = await pool.query('SELECT * FROM car ORDER BY id');
                return res.json(allItems.rows);
            }

            const filteredItems = await pool.query(
                'SELECT * FROM car WHERE proizvoditel = ANY($1::text[]) ORDER BY id',
                [selected]
            );

            return res.json(filteredItems.rows);
        }

        const allItems = await pool.query('SELECT * FROM car ORDER BY id');
        res.json(allItems.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/car/:id', authMiddleware, requireAdminOrSeller, async (req, res) => {
    try {
        const { id } = req.params;

        const checkExist = await pool.query('SELECT * FROM car WHERE id = $1', [id]);

        if (checkExist.rows.length === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }

        const car = checkExist.rows[0];

        if (req.user.role !== 'admin') {
            if (car.seller_id !== req.user.id) {
                return res.status(403).json({
                    error: 'Вы можете удалять только свои машины',
                });
            }
        }

        await pool.query('DELETE FROM car WHERE id = $1', [id]);
        res.json({ message: 'Car deleted successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/registration_seller', async (req, res) => {
    try {
        const {
            email,
            password,
            name_company,
            country,
            city,
            adress,
            pocht_index,
            work_number,
            web_site,
            initials,
            number,
            role,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email и пароль обязательны',
            });
        }

        const allowedRoles = ['seller', 'admin', 'buyer'];
        const userRole = role && allowedRoles.includes(role) ? role : 'seller';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO registration_seller (
                email,
                password,
                name_company,
                country,
                city,
                adress,
                pocht_index,
                work_number,
                web_site,
                initials,
                number,
                role
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING id, email, role
        `;

        const values = [
            email,
            hashedPassword,
            name_company,
            country,
            city,
            adress,
            pocht_index,
            work_number,
            web_site,
            initials,
            number,
            userRole,
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Регистрация успешна',
            user: result.rows[0],
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);

        if (error.code === '23505') {
            return res.status(400).json({
                error: 'Пользователь с таким email уже существует',
            });
        }

        res.status(500).json({
            error: 'Ошибка сервера при регистрации',
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }

        const userResult = await pool.query('SELECT * FROM registration_seller WHERE email = $1', [
            email,
        ]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Пользователь не найден' });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Неверный пароль' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'SECRET_KEY', {
            expiresIn: '24h',
        });

        res.json({
            message: 'Успешный вход',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/update_profile', authMiddleware, async (req, res) => {
    try {
        const { newEmail, newPassword } = req.body;
        const userId = req.user.id;

        const updates = [];
        const values = [];
        let idx = 1;

        if (newEmail) {
            updates.push(`email = $${idx}`);
            values.push(newEmail);
            idx++;
        }

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updates.push(`password = $${idx}`);
            values.push(hashedPassword);
            idx++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Нет данных для обновления' });
        }

        values.push(userId);

        const query = `
            UPDATE registration_seller
            SET ${updates.join(', ')}
            WHERE id = $${idx}
            RETURNING id, email
        `;

        const result = await pool.query(query, values);

        res.json({ message: 'Данные обновлены', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера при обновлении' });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));

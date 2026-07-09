import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { store } from '../db/store.js';
export async function authRoutes(app) {
    // Register
    app.post('/register', async (request, reply) => {
        const { email, password, name } = request.body;
        if (!email || !password || !name) {
            return reply.status(400).send({ error: '请填写所有必填字段' });
        }
        if (store.users.has(email)) {
            return reply.status(409).send({ error: '该邮箱已注册' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = {
            id: randomUUID(),
            email,
            name,
            passwordHash,
            subscriptionTier: 'free',
            createdAt: new Date().toISOString(),
        };
        store.users.set(email, user);
        const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');
        return {
            token,
            user: { id: user.id, email: user.email, name: user.name, subscriptionTier: user.subscriptionTier },
        };
    });
    // Login
    app.post('/login', async (request, reply) => {
        const { email, password } = request.body;
        if (!email || !password) {
            return reply.status(400).send({ error: '请填写邮箱和密码' });
        }
        const user = store.users.get(email);
        if (!user) {
            return reply.status(401).send({ error: '邮箱或密码错误' });
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return reply.status(401).send({ error: '邮箱或密码错误' });
        }
        const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');
        return {
            token,
            user: { id: user.id, email: user.email, name: user.name, subscriptionTier: user.subscriptionTier },
        };
    });
    // Get current user
    app.get('/me', async (request, reply) => {
        const auth = request.headers.authorization;
        if (!auth)
            return reply.status(401).send({ error: '未登录' });
        try {
            const payload = JSON.parse(Buffer.from(auth.replace('Bearer ', ''), 'base64').toString());
            const user = Array.from(store.users.values()).find(u => u.id === payload.userId);
            if (!user)
                return reply.status(401).send({ error: '用户不存在' });
            return { id: user.id, email: user.email, name: user.name, subscriptionTier: user.subscriptionTier };
        }
        catch {
            return reply.status(401).send({ error: '无效的认证信息' });
        }
    });
}
//# sourceMappingURL=auth.js.map
import { store } from '../db/store.js';
import { randomUUID } from 'crypto';
export async function subscriptionRoutes(app) {
    // Get pricing plans
    app.get('/plans', async () => {
        return {
            plans: [
                {
                    id: 'free',
                    name: '免费版',
                    price: 0,
                    period: 'free',
                    features: [
                        'Python 初级篇全部内容',
                        '基础代码编辑器 + 运行',
                        '每日限 10 次代码运行',
                    ],
                    highlighted: false,
                },
                {
                    id: 'pro_monthly',
                    name: 'Pro 月付',
                    price: 29.9,
                    period: 'month',
                    features: [
                        '全部课程内容',
                        '无限制代码运行',
                        'AI 学习助手（限量 50 次/月）',
                        '代码挑战',
                    ],
                    highlighted: true,
                },
                {
                    id: 'pro_yearly',
                    name: 'Pro 年付',
                    price: 299,
                    period: 'year',
                    originalPrice: 358.8,
                    features: [
                        '全部月付权益',
                        'AI 学习助手无限制',
                        '专属社区身份',
                        '赠送 2 门精品小课',
                    ],
                    highlighted: false,
                },
                {
                    id: 'lifetime',
                    name: '终身会员',
                    price: 999,
                    period: 'lifetime',
                    features: [
                        '年付全部权益',
                        '未来所有内容更新免费',
                        '数字证书免费发放',
                    ],
                    highlighted: false,
                },
            ],
        };
    });
    // Create subscription
    app.post('/create', async (request, reply) => {
        const { planId, provider } = request.body;
        const auth = request.headers.authorization;
        if (!auth)
            return reply.status(401).send({ error: '请先登录' });
        try {
            const payload = JSON.parse(Buffer.from(auth.replace('Bearer ', ''), 'base64').toString());
            const user = Array.from(store.users.values()).find(u => u.id === payload.userId);
            if (!user)
                return reply.status(401).send({ error: '用户不存在' });
            const validPlans = ['pro_monthly', 'pro_yearly', 'lifetime'];
            if (!validPlans.includes(planId)) {
                return reply.status(400).send({ error: '无效的订阅方案' });
            }
            const now = new Date();
            let endsAt = new Date(now);
            if (planId === 'pro_monthly')
                endsAt.setMonth(endsAt.getMonth() + 1);
            else if (planId === 'pro_yearly')
                endsAt.setFullYear(endsAt.getFullYear() + 1);
            else if (planId === 'lifetime')
                endsAt.setFullYear(endsAt.getFullYear() + 100);
            const subscription = {
                id: randomUUID(),
                userId: user.id,
                tier: planId,
                status: 'active',
                startedAt: now.toISOString(),
                endsAt: endsAt.toISOString(),
                provider: provider || 'stripe',
            };
            store.subscriptions.set(subscription.id, subscription);
            user.subscriptionTier = planId;
            user.subscriptionEndsAt = endsAt.toISOString();
            return {
                success: true,
                subscription,
                message: planId === 'lifetime'
                    ? '🎉 感谢成为终身会员！'
                    : '🎉 订阅成功！尽情学习吧！',
            };
        }
        catch {
            return reply.status(401).send({ error: '认证失败' });
        }
    });
    // Get user subscription
    app.get('/my', async (request, reply) => {
        const auth = request.headers.authorization;
        if (!auth)
            return reply.status(401).send({ error: '请先登录' });
        try {
            const payload = JSON.parse(Buffer.from(auth.replace('Bearer ', ''), 'base64').toString());
            const userSubscriptions = Array.from(store.subscriptions.values())
                .filter(s => s.userId === payload.userId);
            return { subscriptions: userSubscriptions };
        }
        catch {
            return reply.status(401).send({ error: '认证失败' });
        }
    });
}
//# sourceMappingURL=subscriptions.js.map
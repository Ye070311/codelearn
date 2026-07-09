import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { AuthModal } from '../components/AuthModal'

interface Plan {
  id: string
  name: string
  price: number
  period: string
  originalPrice?: number
  features: string[]
  highlighted: boolean
}

export function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [message, setMessage] = useState('')
  const { user, token } = useAuthStore()

  useEffect(() => {
    api.getPlans().then(d => setPlans(d.plans)).catch(console.error)
  }, [])

  const handleSubscribe = async (planId: string) => {
    if (!token) {
      setSelectedPlan(planId)
      setShowAuth(true)
      return
    }
    if (planId === 'free') return

    setSubscribing(true)
    setMessage('')
    try {
      const data = await api.createSubscription(planId, 'stripe')
      setMessage(data.message)
    } catch (err: any) {
      setMessage(err.message || '订阅失败')
    } finally {
      setSubscribing(false)
    }
  }

  const handleAuthClose = () => {
    setShowAuth(false)
    if (selectedPlan && useAuthStore.getState().token) {
      handleSubscribe(selectedPlan)
    }
  }

  const currentTier = user?.subscriptionTier || 'free'

  return (
    <div className="page pricing-page">
      <div className="pricing-header">
        <h1>选择适合你的学习方案</h1>
        <p>从零基础到编程高手，开启你的学习之旅</p>
      </div>

      <div className="plans-grid">
        {plans.map(plan => {
          const isCurrent = currentTier === plan.id
          return (
            <div
              key={plan.id}
              className={`plan-card ${plan.highlighted ? 'highlighted' : ''} ${isCurrent ? 'current' : ''}`}
            >
              {plan.highlighted && <div className="plan-badge">最受欢迎</div>}

              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                {plan.price === 0 ? (
                  <span className="price-free">免费</span>
                ) : (
                  <>
                    <span className="price-symbol">¥</span>
                    <span className="price-amount">{plan.price}</span>
                    <span className="price-period">
                      {plan.period === 'month' ? '/月' : plan.period === 'year' ? '/年' : ''}
                    </span>
                  </>
                )}
              </div>
              {plan.originalPrice && (
                <div className="plan-original-price">
                  原价 ¥{plan.originalPrice}/年 <span className="save-tag">省 ¥{Math.round(plan.originalPrice - plan.price)}</span>
                </div>
              )}

              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i} className="plan-feature">✓ {f}</li>
                ))}
              </ul>

              <button
                className={`btn plan-btn ${plan.highlighted ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleSubscribe(plan.id)}
                disabled={subscribing || isCurrent}
              >
                {isCurrent ? '当前方案' : plan.price === 0 ? '免费使用' : plan.period === 'lifetime' ? '立即购买' : '订阅'}
              </button>
            </div>
          )
        })}
      </div>

      {message && (
        <div className="subscription-message">
          <p>{message}</p>
        </div>
      )}

      {/* Revenue projection table */}
      <div className="revenue-section">
        <h2>为什么选择我们？</h2>
        <div className="revenue-cards">
          <div className="revenue-card">
            <div className="rev-icon">📚</div>
            <h3>系统化课程</h3>
            <p>从 Python 入门到高级项目实战，循序渐进的学习路径</p>
          </div>
          <div className="revenue-card">
            <div className="rev-icon">💻</div>
            <h3>在线编码环境</h3>
            <p>浏览器内直接编写和运行代码，无需配置开发环境</p>
          </div>
          <div className="revenue-card">
            <div className="rev-icon">🤖</div>
            <h3>AI 学习助手</h3>
            <p>智能代码纠错、知识点答疑、个性化学习推荐</p>
          </div>
          <div className="revenue-card">
            <div className="rev-icon">📱</div>
            <h3>多端同步</h3>
            <p>Web + 移动端，随时随地学习，进度云端同步</p>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={handleAuthClose} />}
    </div>
  )
}

import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>从零开始<br />成为编程高手</h1>
          <p>系统化编程教育平台 · 互动编码实战 · 循序渐进的学习路径</p>
          <div className="hero-actions">
            <Link to="/pricing" className="btn btn-primary btn-lg">查看课程方案</Link>
            <Link to="/courses" className="btn btn-outline btn-lg">免费开始学习</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="code-preview">
            <div className="code-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <pre><code>{`# 你的第一行代码
print("Hello, World!")

# 变量与循环
for i in range(5):
    print(f"第{i+1}次迭代")

# 函数定义
def greet(name):
    return f"你好, {name}!"

print(greet("Python"))`}</code></pre>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>为什么选择 CodeLearn？</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>互动实战</h3>
            <p>不是看视频，而是真正动手写代码。每一课都配有可运行的代码练习。</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📖</span>
            <h3>系统化课程</h3>
            <p>从基础语法到实战项目，科学设计的渐进式学习路径。</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3>在线运行</h3>
            <p>浏览器内直接运行 Python/JavaScript 代码，无需安装任何软件。</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🤖</span>
            <h3>AI 辅助</h3>
            <p>智能代码纠错、知识点答疑，学习路上不孤单。</p>
          </div>
        </div>
      </section>

      <section className="languages">
        <h2>支持的语言</h2>
        <div className="lang-list">
          <div className="lang-item active">Python</div>
          <div className="lang-item">JavaScript</div>
          <div className="lang-item">Go</div>
          <div className="lang-item">Java</div>
          <div className="lang-item">C/C++</div>
        </div>
        <p className="lang-note">Python 课程已上线，更多语言开发中...</p>
      </section>

      <section className="cta-section">
        <h2>准备好开始了吗？</h2>
        <p>完全免费的前 4 章内容，让你无门槛入门编程世界</p>
        <Link to="/courses" className="btn btn-primary btn-lg">免费开始学习</Link>
      </section>

      <footer className="footer">
        <p>CodeLearn © 2026 · 编程学习平台</p>
      </footer>
    </div>
  )
}

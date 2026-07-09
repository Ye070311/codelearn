import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { AuthModal } from './components/AuthModal'
import { HomePage } from './pages/HomePage'
import { CoursesPage } from './pages/CoursesPage'
import { CourseDetailPage } from './pages/CourseDetailPage'
import { LessonViewPage } from './pages/LessonViewPage'
import { PricingPage } from './pages/PricingPage'
import './App.css'

function NavBar() {
  const { user, logout, token } = useAuthStore()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <Link to="/" className="nav-brand">CodeLearn</Link>
          <div className="nav-links">
            <Link to="/courses" className="nav-link">课程</Link>
            <Link to="/pricing" className="nav-link">定价</Link>
          </div>
          <div className="nav-right">
            {token && user ? (
              <div className="nav-user">
                <span className="user-name">{user.name}</span>
                {user.subscriptionTier !== 'free' && (
                  <span className="user-tier pro">Pro</span>
                )}
                <button className="btn btn-ghost btn-sm" onClick={logout}>退出</button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}

export default function App() {
  const checkAuth = useAuthStore(s => s.checkAuth)
  const loading = useAuthStore(s => s.loading)

  useEffect(() => { checkAuth() }, [checkAuth])

  if (loading) return <div className="app-loading">加载中...</div>

  return (
    <BrowserRouter>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/courses/:courseId/lessons/:chapterId/:lessonId" element={<LessonViewPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

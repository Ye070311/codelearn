import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'

interface Lesson {
  id: string
  chapterId: string
  title: string
  content: string
  codeTemplate: string
  codeLanguage: string
  order: number
  isExercise: boolean
  solution?: string
}

interface Chapter {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description: string
  language: string
  level: string
  isFree: boolean
  chapters: Chapter[]
}

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const navigate = useNavigate()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!courseId) return
    api.getCourse(courseId)
      .then((c: Course) => {
        setCourse(c)
        if (c.chapters.length > 0) {
          setExpandedChapters(new Set([c.chapters[0].id]))
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [courseId])

  const toggleChapter = (chId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev)
      if (next.has(chId)) next.delete(chId)
      else next.add(chId)
      return next
    })
  }

  const handleStartLesson = (chapterId: string, lessonId: string) => {
    navigate(`/courses/${courseId}/lessons/${chapterId}/${lessonId}`)
  }

  const levelLabel = (lvl: string) => {
    const map: Record<string, string> = { beginner: '入门', intermediate: '进阶', advanced: '高级' }
    return map[lvl] || lvl
  }

  if (loading) return (
    <div className="page">
      <div className="loading">加载课程中...</div>
    </div>
  )

  if (error) return (
    <div className="page">
      <Link to="/courses" className="back-link">← 返回课程列表</Link>
      <div className="error-card">
        <h2>课程加载失败</h2>
        <p>{error}</p>
        <Link to="/courses" className="btn btn-primary">返回课程列表</Link>
      </div>
    </div>
  )

  if (!course) return (
    <div className="page">
      <Link to="/courses" className="back-link">← 返回课程列表</Link>
      <div className="error-card">
        <h2>课程不存在</h2>
        <p>请检查课程 ID 是否正确</p>
        <Link to="/courses" className="btn btn-primary">返回课程列表</Link>
      </div>
    </div>
  )

  const isProCourse = !course.isFree
  const canAccess = !isProCourse || (user?.subscriptionTier && user.subscriptionTier !== 'free')

  return (
    <div className="page course-detail-page">
      <Link to="/courses" className="back-link">← 返回课程列表</Link>

      <div className="course-detail-header">
        <div className="course-detail-info">
          <div className="course-detail-tags">
            <span className="course-lang-tag">{course.language === 'python' ? 'Python' : course.language}</span>
            <span className={`course-level-tag ${course.level}`}>{levelLabel(course.level)}</span>
            {!course.isFree && <span className="course-pro-tag">Pro 课程</span>}
          </div>
          <h1>{course.title}</h1>
          <p className="course-detail-desc">{course.description}</p>
          <div className="course-stats">
            <span>📚 {course.chapters.length} 章</span>
            <span>📝 {course.chapters.reduce((s, ch) => s + ch.lessons.length, 0)} 课</span>
            <span>💻 {course.chapters.reduce((s, ch) => s + ch.lessons.filter(l => l.isExercise).length, 0)} 个练习</span>
          </div>
        </div>
      </div>

      {isProCourse && !canAccess && (
        <div className="pro-upgrade-banner">
          <div className="pro-upgrade-content">
            <span className="pro-upgrade-icon">⭐</span>
            <div>
              <h3>Pro 课程</h3>
              <p>订阅 Pro 方案即可解锁全部课程内容</p>
            </div>
            <Link to="/pricing" className="btn btn-primary">查看方案</Link>
          </div>
        </div>
      )}

      <div className="chapters-list">
        {course.chapters.map(chapter => (
          <div key={chapter.id} className={`chapter-card ${!canAccess ? 'chapter-locked' : ''}`}>
            <div className="chapter-header" onClick={() => canAccess && toggleChapter(chapter.id)}>
              <div className="chapter-header-left">
                <span className="chapter-number">第 {chapter.order} 章</span>
                <span className="chapter-title">{chapter.title}</span>
              </div>
              <div className="chapter-header-right">
                <span className="chapter-lesson-count">{chapter.lessons.length} 课</span>
                {!canAccess && <span className="chapter-lock-icon">🔒</span>}
                {canAccess && <span className="chapter-toggle">{expandedChapters.has(chapter.id) ? '▼' : '▶'}</span>}
              </div>
            </div>

            {canAccess && expandedChapters.has(chapter.id) && (
              <div className="lesson-list">
                {chapter.lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    className="lesson-item"
                    onClick={() => handleStartLesson(chapter.id, lesson.id)}
                  >
                    <span className="lesson-icon">{lesson.isExercise ? '✏️' : '📖'}</span>
                    <span className="lesson-title">{lesson.order}. {lesson.title}</span>
                    {!course.isFree && <span className="lesson-pro-badge">Pro</span>}
                  </div>
                ))}
              </div>
            )}

            {!canAccess && (
              <div className="lesson-list">
                {chapter.lessons.map((lesson, i) => (
                  <div key={lesson.id} className="lesson-item lesson-item-locked">
                    <span className="lesson-icon">🔒</span>
                    <span className="lesson-title">{lesson.order}. {lesson.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

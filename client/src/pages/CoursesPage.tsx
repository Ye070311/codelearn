import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

interface Course {
  id: string
  title: string
  description: string
  language: string
  level: string
  isFree: boolean
  chapterCount: number
  lessonCount: number
}

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const levelLabel = (lvl: string) => {
    const map: Record<string, string> = { beginner: '入门', intermediate: '进阶', advanced: '高级' }
    return map[lvl] || lvl
  }

  const langLabel = (l: string) => {
    const map: Record<string, string> = { python: 'Python', javascript: 'JavaScript', go: 'Go', java: 'Java', cpp: 'C++' }
    return map[l] || l
  }

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div className="page courses-page">
      <h1>全部课程</h1>
      <p className="page-subtitle">选择一门课程，开始你的编程之旅</p>

      <div className="courses-grid">
        {courses.map(course => (
          <Link to={`/courses/${course.id}`} key={course.id} className="course-card">
            <div className="course-card-header">
              <span className="course-lang-tag">{langLabel(course.language)}</span>
              <span className={`course-level-tag ${course.level}`}>{levelLabel(course.level)}</span>
              {!course.isFree && <span className="course-pro-tag">Pro</span>}
            </div>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="course-card-footer">
              <span>{course.chapterCount} 章 · {course.lessonCount} 课</span>
              <span className="course-status">{course.isFree ? '免费' : '订阅'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

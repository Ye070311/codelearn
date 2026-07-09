import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'

interface LessonData {
  id: string
  title: string
  content: string
  codeTemplate: string
  codeLanguage: string
  isExercise: boolean
  solution?: string
}

export function LessonViewPage() {
  const { courseId, chapterId, lessonId } = useParams<{
    courseId: string
    chapterId: string
    lessonId: string
  }>()
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, token } = useAuthStore()
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!courseId || !chapterId || !lessonId) return
    setLoading(true)
    api.getLesson(courseId, chapterId, lessonId)
      .then((l: LessonData) => {
        setLesson(l)
        setCode(l.codeTemplate)
        setOutput('')
        setCompleted(false)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [courseId, chapterId, lessonId])

  const handleRun = useCallback(async () => {
    setRunning(true)
    setOutput('运行中...')
    try {
      const result = await api.executeCode(code, lesson?.codeLanguage)
      setOutput(result.output || '✅ 代码已执行，无输出')
    } catch (err: any) {
      setOutput(`❌ ${err.message || '运行出错'}`)
    } finally {
      setRunning(false)
    }
  }, [code, lesson])

  const handleComplete = async () => {
    if (!token || !lessonId) return
    try {
      await api.completeLesson(lessonId, code)
      setCompleted(true)
    } catch (err: any) {
      setOutput(`⚠️ 保存失败: ${err.message}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = textareaRef.current
      if (!ta) return
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newCode = code.substring(0, start) + '    ' + code.substring(end)
      setCode(newCode)
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 4
      }, 0)
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRun()
    }
  }

  const renderContent = (text: string) => {
    const lines = text.split('\n')
    const elements: JSX.Element[] = []
    let inCodeBlock = false
    let codeLines: string[] = []
    let codeLang = ''
    let key = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${key++}`} className="lesson-code-block">
              <code>{codeLines.join('\n')}</code>
            </pre>
          )
          codeLines = []
          inCodeBlock = false
        } else {
          inCodeBlock = true
          codeLang = line.slice(3).trim()
        }
        continue
      }

      if (inCodeBlock) {
        codeLines.push(line)
        continue
      }

      if (line.startsWith('# ')) {
        elements.push(<h1 key={key++} className="lesson-h1">{line.slice(2)}</h1>)
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={key++} className="lesson-h2">{line.slice(3)}</h2>)
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={key++} className="lesson-h3">{line.slice(4)}</h3>)
      } else if (line.startsWith('- ')) {
        elements.push(<li key={key++} className="lesson-li">{line.slice(2)}</li>)
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={key++} className="lesson-blockquote">
            {line.slice(2)}
          </blockquote>
        )
      } else if (line.trim() === '') {
        elements.push(<div key={`space-${key++}`} className="lesson-space" />)
      } else {
        // Inline code formatting
        const parts = line.split(/(`[^`]+`)/g)
        const rendered = parts.map((part, j) => {
          if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={j} className="lesson-inline-code">{part.slice(1, -1)}</code>
          }
          return <span key={j}>{part}</span>
        })
        elements.push(<p key={key++} className="lesson-p">{rendered}</p>)
      }
    }

    if (codeLines.length > 0) {
      elements.push(
        <pre key={`code-${key++}`} className="lesson-code-block">
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
    }

    return elements
  }

  if (loading) return (
    <div className="page"><div className="loading">加载课时中...</div></div>
  )

  if (error) return (
    <div className="page">
      <Link to={`/courses/${courseId}`} className="back-link">← 返回课程</Link>
      <div className="error-card">
        <h2>课时加载失败</h2>
        <p>{error}</p>
      </div>
    </div>
  )

  if (!lesson) return null

  return (
    <div className="lesson-page">
      {/* Sidebar: lesson content */}
      <div className="lesson-sidebar">
        <div className="lesson-sidebar-header">
          <button className="back-btn" onClick={() => navigate(`/courses/${courseId}`)}>
            ← 返回课程
          </button>
          <span className="lesson-badge">{lesson.isExercise ? '✏️ 练习' : '📖 课程'}</span>
        </div>
        <h2 className="lesson-title-main">{lesson.title}</h2>
        <div className="lesson-content">
          {renderContent(lesson.content)}
        </div>
      </div>

      {/* Main: code editor + output */}
      <div className="lesson-main">
        <div className="editor-section">
          <div className="editor-header">
            <div className="editor-header-left">
              <span className="editor-lang">{lesson.codeLanguage === 'python' ? 'Python' : 'JavaScript'}</span>
              <span className="shortcut-hint">Ctrl+Enter 运行</span>
            </div>
            <div className="editor-actions">
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setCode(lesson.codeTemplate)}
                title="重置代码"
              >
                ↺ 重置
              </button>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleRun}
                disabled={running}
              >
                {running ? '⏳ 运行中...' : '▶ 运行'}
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            className="code-editor"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            wrap="off"
            placeholder="在此编写代码..."
          />
        </div>

        <div className="output-section">
          <div className="output-header">
            <span>运行结果</span>
            {output && !output.startsWith('运行') && (
              <span className="output-time">执行完成</span>
            )}
          </div>
          <pre className={`output-content ${output.startsWith('❌') || output.startsWith('⚠️') ? 'error' : ''} ${!output ? 'empty' : ''}`}>
            {output || '点击 ▶ 运行 按钮执行代码'}
          </pre>
        </div>

        <div className="lesson-actions-bar">
          <button
            className={`btn ${completed ? 'btn-outline' : 'btn-primary'}`}
            onClick={handleComplete}
            disabled={completed || !token}
          >
            {completed ? '✓ 已完成' : '标记为已完成'}
          </button>
          {!token && (
            <span className="login-hint">💡 登录后可保存学习进度</span>
          )}
          {completed && (
            <Link to={`/courses/${courseId}`} className="btn btn-outline">
              继续下一课 →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

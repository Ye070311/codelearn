import { FastifyInstance } from 'fastify'
import { store } from '../db/store.js'
import { execSync, spawnSync } from 'child_process'
import { randomUUID } from 'crypto'
import fs from 'fs'

const PYTHON_PATH = process.env.PYTHON_PATH || 'python'

// ── 中文标点检测表 ──────────────────────────────────────────
const CN_PUNCT_RULES = [
  { char: '（', name: '左括号', fix: '(', desc: 'print( ) 要用英文小括号' },
  { char: '）', name: '右括号', fix: ')', desc: 'print( ) 要用英文小括号' },
  { char: '“', name: '左双引号', fix: '"', desc: '字符串要用英文双引号' },
  { char: '”', name: '右双引号', fix: '"', desc: '字符串要用英文双引号' },
  { char: '‘', name: '左单引号', fix: "'", desc: '字符串要用英文单引号' },
  { char: '’', name: '右单引号', fix: "'", desc: '字符串要用英文单引号' },
  { char: '，', name: '逗号', fix: ',', desc: '参数之间用英文逗号分隔' },
  { char: '：', name: '冒号', fix: ':', desc: 'if/for/while 后面用英文冒号' },
  { char: '；', name: '分号', fix: ';', desc: '语句分隔用英文分号' },
  { char: '？', name: '问号', fix: '?', desc: 'Python 中建议用英文问号' },
  { char: '！', name: '感叹号', fix: '!', desc: 'Python 中建议用英文感叹号' },
  { char: '【', name: '中方括号', fix: '[', desc: '列表要用英文方括号' },
  { char: '】', name: '中方括号', fix: ']', desc: '列表要用英文方括号' },
  { char: '｛', name: '中大括号', fix: '{', desc: '字典要用英文大括号' },
  { char: '｝', name: '中大括号', fix: '}', desc: '字典要用英文大括号' },
  { char: '、', name: '顿号', fix: ',', desc: '参数之间建议用英文逗号' },
  { char: '～', name: '波浪号', fix: '~', desc: '按位取反用英文波浪号' },
  { char: '《', name: '左书名号', fix: '<', desc: '比较运算用英文小于号' },
  { char: '》', name: '右书名号', fix: '>', desc: '比较运算用英文大于号' },
  { char: '　', name: '全角空格', fix: ' ', desc: 'Python 空格要用半角空格' },
]

// ── 中文标点检测 ──────────────────────────────────────────
/** 检查代码中的中文标点，返回友好的错误提示 */
function checkChinesePunctuation(code: string): string | null {
  const found: { char: string; name: string; fix: string; desc: string; line: number; col: number }[] = []
  const lines = code.split('\n')

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]
    for (let colIdx = 0; colIdx < line.length; colIdx++) {
      const ch = line[colIdx]
      const rule = CN_PUNCT_RULES.find(r => r.char === ch)
      if (rule) {
        found.push({ ...rule, line: lineIdx + 1, col: colIdx + 1 })
      }
    }
  }

  if (found.length === 0) return null

  // 去重：只显示每种符号的第一个错误位置
  const unique = new Map<string, typeof found[0]>()
  for (const f of found) {
    if (!unique.has(f.char)) unique.set(f.char, f)
  }

  const items = Array.from(unique.values())
  const errorLine = lines[found[0].line - 1]

  let msg = '⚠️ 检测到代码中使用了中文标点符号！\n'
  msg += '━'.repeat(40) + '\n'
  msg += 'Python 代码必须使用英文标点符号。\n\n'
  msg += `📌 第 ${found[0].line} 行: ${errorLine.trim()}\n`
  msg += '   ' + ' '.repeat(found[0].col + 4) + '↑ 这里\n\n'

  msg += '发现以下问题：\n'
  for (const item of items) {
    msg += `  ❌ "${item.char}"（${item.name}）→ 应改为 "${item.fix}"（${item.desc}）\n`
  }

  msg += '\n🔧 修改方法：\n'
  // Show the corrected code
  let corrected = code
  for (const [c, item] of unique) {
    corrected = corrected.split(c).join(item.fix)
  }
  msg += `  把代码中的中文符号替换为对应的英文符号：\n`
  msg += `  ${corrected.split('\n')[0]}\n`

  msg += '\n💡 提示：\n'
  msg += '  编写代码时请确保输入法处于英文模式（半角）\n'
  msg += '  通常按 Shift 键切换中英文输入法\n'

  return msg
}


export async function sandboxRoutes(app: FastifyInstance) {
  function canRunCode(userId: string): { allowed: boolean; reason?: string } {
    const user = Array.from(store.users.values()).find(u => u.id === userId)
    if (!user) return { allowed: false, reason: '用户未找到' }
    const isFree = user.subscriptionTier === 'free'
    if (!isFree) return { allowed: true }
    const userProgress = store.progress.get(userId) || []
    const todayRuns = userProgress.filter(p => {
      if (!p.completedAt) return false
      return p.completedAt.startsWith(new Date().toISOString().split('T')[0])
    }).length
    if (todayRuns >= 10) {
      return { allowed: false, reason: '免费用户每日限制 10 次代码运行，升级 Pro 可解除限制' }
    }
    return { allowed: true }
  }

  function findPython(): string | null {
    const candidates = [
      PYTHON_PATH, 'python', 'python3',
      ...(process.env.LOCALAPPDATA ? [
        `${process.env.LOCALAPPDATA}\\Programs\\Python\\Python313\\python.exe`,
        `${process.env.LOCALAPPDATA}\\Programs\\Python\\Python314\\python.exe`,
      ] : []),
      'C:\\Users\\admin\\AppData\\Local\\Programs\\Python\\Python314\\python.exe',
      'C:\\Python313\\python.exe', 'C:\\Python\\python.exe',
    ]
    for (const p of candidates) {
      try {
        const r = spawnSync(p, ['--version'], { timeout: 2000, encoding: 'utf-8' })
        if (r.status === 0) return p
      } catch {}
    }
    return null
  }

  app.post('/execute', async (request, reply) => {
    const { code, language } = request.body as any
    const auth = request.headers.authorization

    if (!code) {
      return reply.status(400).send({ error: '请提供要运行的代码' })
    }

    let userId = 'anonymous'
    if (auth) {
      try {
        const payload = JSON.parse(Buffer.from(auth.replace('Bearer ', ''), 'base64').toString())
        userId = payload.userId
        const check = canRunCode(userId)
        if (!check.allowed) return reply.status(403).send({ error: check.reason })
      } catch {}
    }

    try {
      let output = ''
      const lang = language || 'python'

      if (lang === 'python') {
        // ⭐ 先检查中文标点
        const punctError = checkChinesePunctuation(code)
        if (punctError) {
          if (userId !== 'anonymous') {
            const p = store.progress.get(userId) || []
            p.push({ userId, lessonId: 'sandbox_run', completed: true, code, completedAt: new Date().toISOString() })
            store.progress.set(userId, p)
          }
          return { output: punctError, language: lang }
        }

        const pythonExe = findPython()
        if (!pythonExe) {
          return { output: '⚠️ 未找到 Python 运行环境\n请安装 Python 3.7+ 并确保在系统 PATH 中', language: lang }
        }

        const safeCode = code
          .replace(/import\s+os/g, '# import os')
          .replace(/import\s+subprocess/g, '# import subprocess')

        const tmpFile = `${randomUUID()}.py`
        const fullPath = `${process.env.TEMP || '/tmp'}\\${tmpFile}`
        fs.writeFileSync(fullPath, safeCode, 'utf-8')

        try {
          const result = execSync(`"${pythonExe}" -X utf8 "${fullPath}"`, {
            timeout: 5000,
            maxBuffer: 1024 * 1024,
            encoding: 'utf-8',
            windowsHide: true,
            env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
          })
          output = result
        } catch (execErr: any) {
          // 捕获 Python 错误并增强中文说明
          const rawErr = execErr.stderr?.toString() || execErr.stdout?.toString() || ''
          output = enhanceError(rawErr, code)
        } finally {
          try { fs.unlinkSync(fullPath) } catch {}
        }
      } else if (lang === 'javascript') {
        try {
          const result = execSync(`node -e "${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}"`, {
            timeout: 5000, encoding: 'utf-8', windowsHide: true,
          })
          output = result
        } catch (err: any) {
          output = err.stderr?.toString() || '代码执行出错'
        }
      } else {
        output = `暂不支持 ${lang} 语言的运行`
      }

      if (userId !== 'anonymous') {
        const userProgress = store.progress.get(userId) || []
        userProgress.push({ userId, lessonId: 'sandbox_run', completed: true, code, completedAt: new Date().toISOString() })
        store.progress.set(userId, userProgress)
      }

      return { output, language: lang }
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || '代码执行失败' })
    }
  })
}

// ── 错误信息增强 ──────────────────────────────────────────
/** 把 Python 的英文错误翻译为更友好的中文说明 */
function enhanceError(rawErr: string, code: string): string {
  // 如果包含中文标点，优先处理
  const punctCheck = checkChinesePunctuation(code)
  if (punctCheck) return punctCheck

  let msg = rawErr

  // SyntaxError
  if (msg.includes('SyntaxError') || msg.includes('syntax error')) {
    const lineMatch = msg.match(/line\s+(\d+)/i)
    const lineNum = lineMatch ? parseInt(lineMatch[1]) : null

    msg = '\n❌ 语法错误 (SyntaxError)\n'
    msg += '━'.repeat(40) + '\n'

    if (lineNum && lineNum <= code.split('\n').length) {
      const lines = code.split('\n')
      msg += `第 ${lineNum} 行附近有问题：\n`
      for (let i = Math.max(0, lineNum - 2); i < Math.min(lines.length, lineNum + 1); i++) {
        const marker = i === lineNum - 1 ? '→ ' : '  '
        msg += `  ${marker}${lines[i]}\n`
      }
    }

    msg += '\n可能的原因：\n'
    if (rawErr.includes('invalid syntax')) msg += '  • 拼写错误或符号用错了\n'
    if (rawErr.includes('unexpected EOF')) msg += '  • 括号没有闭合，少了 )\n  • 引号没有闭合\n'
    if (rawErr.includes('EOL')) msg += '  • 字符串的引号没有闭合\n'
    if (rawErr.includes('unexpected indent')) msg += '  • 缩进不一致（混用了空格和 Tab）\n'

    msg += '\n💡 解决方法：\n'
    msg += '  1. 检查提示行附近的代码\n'
    msg += '  2. 确认所有括号 ( ) 都成对出现\n'
    msg += '  3. 确认字符串引号 " 或 \' 已闭合\n'
    msg += '  4. 检查 if/for/def 后面是否漏了冒号 :\n'
    msg += '  5. 检查是否使用了中文标点（（）“”，）\n'

    return msg
  }

  // NameError (undefined variable)
  if (msg.includes('NameError')) {
    const nameMatch = msg.match(/name\s+'([^']+)'/i)
    const name = nameMatch ? nameMatch[1] : '变量'
    msg = `\n❌ 名称错误 (NameError)\n`
    msg += '━'.repeat(40) + '\n'
    msg += `变量 "${name}" 未定义\n\n`
    msg += '可能的原因：\n'
    msg += `  • 忘记给 "${name}" 赋值了\n`
    msg += `  • 拼写错误，检查变量名是否一致\n`
    msg += `  • 变量名大小写写错了（Python 区分大小写）\n\n`
    msg += `💡 解决方法：先给变量赋值再使用\n`
    return msg
  }

  // TypeError
  if (msg.includes('TypeError')) {
    msg = '\n❌ 类型错误 (TypeError)\n'
    msg += '━'.repeat(40) + '\n'
    msg += '操作的类型不匹配\n\n'
    msg += '常见原因：\n'
    msg += '  • 字符串和数字不能直接拼接，用 str() 转换\n'
    msg += '  • 调用了不存在的方法\n\n'
    msg += '💡 解决方法：检查运算两边的数据类型是否一致\n'
    return msg
  }

  // IndentationError
  if (msg.includes('IndentationError') || msg.includes('unexpected indent')) {
    msg = '\n❌ 缩进错误 (IndentationError)\n'
    msg += '━'.repeat(40) + '\n'
    msg += '代码缩进不一致\n\n'
    msg += '可能的原因：\n'
    msg += '  • 混用了空格和 Tab\n'
    msg += '  • if/for/def 下一行没有缩进\n'
    msg += '  • 缩进多了一个或少了一个空格\n\n'
    msg += '💡 解决方法：\n'
    msg += '  统一使用 4 个空格作为缩进（推荐）\n'
    msg += '  或者在编辑器右下角设置 "空格缩进"\n'
    return msg
  }

  // General fallback
  return rawErr
}

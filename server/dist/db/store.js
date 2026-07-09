// In-memory store (swap with PostgreSQL in production)
export class Store {
    users = new Map();
    courses = new Map();
    progress = new Map();
    subscriptions = new Map();
    // Seed data
    seed() {
        // Python Beginner Course
        const pythonBeginner = {
            id: 'python-beginner',
            title: 'Python 入门基础',
            description: '从零开始学习 Python 编程，掌握变量、数据类型、流程控制、函数等核心概念。',
            language: 'python',
            level: 'beginner',
            isFree: true,
            order: 1,
            chapters: [
                {
                    id: 'py-ch1',
                    courseId: 'python-beginner',
                    title: 'Python 环境与基础语法',
                    order: 1,
                    lessons: [
                        {
                            id: 'py-ch1-l1',
                            chapterId: 'py-ch1',
                            title: '你好，Python！',
                            content: `# 你好，Python！

## 什么是 Python？

Python 是一种简单易学、功能强大的编程语言。它被广泛应用于 Web 开发、数据分析、人工智能等领域。

## 你的第一行代码

在 Python 中，用 \`print()\` 函数可以输出文字到屏幕上。

试试在右侧编辑器中输入：

\`\`\`python
print("Hello, World!")
\`\`\`

然后点击"运行"按钮看看结果！`,
                            codeTemplate: '# 在下方输入你的代码\nprint("Hello, World!")',
                            codeLanguage: 'python',
                            order: 1,
                            isExercise: false,
                        },
                        {
                            id: 'py-ch1-l2',
                            chapterId: 'py-ch1',
                            title: '注释与输出',
                            content: `# 注释与输出

## 注释

注释是代码中被解释器忽略的部分，用于给程序员添加说明。

\`\`\`python
# 这是单行注释
print("这行代码会被执行")

"""
这是多行注释
可以写多行文字
"""
\`\`\`

## 练习

1. 使用 \`print()\` 输出你的名字
2. 在代码中添加一行注释`,
                            codeTemplate: '# 练习：输出你的名字\n# 在这行下面添加注释\n\nprint("你的名字")',
                            codeLanguage: 'python',
                            order: 2,
                            isExercise: true,
                        },
                        {
                            id: 'py-ch1-l3',
                            chapterId: 'py-ch1',
                            title: '变量与数据类型',
                            content: `# 变量与数据类型

## 变量

变量是用来存储数据的"容器"。在 Python 中，不需要声明类型，直接赋值即可：

\`\`\`python
name = "小明"    # 字符串 (str)
age = 18         # 整数 (int)
height = 1.75    # 浮点数 (float)
is_student = True # 布尔值 (bool)
\`\`\`

## 练习

创建几个不同类型的变量并输出它们。`,
                            codeTemplate: '# 创建变量并输出\nname = "小明"\nage = 18\n\nprint("我叫", name)\nprint("我今年", age, "岁")',
                            codeLanguage: 'python',
                            order: 3,
                            isExercise: true,
                        },
                    ],
                },
                {
                    id: 'py-ch2',
                    courseId: 'python-beginner',
                    title: '数据类型与运算符',
                    order: 2,
                    lessons: [
                        {
                            id: 'py-ch2-l1',
                            chapterId: 'py-ch2',
                            title: '字符串操作',
                            content: `# 字符串操作

## 字符串拼接

\`\`\`python
first = "Hello"
second = "World"
result = first + " " + second
print(result)  # Hello World
\`\`\`

## f-string

\`\`\`python
name = "Python"
print(f"我爱{name}!")  # 我爱Python!
\`\`\``,
                            codeTemplate: '# 字符串练习\nname = "Python"\nversion = 3\n\n# 使用 f-string 输出\nprint(f"{name} {version} 是最好的编程语言！")',
                            codeLanguage: 'python',
                            order: 1,
                            isExercise: false,
                        },
                        {
                            id: 'py-ch2-l2',
                            chapterId: 'py-ch2',
                            title: '数字运算',
                            content: `# 数字运算

## 基本运算符

\`\`\`python
a = 10
b = 3

print(a + b)  # 13  加法
print(a - b)  # 7   减法
print(a * b)  # 30  乘法
print(a / b)  # 3.33 除法
print(a // b) # 3   整除
print(a % b)  # 1   取余
print(a ** b) # 1000 幂运算
\`\`\``,
                            codeTemplate: '# 计算圆的面积\npi = 3.14159\nradius = 5\n\n# 计算面积 pi * r^2\narea = pi * radius ** 2\nprint(f"半径为{radius}的圆面积为: {area}")',
                            codeLanguage: 'python',
                            order: 2,
                            isExercise: true,
                        },
                    ],
                },
                {
                    id: 'py-ch3',
                    courseId: 'python-beginner',
                    title: '流程控制',
                    order: 3,
                    lessons: [
                        {
                            id: 'py-ch3-l1',
                            chapterId: 'py-ch3',
                            title: '条件判断 if-else',
                            content: `# 条件判断

## if 语句

\`\`\`python
age = 18
if age >= 18:
    print("成年人")
else:
    print("未成年人")
\`\`\`

## elif

\`\`\`python
score = 85
if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
\`\`\``,
                            codeTemplate: '# 判断奇偶数\nnum = 7\n\nif num % 2 == 0:\n    print(f"{num} 是偶数")\nelse:\n    print(f"{num} 是奇数")',
                            codeLanguage: 'python',
                            order: 1,
                            isExercise: false,
                        },
                        {
                            id: 'py-ch3-l2',
                            chapterId: 'py-ch3',
                            title: '循环 for & while',
                            content: `# 循环

## for 循环

\`\`\`python
# 遍历列表
fruits = ["苹果", "香蕉", "橘子"]
for fruit in fruits:
    print(fruit)

# 使用 range
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4
\`\`\`

## while 循环

\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\``,
                            codeTemplate: '# 练习：计算 1 到 100 的和\ntotal = 0\n\n# 在这里写你的循环\n\nprint(f"1到100的和是: {total}")',
                            codeLanguage: 'python',
                            order: 2,
                            isExercise: true,
                        },
                    ],
                },
            ],
            createdAt: '2026-01-01T00:00:00Z',
        };
        // Python Intermediate Course
        const pythonIntermediate = {
            id: 'python-intermediate',
            title: 'Python 进阶编程',
            description: '深入学习面向对象编程、文件操作、异常处理等进阶主题。',
            language: 'python',
            level: 'intermediate',
            isFree: false,
            order: 2,
            chapters: [
                {
                    id: 'py-ch5',
                    courseId: 'python-intermediate',
                    title: '面向对象编程',
                    order: 1,
                    lessons: [
                        {
                            id: 'py-ch5-l1',
                            chapterId: 'py-ch5',
                            title: '类与对象',
                            content: `# 类与对象

## 定义类

\`\`\`python
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def introduce(self):
        return f"我叫{self.name}，今年{self.age}岁"

# 创建对象
s = Student("小明", 20)
print(s.introduce())
\`\`\``,
                            codeTemplate: '# 创建一个 Dog 类\nclass Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n    \n    def bark(self):\n        return f"{self.name} says Woof!"\n\n# 创建实例\ndog = Dog("旺财", "金毛")\nprint(dog.bark())',
                            codeLanguage: 'python',
                            order: 1,
                            isExercise: false,
                        },
                        {
                            id: 'py-ch5-l2',
                            chapterId: 'py-ch5',
                            title: '继承',
                            content: `# 继承

子类可以继承父类的属性和方法：

\`\`\`python
class Animal:\n    def __init__(self, name):\n        self.name = name\n    \n    def speak(self):\n        pass\n\nclass Cat(Animal):\n    def speak(self):\n        return f"{self.name}: 喵喵~"\n\nclass Dog(Animal):\n    def speak(self):\n        return f"{self.name}: 汪汪!"\n\`\`\``,
                            codeTemplate: '# 练习：创建继承体系\nclass Vehicle:\n    def __init__(self, brand):\n        self.brand = brand\n    \n    def info(self):\n        return f"这是一辆{self.brand}的车"\n\n# 创建 Car 类继承 Vehicle\nclass Car(Vehicle):\n    def __init__(self, brand, model):\n        super().__init__(brand)\n        self.model = model\n    \n    def info(self):\n        return f"{self.brand} {self.model}"\n\ncar = Car("Toyota", "Camry")\nprint(car.info())',
                            codeLanguage: 'python',
                            order: 2,
                            isExercise: true,
                        },
                    ],
                },
            ],
            createdAt: '2026-01-02T00:00:00Z',
        };
        // JavaScript Course
        const jsBeginner = {
            id: 'js-beginner',
            title: 'JavaScript 入门',
            description: '学习 Web 开发的核心语言 JavaScript，从基础语法到 DOM 操作。',
            language: 'javascript',
            level: 'beginner',
            isFree: true,
            order: 3,
            chapters: [
                {
                    id: 'js-ch1',
                    courseId: 'js-beginner',
                    title: 'JavaScript 基础',
                    order: 1,
                    lessons: [
                        {
                            id: 'js-ch1-l1',
                            chapterId: 'js-ch1',
                            title: '你好，JavaScript！',
                            content: `# 你好，JavaScript！

## 什么是 JavaScript？

JavaScript 是 Web 开发的三大核心技术之一，让网页具有交互功能。

## 控制台输出

\`\`\`javascript
console.log("Hello, World!");
console.log("你好，世界！");
\`\`\`

点击运行看看效果！`,
                            codeTemplate: '// 在下方输入你的代码\nconsole.log("Hello, World!");',
                            codeLanguage: 'javascript',
                            order: 1,
                            isExercise: false,
                        },
                    ],
                },
            ],
            createdAt: '2026-01-03T00:00:00Z',
        };
        this.courses.set(pythonBeginner.id, pythonBeginner);
        this.courses.set(pythonIntermediate.id, pythonIntermediate);
        this.courses.set(jsBeginner.id, jsBeginner);
    }
}
export const store = new Store();
store.seed();
//# sourceMappingURL=store.js.map
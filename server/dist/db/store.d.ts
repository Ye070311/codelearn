export interface User {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    avatar?: string;
    subscriptionTier: 'free' | 'pro_monthly' | 'pro_yearly' | 'lifetime';
    subscriptionEndsAt?: string;
    createdAt: string;
}
export interface Course {
    id: string;
    title: string;
    description: string;
    language: 'python' | 'javascript' | 'go' | 'java' | 'cpp';
    level: 'beginner' | 'intermediate' | 'advanced';
    isFree: boolean;
    order: number;
    chapters: Chapter[];
    createdAt: string;
}
export interface Chapter {
    id: string;
    courseId: string;
    title: string;
    order: number;
    lessons: Lesson[];
}
export interface Lesson {
    id: string;
    chapterId: string;
    title: string;
    content: string;
    codeTemplate: string;
    codeLanguage: string;
    order: number;
    isExercise: boolean;
    solution?: string;
}
export interface UserProgress {
    userId: string;
    lessonId: string;
    completed: boolean;
    code?: string;
    completedAt?: string;
}
export interface Subscription {
    id: string;
    userId: string;
    tier: 'pro_monthly' | 'pro_yearly' | 'lifetime';
    status: 'active' | 'cancelled' | 'expired';
    startedAt: string;
    endsAt: string;
    provider: 'stripe' | 'wechat';
}
export declare class Store {
    users: Map<string, User>;
    courses: Map<string, Course>;
    progress: Map<string, UserProgress[]>;
    subscriptions: Map<string, Subscription>;
    seed(): void;
}
export declare const store: Store;
//# sourceMappingURL=store.d.ts.map
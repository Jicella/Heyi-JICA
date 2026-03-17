
export type UserRole = 'student' | 'teacher' | 'parent';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  childrenIds?: string[]; // For parents
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  deadline: string;
  teacherId: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  homeworkId: string;
  studentId: string;
  filePath: string;
  fileName: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

export interface AuthResponse {
  user: User;
  token: string;
}

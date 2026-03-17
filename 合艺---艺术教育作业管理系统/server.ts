import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// If the above fails, you might need: import * as bcrypt from 'bcryptjs';
import fs from 'fs';

const JWT_SECRET = 'your-secret-key-for-homework-app';
const PORT = 3000;

// Persistence Helper
const DATA_FILE = path.join(process.cwd(), 'data.json');
const loadData = () => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
      return null;
    }
  }
  return null;
};
const saveData = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users, homeworks, submissions }, null, 2));
};

const savedData = loadData();

// Mock Database
const defaultPassword = bcrypt.hashSync('password123', 10);
let users: any[] = savedData?.users || [
  { id: '1', username: 'teacher', password: defaultPassword, role: 'teacher', name: '张老师' },
  { id: '2', username: 'student', password: defaultPassword, role: 'student', name: '李小明' },
  { id: '3', username: 'parent', password: defaultPassword, role: 'parent', name: '李大明', childrenIds: ['2'] },
];
let homeworks: any[] = savedData?.homeworks || [];
let submissions: any[] = savedData?.submissions || [];

if (!savedData) saveData();

// Storage for uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    cb(null, `${timestamp}-${name}${ext}`);
  },
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use('/uploads', express.static(uploadDir));

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- Auth Routes ---
  app.post('/api/register', async (req, res) => {
    const { username, password, role, name, childrenUsernames } = req.body;
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: any = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password: hashedPassword,
      role,
      name,
    };
    if (role === 'parent' && childrenUsernames) {
      const children = users.filter(u => childrenUsernames.includes(u.username));
      newUser.childrenIds = children.map(c => c.id);
    }
    users.push(newUser);
    saveData();
    res.json({ message: 'User registered' });
  });

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });
    const user = users.find(u => u.username === username);
    if (!user) {
      console.log('Login failed: User not found', { username });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch', { username });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Login success:', { username, role: user.role });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  });

  app.get('/api/me', authenticate, (req: any, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // --- Homework Routes ---
  app.post('/api/homework', authenticate, (req: any, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
    const { title, description, deadline } = req.body;
    const newHomework = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      deadline,
      teacherId: req.user.id,
      createdAt: new Date().toISOString(),
    };
    homeworks.push(newHomework);
    saveData();
    res.json(newHomework);
  });

  app.get('/api/homework', authenticate, (req: any, res) => {
    res.json(homeworks);
  });

  app.delete('/api/homework/:id', authenticate, (req: any, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
    homeworks = homeworks.filter(h => h.id !== req.params.id);
    submissions = submissions.filter(s => s.homeworkId !== req.params.id);
    saveData();
    res.json({ message: 'Homework deleted' });
  });

  // --- Submission Routes ---
  app.post('/api/submit', authenticate, upload.single('file'), (req: any, res) => {
    console.log('Upload request received:', {
      user: req.user,
      body: req.body,
      file: req.file
    });
    
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
    const { homeworkId } = req.body;
    const file = req.file;
    if (!file) {
      console.log('Upload failed: No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const existing = submissions.find(s => s.homeworkId === homeworkId && s.studentId === req.user.id);
    if (existing) {
      existing.filePath = 'uploads/' + file.filename;
      existing.fileName = file.originalname;
      existing.submittedAt = new Date().toISOString();
      saveData();
      return res.json(existing);
    }

    const newSubmission = {
      id: Math.random().toString(36).substr(2, 9),
      homeworkId,
      studentId: req.user.id,
      filePath: 'uploads/' + file.filename,
      fileName: file.originalname,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    submissions.push(newSubmission);
    saveData();
    res.json(newSubmission);
  });

  app.get('/api/submissions', authenticate, (req: any, res) => {
    if (req.user.role === 'teacher') {
      res.json(submissions);
    } else if (req.user.role === 'student') {
      res.json(submissions.filter(s => s.studentId === req.user.id));
    } else if (req.user.role === 'parent') {
      const user = users.find(u => u.id === req.user.id);
      res.json(submissions.filter(s => user.childrenIds?.includes(s.studentId)));
    }
  });

  app.delete('/api/submissions/:id', authenticate, (req: any, res) => {
    if (req.user.role !== 'student' && req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
    
    const index = submissions.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Submission not found' });
    
    // Students can only delete their own submissions
    if (req.user.role === 'student' && submissions[index].studentId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    submissions.splice(index, 1);
    saveData();
    res.json({ message: 'Submission deleted' });
  });

  app.post('/api/grade', authenticate, (req: any, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
    const { submissionId, grade, feedback } = req.body;
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    saveData();
    res.json(submission);
  });

  // --- Stats Routes ---
  app.get('/api/stats', authenticate, (req: any, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
    const totalStudents = users.filter(u => u.role === 'student').length;
    const stats = homeworks.map(h => {
      const subs = submissions.filter(s => s.homeworkId === h.id);
      return {
        homeworkId: h.id,
        title: h.title,
        submissionCount: subs.length,
        totalStudents,
        submissionRate: totalStudents > 0 ? (subs.length / totalStudents) * 100 : 0,
        averageGrade: subs.filter(s => s.grade !== undefined).reduce((acc, s) => acc + s.grade!, 0) / (subs.filter(s => s.grade !== undefined).length || 1),
      };
    });
    res.json(stats);
  });

  // --- Parent Routes ---
  app.get('/api/children', authenticate, (req: any, res) => {
    if (req.user.role !== 'parent') return res.status(403).json({ error: 'Forbidden' });
    const user = users.find(u => u.id === req.user.id);
    const children = users.filter(u => user.childrenIds?.includes(u.id)).map(c => {
      const { password: _, ...childWithoutPassword } = c;
      return childWithoutPassword;
    });
    res.json(children);
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: '服务器内部错误，请稍后再试' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

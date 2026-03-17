import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Upload, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Users, 
  LogOut, 
  Plus, 
  FileText, 
  MessageSquare, 
  ChevronRight,
  AlertCircle,
  Calendar,
  User as UserIcon,
  GraduationCap,
  Zap,
  Trash2,
  ZoomIn,
  X,
  Search,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Homework, Submission } from './types';

// --- Components ---

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean, 
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel: () => void 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-4 text-rose-800">
          <AlertCircle size={24} />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-slate-600 mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">取消</button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }} 
            className="btn-primary flex-1 bg-rose-800 hover:bg-rose-900 shadow-rose-200"
          >
            确认
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ImageZoomModal = ({ src, onClose }: { src: string, onClose: () => void }) => {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-5xl max-h-full"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition-colors"
        >
          <X size={32} />
        </button>
        <img 
          src={src} 
          alt="Zoomed" 
          className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [childrenUsernames, setChildrenUsernames] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/register' : '/api/login';
      const body = isRegister 
        ? { username, password, role, name, childrenUsernames: childrenUsernames.split(',').map(s => s.trim()) }
        : { username, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      if (!isRegister) {
        onLogin(data.user);
      } else {
        setIsRegister(false);
        alert('注册成功，请登录');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-800 rounded-2xl shadow-xl shadow-rose-200 mb-4">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">合艺</h1>
          <p className="text-slate-500 mt-2">艺术教育作业管理与点评系统</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">真实姓名</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="请输入您的姓名"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">身份角色</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'teacher', 'parent'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        role === r 
                          ? 'bg-rose-800 text-white shadow-md' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {r === 'student' ? '学生' : r === 'teacher' ? '教师' : '家长'}
                    </button>
                  ))}
                </div>
              </div>
              {role === 'parent' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">关联孩子用户名</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="多个用户名请用逗号分隔"
                    value={childrenUsernames}
                    onChange={e => setChildrenUsernames(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">用户名</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="请输入用户名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">密码</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="请输入密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isRegister ? '立即注册' : '登录系统'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-rose-800 font-semibold hover:underline"
          >
            {isRegister ? '已有账号？返回登录' : '没有账号？立即注册'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'homework' | 'stats' | 'children'>('homework');
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [manualGrade, setManualGrade] = useState('');
  const [manualFeedback, setManualFeedback] = useState('');
  
  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Create Homework Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const fetchData = async () => {
    try {
      const [hwRes, subRes] = await Promise.all([
        fetch('/api/homework', { credentials: 'include' }),
        fetch('/api/submissions', { credentials: 'include' })
      ]);
      const hwData = await hwRes.json();
      const subData = await subRes.json();
      setHomeworks(hwData);
      setSubmissions(subData);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc, deadline: newDeadline }),
        credentials: 'include',
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewDeadline('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHomework = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '确认删除',
      message: '您确定要删除这项作业吗？这将同时删除所有学生的提交记录。',
      onConfirm: async () => {
        try {
          await fetch(`/api/homework/${id}`, { method: 'DELETE', credentials: 'include' });
          fetchData();
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleFileUpload = async (homeworkId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('homeworkId', homeworkId);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (res.ok) {
        alert('提交成功！');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-rose-800 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">合艺</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{user.name}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full">
                {user.role === 'teacher' ? '教师' : user.role === 'student' ? '学生' : '家长'}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="退出登录"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
          <button 
            onClick={() => setActiveTab('homework')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'homework' ? 'bg-rose-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <BookOpen size={18} />
            作业中心
          </button>
          {user.role === 'teacher' && (
            <button 
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'stats' ? 'bg-rose-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <BarChart3 size={18} />
              学情分析
            </button>
          )}
          {user.role === 'parent' && (
            <button 
              onClick={() => setActiveTab('children')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'children' ? 'bg-rose-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Users size={18} />
              孩子进度
            </button>
          )}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'homework' && (
            <motion.div 
              key="homework"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="section-title">作业列表</h2>
                  <p className="text-slate-500 mt-1">查看并管理您的所有课程作业</p>
                </div>
                {user.role === 'teacher' && (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={20} />
                    发布新作业
                  </button>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                  ))}
                </div>
              ) : homeworks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">暂无作业</h3>
                  <p className="text-slate-500 mt-1">目前还没有发布的作业任务</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {homeworks.map(hw => {
                    const submission = submissions.find(s => s.homeworkId === hw.id);
                    return (
                      <motion.div 
                        layoutId={hw.id}
                        key={hw.id} 
                        className="glass-card flex flex-col"
                      >
                        <div className="p-6 flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-rose-50 rounded-lg text-rose-800">
                              <BookOpen size={20} />
                            </div>
                            {user.role === 'teacher' && (
                              <button 
                                onClick={() => handleDeleteHomework(hw.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">{hw.title}</h3>
                          <p className="text-slate-500 text-sm line-clamp-2 mb-4">{hw.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              截止: {new Date(hw.deadline).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              发布: {new Date(hw.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">
                          {user.role === 'student' && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                {submission ? (
                                  <div className="flex items-center gap-2">
                                    {submission.status === 'graded' ? (
                                      <div className="flex items-center gap-2">
                                        <span className="badge badge-green">已批改</span>
                                        <span className="text-lg font-black text-emerald-600">{submission.grade}分</span>
                                      </div>
                                    ) : (
                                      <span className="badge badge-orange">待批改</span>
                                    )}
                                    <div 
                                      onClick={() => setZoomImage(`/${submission.filePath}`)}
                                      className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in hover:scale-105 transition-transform"
                                    >
                                      <img 
                                        src={`/${submission.filePath}`} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="badge badge-red">未提交</span>
                                )}
                                
                                <div className="flex gap-2">
                                  {submission && (
                                    <button 
                                      onClick={() => {
                                        setConfirmConfig({
                                          isOpen: true,
                                          title: '确认撤回',
                                          message: '您确定要撤回并删除这次提交吗？',
                                          onConfirm: async () => {
                                            try {
                                              const res = await fetch(`/api/submissions/${submission.id}`, { 
                                                method: 'DELETE', 
                                                credentials: 'include' 
                                              });
                                              if (res.ok) {
                                                fetchData();
                                              }
                                            } catch (err) {
                                              console.error(err);
                                            }
                                          }
                                        });
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                      title="撤回提交"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                  <label className="cursor-pointer">
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      accept="image/*"
                                      onChange={e => e.target.files?.[0] && handleFileUpload(hw.id, e.target.files[0])}
                                    />
                                    <div className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                                      <Upload size={14} />
                                      {submission ? '重新提交' : '提交作业'}
                                    </div>
                                  </label>
                                </div>
                              </div>

                              {submission?.status === 'graded' && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl"
                                >
                                  <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1">老师评语</p>
                                  <p className="text-xs text-emerald-800 italic">"{submission.feedback}"</p>
                                </motion.div>
                              )}
                            </div>
                          )}

                          {user.role === 'teacher' && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users size={14} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-600">
                                  已提交: {submissions.filter(s => s.homeworkId === hw.id).length}
                                </span>
                              </div>
                              <button 
                                onClick={() => setSelectedHomeworkId(hw.id)}
                                className="btn-ghost text-xs py-1 px-2"
                              >
                                查看详情
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="section-title">学情分析</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Zap className="text-amber-500" size={20} />
                    最近提交动态
                  </h3>
                  <div className="space-y-4">
                    {submissions.slice(0, 5).map(sub => (
                      <div key={sub.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden cursor-zoom-in" onClick={() => setZoomImage(`/${sub.filePath}`)}>
                          <img src={`/${sub.filePath}`} alt="sub" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">学生 ID: {sub.studentId}</span>
                            <span className="text-[10px] text-slate-400">{new Date(sub.submittedAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-500">提交了: {homeworks.find(h => h.id === sub.homeworkId)?.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Award className="text-rose-700" size={20} />
                    班级成绩概览
                  </h3>
                  <div className="space-y-6">
                    {homeworks.map(hw => {
                      const hwSubs = submissions.filter(s => s.homeworkId === hw.id);
                      const gradedSubs = hwSubs.filter(s => s.status === 'graded');
                      const avg = gradedSubs.length > 0 
                        ? (gradedSubs.reduce((acc, s) => acc + (s.grade || 0), 0) / gradedSubs.length).toFixed(1)
                        : 'N/A';
                      
                      return (
                        <div key={hw.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-slate-700">{hw.title}</span>
                            <span className="text-rose-800 font-black">{avg} 分 (均分)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${avg === 'N/A' ? 0 : avg}%` }}
                              className="h-full bg-rose-700 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'children' && (
            <motion.div 
              key="children"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="section-title">孩子学习进度</h2>
              <div className="grid grid-cols-1 gap-6">
                {submissions.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500">目前还没有孩子的作业提交记录</p>
                  </div>
                ) : (
                  submissions.map(sub => {
                    const hw = homeworks.find(h => h.id === sub.homeworkId);
                    return (
                      <div key={sub.id} className="glass-card p-6 flex flex-col md:flex-row gap-6">
                        <div 
                          className="w-full md:w-48 aspect-video md:aspect-square rounded-xl bg-slate-100 overflow-hidden cursor-zoom-in"
                          onClick={() => setZoomImage(`/${sub.filePath}`)}
                        >
                          <img src={`/${sub.filePath}`} alt="作业" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">{hw?.title || '未知作业'}</h3>
                              <p className="text-sm text-slate-500">提交时间: {new Date(sub.submittedAt).toLocaleString()}</p>
                            </div>
                            {sub.status === 'graded' ? (
                              <div className="text-right">
                                <span className="text-3xl font-black text-emerald-600">{sub.grade}分</span>
                                <div className="badge badge-green block mt-1">已批改</div>
                              </div>
                            ) : (
                              <span className="badge badge-orange">待批改</span>
                            )}
                          </div>
                          
                          {sub.status === 'graded' && (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                              <h4 className="text-sm font-bold text-emerald-900 mb-1 flex items-center gap-2">
                                <MessageSquare size={16} />
                                老师评语
                              </h4>
                              <p className="text-emerald-800 text-sm italic">"{sub.feedback}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Create Homework Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">发布新作业</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateHomework} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">作业标题</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="例如：数学周测 - 勾股定理"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">作业描述</label>
                  <textarea 
                    className="input-field min-h-[100px] resize-none" 
                    placeholder="请输入作业的具体要求和注意事项..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">截止日期</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    required
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">取消</button>
                  <button type="submit" className="btn-primary flex-1">确认发布</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Zoom */}
      <AnimatePresence>
        {zoomImage && <ImageZoomModal src={zoomImage} onClose={() => setZoomImage(null)} />}
      </AnimatePresence>

      {/* Submissions Modal for Teacher */}
      <AnimatePresence>
        {selectedHomeworkId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHomeworkId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {homeworks.find(h => h.id === selectedHomeworkId)?.title} - 提交详情
                  </h2>
                  <p className="text-slate-500 text-sm">查看所有学生的提交情况</p>
                </div>
                <button onClick={() => setSelectedHomeworkId(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {submissions.filter(s => s.homeworkId === selectedHomeworkId).length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400">暂无学生提交</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submissions.filter(s => s.homeworkId === selectedHomeworkId).map(sub => (
                      <div key={sub.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 font-bold text-xs">
                              {sub.studentId.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-slate-900">学生 ID: {sub.studentId}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{new Date(sub.submittedAt).toLocaleString()}</span>
                        </div>

                        <div 
                          className="aspect-video w-full rounded-xl bg-slate-200 overflow-hidden cursor-zoom-in relative group"
                          onClick={() => setZoomImage(`/${sub.filePath}`)}
                        >
                          <img 
                            src={`/${sub.filePath}`} 
                            alt="Submission" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="text-white" size={24} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          {sub.status === 'graded' ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="badge badge-green">已批改</span>
                                <span className="text-lg font-black text-emerald-600">{sub.grade}分</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">"{sub.feedback}"</p>
                            </div>
                          ) : (
                            <span className="badge badge-orange">待批改</span>
                          )}
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setConfirmConfig({
                                  isOpen: true,
                                  title: '确认删除',
                                  message: '您确定要删除这份提交吗？',
                                  onConfirm: async () => {
                                    try {
                                      const res = await fetch(`/api/submissions/${sub.id}`, { 
                                        method: 'DELETE', 
                                        credentials: 'include' 
                                      });
                                      if (res.ok) {
                                        fetchData();
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                });
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                              title="删除提交"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setGradingSubmission(sub);
                                setManualGrade(sub.grade?.toString() || '');
                                setManualFeedback(sub.feedback || '');
                              }}
                              className="btn-secondary py-1.5 px-3 text-xs"
                            >
                              手动批改
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Grading Modal */}
      <AnimatePresence>
        {gradingSubmission && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGradingSubmission(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">手动批改作业</h2>
                <button onClick={() => setGradingSubmission(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">评分 (0-100)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="请输入分数"
                    value={manualGrade}
                    onChange={e => setManualGrade(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">老师评语</label>
                  <textarea 
                    className="input-field min-h-[100px] resize-none" 
                    placeholder="请输入对作业的评价..."
                    value={manualFeedback}
                    onChange={e => setManualFeedback(e.target.value)}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button onClick={() => setGradingSubmission(null)} className="btn-secondary flex-1">取消</button>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/grade', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            submissionId: gradingSubmission.id, 
                            grade: parseInt(manualGrade), 
                            feedback: manualFeedback 
                          }),
                          credentials: 'include',
                        });
                        if (res.ok) {
                          setGradingSubmission(null);
                          fetchData();
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="btn-primary flex-1"
                  >
                    保存批改
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rose-800/20 border-t-rose-800 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">正在初始化系统...</p>
        </div>
      </div>
    );
  }

  return user ? (
    <Dashboard user={user} onLogout={() => {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setUser(null);
    }} />
  ) : (
    <LoginPage onLogin={setUser} />
  );
}

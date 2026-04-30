import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Settings, 
  Moon, 
  Sun, 
  Languages, 
  Timer, 
  User, 
  BookOpen, 
  LayoutDashboard,
  Trophy,
  UserCheck,
  ClipboardList,
  Plus,
  Minus,
  RotateCcw,
  Trash2,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  ChevronRight,
  Save,
  AlertTriangle 
} from 'lucide-react';

// --- Types ---
interface Student { id: string; name: string; }
interface Group { id: string; name: string; score: number; }
interface Question { id: number; text: string; type: 'single' | 'multi' | 'true-false'; options: string[]; answer: string | string[]; explanation: string; }

// --- Helpers ---
const Bopomofo = ({ text, ruby, enabled }: { text: string; ruby: string; enabled: boolean }) => {
  if (!enabled) return <>{text}</>;
  return (
    <ruby>
      {text}
      <rt>{ruby}</rt>
    </ruby>
  );
};

// --- Sub-Components ---

// 1. Random Draw Component
function RandomDraw() {
  const [names, setNames] = useState<string>(() => localStorage.getItem('draw_names') || '王小明, 李小華, 張大同, 陳美麗, 林小林');
  const [students, setStudents] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    setStudents(names.split(',').map(n => n.trim()).filter(n => n));
    localStorage.setItem('draw_names', names);
  }, [names]);

  const draw = () => {
    if (students.length === 0) return;
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setSelected(students[Math.floor(Math.random() * students.length)]);
      count++;
      if (count > 20) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 50);
  };

  const removeSelected = () => {
    if (selected) {
      const newNames = students.filter(s => s !== selected).join(', ');
      setNames(newNames);
      setSelected(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <label className="block text-sm font-bold text-zinc-500 mb-2">學員名單 (以逗號分隔)</label>
        <textarea 
          value={names}
          onChange={(e) => setNames(e.target.value)}
          className="w-full h-32 glass-input resize-none"
          placeholder="輸入名單..."
        />
      </div>

      <div className="flex flex-col items-center gap-8 py-10">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected || 'empty'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-64 h-64 rounded-full flex items-center justify-center text-4xl font-bold border-4 shadow-2xl transition-all ${isSpinning ? 'border-brand animate-pulse' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'}`}
            >
              {selected || '準備抽籤'}
            </motion.div>
          </AnimatePresence>
          {isSpinning && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="absolute inset-[-10px] border-4 border-dashed border-brand rounded-full pointer-events-none"
            />
          )}
        </div>

        <div className="flex gap-4">
          <button onClick={draw} disabled={isSpinning || students.length === 0} className="btn-primary px-10 py-4 text-xl">
            {isSpinning ? '抽籤中...' : '開始抽籤'}
          </button>
          {selected && !isSpinning && (
            <button onClick={removeSelected} className="btn-secondary px-6">
              移除此人
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. ScoreBoard Component
function ScoreBoard() {
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('scoreboard_groups');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: '第一組', score: 0 },
      { id: '2', name: '第二組', score: 0 },
      { id: '3', name: '第三組', score: 0 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('scoreboard_groups', JSON.stringify(groups));
  }, [groups]);

  const updateScore = (id: string, delta: number) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, score: g.score + delta } : g));
  };

  const addGroup = () => {
    const newId = (groups.length + 1).toString();
    setGroups([...groups, { id: newId, name: `第 ${newId} 組`, score: 0 }]);
  };

  const sortedGroups = [...groups].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">即時排名</h3>
        <button onClick={addGroup} className="btn-secondary"><Plus className="w-4 h-4" /> 新增小組</button>
      </div>
      <div className="grid gap-4">
        {sortedGroups.map((group, index) => (
          <motion.div
            layout
            key={group.id}
            className="glass-card rounded-2xl p-6 flex items-center justify-between group"
          >
            <div className="flex items-center gap-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${index === 0 ? 'bg-amber-400' : 'bg-zinc-400'}`}>
                {index + 1}
              </div>
              <div>
                <input 
                  value={group.name} 
                  onChange={(e) => setGroups(groups.map(g => g.id === group.id ? {...g, name: e.target.value} : g))}
                  className="bg-transparent border-none font-bold text-xl focus:outline-none dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-3xl font-mono font-bold text-brand">{group.score}</div>
              <div className="flex gap-2">
                <button onClick={() => updateScore(group.id, -1)} className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg"><Minus className="w-4 h-4" /></button>
                <button onClick={() => updateScore(group.id, 1)} className="p-2 bg-brand text-white hover:bg-brand-hover rounded-lg"><Plus className="w-4 h-4" /></button>
                <button onClick={() => updateScore(group.id, 5)} className="px-3 py-2 bg-brand text-white hover:bg-brand-hover rounded-lg font-bold">+5</button>
              </div>
              <button 
                onClick={() => setGroups(groups.filter(g => g.id !== group.id))}
                className="p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 3. Timer Component
function ClassTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const setTime = (minutes: number) => {
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setInitialTime(seconds);
    setIsRunning(false);
  };

  const reset = () => {
    setTimeLeft(initialTime);
    setIsRunning(false);
  };

  const progress = initialTime > 0 ? (timeLeft / initialTime) * 100 : 100;

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90 text-zinc-100 dark:text-zinc-800">
          <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" />
          <motion.circle 
            cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" 
            strokeDasharray="753"
            animate={{ strokeDashoffset: 753 - (753 * progress) / 100 }}
            className="text-brand transition-all duration-1000" 
          />
        </svg>
        <div className="text-6xl font-mono font-bold">
          {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
          {(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        <button onClick={() => setTime(3)} className="btn-secondary">3 分鐘</button>
        <button onClick={() => setTime(5)} className="btn-secondary">5 分鐘</button>
        <button onClick={() => setTime(10)} className="btn-secondary">10 分鐘</button>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setIsRunning(!isRunning)} className="btn-primary px-10 py-4">
          {isRunning ? <Pause /> : <Play />}
          {isRunning ? '暫停' : '開始'}
        </button>
        <button onClick={reset} className="btn-secondary px-6"><RotateCcw /></button>
      </div>
    </div>
  );
}

// 4. Quiz Component
function QuizSystem() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'exam' | 'result'>('intro');
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
  
  const questions: Question[] = [
    { 
      id: 1, 
      type: 'single', 
      text: 'Vue.js 中，哪一個指令用於雙向資料綁定？', 
      options: ['v-bind', 'v-on', 'v-model', 'v-for'], 
      answer: 'v-model',
      explanation: 'v-model 是 Vue 提供實現表單與資料雙向綁定的核心指令。'
    },
    { 
      id: 2, 
      type: 'true-false', 
      text: 'Vue 3 的 Composition API 主要是為了解決程式碼邏輯複用與維護性的問題。', 
      options: ['正確', '錯誤'], 
      answer: '正確',
      explanation: '相較於 Options API，Composition API 讓邏輯更容易封裝與共享。'
    },
    { 
      id: 3, 
      type: 'multi', 
      text: '以下哪些是 Vue 的生命週期鉤子？ (複選)', 
      options: ['onMounted', 'onUpdated', 'onReady', 'onUnmounted'], 
      answer: ['onMounted', 'onUpdated', 'onUnmounted'],
      explanation: 'onReady 不是 Vue 的標準生命週期鉤子。'
    }
  ];

  const handleAnswer = (qid: number, ans: string | string[]) => {
    setUserAnswers(prev => ({ ...prev, [qid]: ans }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      const userAns = userAnswers[q.id];
      if (Array.isArray(q.answer) && Array.isArray(userAns)) {
        if (q.answer.length === userAns.length && q.answer.every(v => userAns.includes(v))) score++;
      } else if (q.answer === userAns) {
        score++;
      }
    });
    return Math.round((score / questions.length) * 100);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {currentStep === 'intro' && (
        <div className="text-center space-y-8">
          <BookOpen className="w-20 h-20 text-brand mx-auto" />
          <h2 className="text-4xl font-bold">隨堂測驗：Vue.js 基礎概念</h2>
          <p className="text-zinc-500">本測驗共有 3 題，包含單選、複選與是非題。測驗結束後將立即公佈解析。</p>
          <button onClick={() => setCurrentStep('exam')} className="btn-primary text-xl px-12 py-4">開始作答</button>
        </div>
      )}

      {currentStep === 'exam' && (
        <div className="space-y-12">
          {questions.map((q, i) => (
            <div key={q.id} className="glass-card rounded-[2rem] p-10 space-y-6">
              <div className="flex items-center gap-3">
                <span className="bg-brand text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">{i + 1}</span>
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{q.type}</span>
              </div>
              <h3 className="text-2xl font-bold">{q.text}</h3>
              <div className="grid gap-3">
                {q.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      if (q.type === 'multi') {
                        const current = (userAnswers[q.id] as string[]) || [];
                        handleAnswer(q.id, current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt]);
                      } else {
                        handleAnswer(q.id, opt);
                      }
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                      (Array.isArray(userAnswers[q.id]) ? (userAnswers[q.id] as string[]).includes(opt) : userAnswers[q.id] === opt)
                        ? 'border-brand bg-brand/5 text-brand'
                        : 'border-zinc-100 dark:border-zinc-800 hover:border-brand/30'
                    }`}
                  >
                    <span>{opt}</span>
                    {(Array.isArray(userAnswers[q.id]) ? (userAnswers[q.id] as string[]).includes(opt) : userAnswers[q.id] === opt) && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button 
            onClick={() => setCurrentStep('result')} 
            disabled={Object.keys(userAnswers).length < questions.length}
            className="w-full btn-primary py-6 text-xl"
          >
            提交測驗卷
          </button>
        </div>
      )}

      {currentStep === 'result' && (
        <div className="space-y-10">
          <div className="glass-card rounded-[2rem] p-10 text-center">
            <h2 className="text-6xl font-bold text-brand mb-4">{calculateScore()} 分</h2>
            <p className="text-zinc-500">測驗完成！以下為詳細解析。</p>
          </div>
          
          {questions.map((q, i) => {
            const isCorrect = Array.isArray(q.answer) 
              ? (q.answer.length === (userAnswers[q.id]?.length || 0) && q.answer.every(v => (userAnswers[q.id] as string[]).includes(v)))
              : q.answer === userAnswers[q.id];

            return (
              <div key={q.id} className="glass-card rounded-[2rem] p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{i + 1}. {q.text}</h3>
                  {isCorrect ? <CheckCircle2 className="text-emerald-500 w-8 h-8" /> : <XCircle className="text-rose-500 w-8 h-8" />}
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-4 font-sans text-left">
                  <div className="flex gap-4">
                    <span className="font-bold">正確答案：</span>
                    <span className="text-brand">{Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-bold">您的回答：</span>
                    <span className={isCorrect ? 'text-emerald-500' : 'text-rose-500'}>
                      {Array.isArray(userAnswers[q.id]) ? (userAnswers[q.id] as string[]).join(', ') : (userAnswers[q.id] as string) || '未作答'}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 italic text-zinc-500">
                    解析：{q.explanation}
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={() => { setCurrentStep('intro'); setUserAnswers({}); }} className="w-full btn-secondary py-6 text-xl">重新挑戰</button>
        </div>
      )}
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'tools' | 'exam'>('home');
  const [toolTab, setToolTab] = useState<'draw' | 'score' | 'timer'>('draw');
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem('dark_mode') || 'false'));
  const [showBopomofo, setShowBopomofo] = useState(() => JSON.parse(localStorage.getItem('bopomofo') || 'false'));

  useEffect(() => {
    localStorage.setItem('dark_mode', JSON.stringify(isDarkMode));
    localStorage.setItem('bopomofo', JSON.stringify(showBopomofo));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode, showBopomofo]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-[#09090b] transition-colors duration-500">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-72 glass-card md:h-screen md:sticky top-0 z-50 p-6 flex flex-col justify-between border-y-0 border-l-0">
        <div className="space-y-10">
          <div className="flex items-center gap-4 px-2">
            <div className="bg-brand w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">教學輔助平台</h1>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">TKU_CS_413730044</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { id: 'home', label: '控制儀表板', icon: LayoutDashboard },
              { id: 'tools', label: '課堂工具箱', icon: Settings },
              { id: 'exam', label: '數位測驗卷', icon: ClipboardList },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <item.icon className="w-6 h-6" />
                <Bopomofo text={item.label} ruby={item.id === 'home' ? 'ㄎㄨㄥˋ ㄓˋ ㄧˊ ㄅㄧㄠˇ ㄅㄢˇ' : item.id === 'tools' ? 'ㄎㄜˋ ㄊㄤˊ ㄍㄨㄥ ㄐㄩˋ ㄒㄧㄤ' : 'ㄕㄨˋ ㄨㄟˋ ㄘㄜˋ ㄧㄢˋ ㄐㄩㄢˋ'} enabled={showBopomofo} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-10">
          <button onClick={() => setShowBopomofo(!showBopomofo)} className="w-full btn-secondary text-sm">
            <Languages className="w-4 h-4" /> 注音 {showBopomofo ? '開啟' : '關閉'}
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full btn-secondary text-sm">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDarkMode ? '淺色模式' : '深色模式'}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="home" className="space-y-12">
              <header>
                <h2 className="text-5xl font-bold tracking-tighter text-gradient mb-4">歡迎來到互動教室</h2>
                <p className="text-xl text-zinc-500">選擇下方工具開始您的課堂。每一項工具都旨在提升互動與學習動能。</p>
              </header>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { id: 'tools', tid: 'draw', title: '隨機抽籤機', desc: '匯入名單，公平抽籤，增加課堂驚喜。', icon: UserCheck },
                  { id: 'tools', tid: 'score', title: '分組記分板', desc: '即時組別競賽，數據排序顯示。', icon: Trophy },
                  { id: 'exam', tid: 'exam', title: '數位測驗系統', desc: '自動閱卷，即時反饋，強化學習效果。', icon: ClipboardList }
                ].map(card => (
                  <button key={card.title} onClick={() => { setActiveTab(card.id as any); if(card.tid) setToolTab(card.tid as any); }} className="glass-card rounded-[2rem] p-8 text-left hover:scale-105 active:scale-95 transition-all group">
                    <div className="bg-brand-light w-14 h-14 rounded-2xl flex items-center justify-center text-brand mb-6 group-hover:bg-brand group-hover:text-white transition-all">
                      <card.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                    <p className="text-zinc-500 text-sm">{card.desc}</p>
                    <ChevronRight className="mt-6 text-brand" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'tools' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="tools" className="space-y-10">
              <div className="flex gap-4 p-2 glass-card rounded-2xl inline-flex flex-wrap">
                {[
                  { id: 'draw', label: '隨機抽籤', icon: UserCheck },
                  { id: 'score', label: '組別記分', icon: Trophy },
                  { id: 'timer', label: '計時器', icon: Timer },
                ].map(btn => (
                  <button
                    key={btn.id}
                    onClick={() => setToolTab(btn.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${toolTab === btn.id ? 'bg-brand text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  >
                    <btn.icon className="w-5 h-5" /> {btn.label}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                {toolTab === 'draw' && <RandomDraw />}
                {toolTab === 'score' && <ScoreBoard />}
                {toolTab === 'timer' && <ClassTimer />}
              </div>
            </motion.div>
          )}

          {activeTab === 'exam' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="exam">
              <QuizSystem />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}



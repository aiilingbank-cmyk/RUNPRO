
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Activity, Trophy, Timer, TrendingUp, Plus, X, Ruler, Clock, Target, 
  Info, Bell, BellOff, AlertCircle, ChevronDown, ChevronUp, Flame, Footprints, Wind, Dumbbell, Trash2, History, BarChart3,
  // Added missing Calendar import
  Calendar
} from 'lucide-react';
import { LoggedWorkout, WorkoutType, AppTheme, TrainingPlan, StrengthExercise } from '../types';
import { WorkoutHistory } from './WorkoutHistory';

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`${color} p-3 rounded-xl text-white transition-colors`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

export const Dashboard: React.FC<{ theme?: AppTheme }> = ({ theme = 'blue' }) => {
  const [workouts, setWorkouts] = useState<LoggedWorkout[]>([
    { id: '1', date: '2023-10-23', mileage: 5, pace: 5.4, type: WorkoutType.EASY },
    { id: '2', date: '2023-10-24', mileage: 8, pace: 5.2, type: WorkoutType.TEMPO },
    { id: '3', date: '2023-10-26', mileage: 10, pace: 5.1, type: WorkoutType.INTERVAL },
    { id: '4', date: '2023-10-27', mileage: 6, pace: 5.5, type: WorkoutType.EASY },
    { id: '5', date: '2023-10-28', mileage: 22, pace: 5.8, type: WorkoutType.LONG },
  ]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [isTodayWorkoutExpanded, setIsTodayWorkoutExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'analytics' | 'history'>('analytics');

  const loadCurrentPlan = () => {
    const savedPlan = localStorage.getItem('runpro_current_plan');
    if (savedPlan) {
      const plan: TrainingPlan = JSON.parse(savedPlan);
      const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
      const todayName = days[new Date().getDay()];
      const found = plan.workouts.find(w => w.day.includes(todayName) || todayName.includes(w.day));
      setTodayWorkout(found || null);
    } else {
      setTodayWorkout(null);
    }
  };

  useEffect(() => {
    loadCurrentPlan();

    // Listen for storage changes from other components (like switching plans)
    const handleStorageChange = () => loadCurrentPlan();
    window.addEventListener('storage', handleStorageChange);

    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
    if (permission === "granted" && todayWorkout) {
      new Notification("RunPro AI: ตารางซ้อมวันนี้", {
        body: `วันนี้คุณมีคิวซ้อม: ${todayWorkout.type} - ${todayWorkout.description}`,
        icon: "/favicon.ico"
      });
    }
  };

  const themeConfig = useMemo(() => {
    const configs = {
      blue: { primary: '#2563eb', secondary: '#f97316', bg: 'bg-blue-600', hover: 'hover:bg-blue-700', shadow: 'shadow-blue-100', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' },
      emerald: { primary: '#059669', secondary: '#f97316', bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', shadow: 'shadow-emerald-100', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' },
      violet: { primary: '#7c3aed', secondary: '#f97316', bg: 'bg-violet-600', hover: 'hover:bg-violet-700', shadow: 'shadow-violet-100', text: 'text-violet-600', light: 'bg-violet-50', border: 'border-violet-200' },
      rose: { primary: '#e11d48', secondary: '#f97316', bg: 'bg-rose-600', hover: 'hover:bg-rose-700', shadow: 'shadow-rose-100', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-200' }
    };
    return configs[theme];
  }, [theme]);

  const [showLogModal, setShowLogModal] = useState(false);
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    hours: '0',
    minutes: '',
    seconds: '0',
    type: WorkoutType.EASY,
    exercises: [] as StrengthExercise[]
  });

  const [exerciseInput, setExerciseInput] = useState({
    name: '',
    sets: 3,
    reps: 12,
    weight: ''
  });

  const addExerciseToLog = () => {
    if (!exerciseInput.name) return;
    setNewLog({
      ...newLog,
      exercises: [...newLog.exercises, { ...exerciseInput }]
    });
    setExerciseInput({ name: '', sets: 3, reps: 12, weight: '' });
  };

  const removeExerciseFromLog = (index: number) => {
    setNewLog({
      ...newLog,
      exercises: newLog.exercises.filter((_, i) => i !== index)
    });
  };

  const calculatedPace = useMemo(() => {
    if (newLog.type === WorkoutType.STRENGTH) return 0;
    const dist = parseFloat(newLog.mileage);
    const hrs = parseInt(newLog.hours || '0');
    const mins = parseInt(newLog.minutes || '0');
    const secs = parseInt(newLog.seconds || '0');
    
    if (dist > 0 && (hrs > 0 || mins > 0 || secs > 0)) {
      const totalMinutes = (hrs * 60) + mins + (secs / 60);
      const pace = totalMinutes / dist;
      return pace;
    }
    return 0;
  }, [newLog.mileage, newLog.hours, newLog.minutes, newLog.seconds, newLog.type]);

  const formatPaceString = (paceValue: number) => {
    if (paceValue === 0) return "--'--\"";
    const minutes = Math.floor(paceValue);
    const seconds = Math.round((paceValue - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };

  const chartData = useMemo(() => {
    const days = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
    const weekData = days.map(day => ({ name: day, mileage: 0, pace: 0, count: 0 }));
    
    workouts.forEach(w => {
      const date = new Date(w.date);
      const dayIdx = (date.getDay() + 6) % 7;
      weekData[dayIdx].mileage += w.mileage;
      weekData[dayIdx].pace += w.pace;
      weekData[dayIdx].count += 1;
    });

    return weekData.map(d => ({
      ...d,
      pace: d.count > 0 ? Number((d.pace / d.count).toFixed(2)) : 0
    }));
  }, [workouts]);

  const stats = useMemo(() => {
    const totalMileage = workouts.reduce((acc, w) => acc + w.mileage, 0);
    const avgPaceValue = workouts.filter(w => w.pace > 0).length > 0 
      ? workouts.filter(w => w.pace > 0).reduce((acc, w) => acc + w.pace, 0) / workouts.filter(w => w.pace > 0).length 
      : 0;
    
    return {
      totalMileage: totalMileage.toFixed(1),
      avgPace: formatPaceString(avgPaceValue),
      sessions: workouts.length,
      avgPaceValue
    };
  }, [workouts]);

  const raceProjections = useMemo(() => {
    const runWorkouts = workouts.filter(w => w.mileage >= 3 && w.pace > 0);
    if (runWorkouts.length === 0) return null;
    const bestRun = runWorkouts.reduce((prev, curr) => (curr.pace < prev.pace ? curr : prev));
    
    const formatTime = (totalMinutes: number) => {
      const h = Math.floor(totalMinutes / 60);
      const m = Math.floor(totalMinutes % 60);
      const s = Math.round((totalMinutes % 1) * 60);
      if (h > 0) return `${h} ชม. ${m} นาที`;
      return `${m} นาที ${s} วินาที`;
    };

    const projectTime = (targetDist: number) => {
      const t1 = bestRun.pace * bestRun.mileage;
      const d1 = bestRun.mileage;
      const d2 = targetDist;
      return t1 * Math.pow(d2 / d1, 1.06);
    };

    return [
      { distance: '5 กม.', label: 'Fun Run', time: formatTime(projectTime(5)) },
      { distance: '10 กม.', label: 'Mini Marathon', time: formatTime(projectTime(10)) },
      { distance: '21.1 กม.', label: 'Half Marathon', time: formatTime(projectTime(21.0975)) },
      { distance: '42.2 กม.', label: 'Full Marathon', time: formatTime(projectTime(42.195)) },
    ];
  }, [workouts]);

  const handleLogWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLog.type !== WorkoutType.STRENGTH && (!newLog.mileage || calculatedPace === 0)) return;
    if (newLog.type === WorkoutType.STRENGTH && newLog.exercises.length === 0) return;
    
    const workout: LoggedWorkout = {
      id: Date.now().toString(),
      date: newLog.date,
      mileage: newLog.type === WorkoutType.STRENGTH ? 0 : parseFloat(newLog.mileage),
      pace: calculatedPace,
      type: newLog.type as WorkoutType,
      exercises: newLog.type === WorkoutType.STRENGTH ? newLog.exercises : undefined
    };
    setWorkouts([...workouts, workout]);
    setShowLogModal(false);
    setNewLog({
      date: new Date().toISOString().split('T')[0],
      mileage: '',
      hours: '0',
      minutes: '',
      seconds: '0',
      type: WorkoutType.EASY,
      exercises: []
    });
  };

  const getWorkoutDetailExtras = (type: string) => {
    switch(type) {
      case WorkoutType.INTERVAL:
        return {
          warmup: "จ็อกเบาๆ 15-20 นาที พร้อมท่า Dynamic Stretching (High Knees, Butt Kicks)",
          drills: "Leg Swings, A-Skips, B-Skips และวอร์มอัพเร่งความเร็ว 4-5 รอบ (Stride)",
          cooldown: "จ็อกช้ามาก (Recovery Jog) 10 นาที และยืดเหยียดแบบนิ่ง (Static Stretching)"
        };
      case WorkoutType.TEMPO:
        return {
          warmup: "วิ่งเบาๆ 10-15 นาที ค่อยๆ ปรับ Pace ให้เข้าใกล้เทมโป",
          drills: "Arm Swings, Ankle Circles และยืดเหยียดกล้ามเนื้อส่วนขา",
          cooldown: "จ็อกเบาๆ 5-10 นาที เพื่อลดระดับการเต้นของหัวใจ"
        };
      case WorkoutType.LONG:
        return {
          warmup: "เริ่มจากการเดินเร็ว 5 นาที แล้วจ็อกช้าที่สุด 10-15 นาที",
          drills: "เน้นการยืดเหยียดข้อต่อสะโพกและเอ็นร้อยหวายเบาๆ",
          cooldown: "ยืดเหยียดทั่วร่างกาย เน้นกล้ามเนื้อน่องและต้นขา 15 นาที"
        };
      case WorkoutType.STRENGTH:
        return {
          warmup: "กระโดดเชือกเบาๆ หรือวิ่งอยู่กับที่ 5 นาที เพื่อให้ร่างกายอุ่น",
          drills: "Dynamic Lunges, Cat-Cow เพื่อคลายกระดูกสันหลัง",
          cooldown: "ยืดเหยียดเน้นกลุ่มกล้ามเนื้อที่ใช้งานหนักในวันนั้น"
        };
      default:
        return {
          warmup: "จ็อกสบายๆ 5-10 นาที พร้อมหมุนข้อต่อ",
          drills: "ยืดเหยียดเบาๆ ตามจุดที่รู้สึกตึง",
          cooldown: "เดินคลายกล้ามเนื้อ 5 นาที และยืดเหยียดหลังซ้อม"
        };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Today's Reminder Section */}
      {todayWorkout ? (
        <div className={`relative overflow-hidden ${themeConfig.light} border-2 ${themeConfig.border} border-opacity-30 rounded-[32px] transition-all duration-300 shadow-sm`}>
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-center md:text-left flex-1">
              <div className={`${themeConfig.bg} p-4 rounded-2xl text-white shadow-lg shrink-0`}>
                {todayWorkout.type === WorkoutType.STRENGTH ? <Dumbbell size={32} /> : <AlertCircle size={32} />}
              </div>
              <div>
                <p className={`text-xs font-bold ${themeConfig.text} uppercase tracking-widest mb-1`}>ตารางซ้อมวันนี้</p>
                <h3 className="text-2xl font-black text-gray-900">{todayWorkout.type}</h3>
                <p className="text-gray-600 text-sm max-w-md">{todayWorkout.description}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => setIsTodayWorkoutExpanded(!isTodayWorkoutExpanded)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all border-2 ${themeConfig.border} ${themeConfig.text} hover:bg-white bg-transparent`}
              >
                {isTodayWorkoutExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                {isTodayWorkoutExpanded ? 'ปิดรายละเอียด' : 'ดูรายละเอียดเพิ่ม'}
              </button>

              <button 
                onClick={requestNotificationPermission}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  notificationsEnabled 
                  ? 'bg-green-100 text-green-700' 
                  : `${themeConfig.bg} text-white hover:opacity-90 shadow-lg ${themeConfig.shadow}`
                }`}
              >
                {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                {notificationsEnabled ? 'เปิดแล้ว' : 'แจ้งเตือน'}
              </button>
            </div>
          </div>

          {isTodayWorkoutExpanded && (
            <div className="px-8 pb-8 animate-slideDown border-t border-gray-100 pt-6">
              {todayWorkout.type === WorkoutType.STRENGTH && todayWorkout.exercises && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Dumbbell size={18} className={themeConfig.text} /> รายการท่าฝึก (Strength Exercises)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todayWorkout.exercises.map((ex: any, idx: number) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{ex.name}</p>
                          <p className="text-xs text-gray-500">{ex.sets} เซต x {ex.reps} ครั้ง</p>
                        </div>
                        {ex.weight && <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{ex.weight}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 p-5 rounded-2xl border border-gray-50">
                  <div className="flex items-center gap-2 mb-3 text-orange-600 font-bold text-sm">
                    <Flame size={16} /> วอร์มอัพ (Warm-up)
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {getWorkoutDetailExtras(todayWorkout.type).warmup}
                  </p>
                </div>

                <div className="bg-white/60 p-5 rounded-2xl border border-gray-50">
                  <div className="flex items-center gap-2 mb-3 text-blue-600 font-bold text-sm">
                    <Footprints size={16} /> ท่าดริลล์ (Drills)
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {getWorkoutDetailExtras(todayWorkout.type).drills}
                  </p>
                </div>

                <div className="bg-white/60 p-5 rounded-2xl border border-gray-50">
                  <div className="flex items-center gap-2 mb-3 text-emerald-600 font-bold text-sm">
                    <Wind size={16} /> คูลดาวน์ (Cool-down)
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {getWorkoutDetailExtras(todayWorkout.type).cooldown}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className={`absolute -right-8 -top-8 w-32 h-32 ${themeConfig.bg} opacity-5 rounded-full pointer-events-none`}></div>
        </div>
      ) : (
        <div className={`relative overflow-hidden bg-gray-50 border-2 border-gray-100 rounded-[32px] p-8 text-center`}>
            <div className="max-w-md mx-auto">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Calendar size={24} />
              </div>
              <p className="text-gray-900 font-bold mb-1">ไม่มีตารางซ้อมสำหรับวันนี้</p>
              <p className="text-gray-400 text-sm">ออกแบบแผนการซ้อม AI เพื่อรับคำแนะนำการฝึกซ้อมรายวัน</p>
            </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setViewMode('analytics')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'analytics' ? `${themeConfig.bg} text-white shadow-md` : 'text-gray-400 hover:text-gray-600'}`}
          >
            <BarChart3 size={18} />
            สถิติโดยรวม
          </button>
          <button 
            onClick={() => setViewMode('history')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'history' ? `${themeConfig.bg} text-white shadow-md` : 'text-gray-400 hover:text-gray-600'}`}
          >
            <History size={18} />
            ประวัติการซ้อม
          </button>
        </div>
        
        <button 
          onClick={() => setShowLogModal(true)}
          className={`${themeConfig.bg} text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 ${themeConfig.hover} transition shadow-lg ${themeConfig.shadow}`}
        >
          <Plus size={20} />
          บันทึกการซ้อม
        </button>
      </div>

      {viewMode === 'analytics' ? (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Activity size={24} />} label="ระยะทางรวม" value={`${stats.totalMileage} กม.`} color={themeConfig.bg} />
            <StatCard icon={<Timer size={24} />} label="Pace เฉลี่ย" value={stats.avgPace} color="bg-orange-500" />
            <StatCard icon={<Trophy size={24} />} label="จำนวนครั้ง" value={stats.sessions.toString()} color="bg-purple-600" />
            <StatCard icon={<TrendingUp size={24} />} label="ความสม่ำเสมอ" value="ดีเยี่ยม" color="bg-emerald-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-6 text-gray-800">ความคืบหน้าสัปดาห์นี้ (กม.)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMileage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeConfig.primary} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={themeConfig.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                      labelFormatter={(label) => `วัน: ${label}`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="mileage" name="ระยะทาง (กม.)" stroke={themeConfig.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorMileage)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Target className={themeConfig.text} size={20} />
                  พยากรณ์เวลาแข่ง
                </h3>
                <div className="group relative">
                  <Info size={16} className="text-gray-400 cursor-help" />
                  <div className="absolute right-0 top-6 w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    คำนวณจากผลงานที่ดีที่สุดของคุณ
                  </div>
                </div>
              </div>
              
              {raceProjections ? (
                <div className="space-y-4">
                  {raceProjections.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                      <div>
                        <p className={`text-[10px] font-bold ${themeConfig.text} uppercase transition-colors`}>{p.label}</p>
                        <p className="text-sm font-bold text-gray-900">{p.distance}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{p.time}</p>
                        <p className="text-[10px] text-gray-400">เวลาโดยประมาณ</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                  <div className="bg-gray-100 p-4 rounded-full mb-3">
                    <Target className="text-gray-300" size={32} />
                  </div>
                  <p className="text-sm text-gray-400 max-w-[200px]">บันทึกข้อมูลการวิ่งเพื่อดูการพยากรณ์เวลาแข่งขันของคุณ</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6 text-gray-800">แนวโน้ม Pace (นาที/กม.)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.filter(d => d.pace > 0)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis reversed axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={['auto', 'auto']} />
                  <Tooltip 
                    labelFormatter={(label) => `วัน: ${label}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="pace" name="Pace" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <WorkoutHistory workouts={workouts} theme={theme} />
      )}

      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 animate-slideIn my-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">บันทึกการซ้อม</h3>
                <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleLogWorkout} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ประเภทการซ้อม</label>
                  <select 
                    value={newLog.type}
                    onChange={e => setNewLog({...newLog, type: e.target.value as WorkoutType})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition font-bold"
                  >
                    <option value={WorkoutType.EASY}>วิ่งสบายๆ (Easy Run)</option>
                    <option value={WorkoutType.INTERVAL}>อินเทอร์วัล (Intervals)</option>
                    <option value={WorkoutType.TEMPO}>เทมโป (Tempo Run)</option>
                    <option value={WorkoutType.LONG}>วิ่งยาว (Long Run)</option>
                    <option value={WorkoutType.STRENGTH}>เวทเทรนนิ่ง (Strength Training)</option>
                    <option value={WorkoutType.REST}>วันพัก (Rest Day)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">วันที่</label>
                  <input 
                    type="date"
                    required
                    value={newLog.date}
                    onChange={e => setNewLog({...newLog, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                {newLog.type !== WorkoutType.STRENGTH ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Ruler size={14} /> ระยะทาง (กม.)
                      </label>
                      <input 
                        type="number"
                        step="0.1"
                        required
                        placeholder="เช่น 10.5"
                        value={newLog.mileage}
                        onChange={e => setNewLog({...newLog, mileage: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Clock size={14} /> เวลาที่ใช้
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <input type="number" placeholder="ชม." min="0" value={newLog.hours} onChange={e => setNewLog({...newLog, hours: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center outline-none transition" />
                        </div>
                        <div className="space-y-1">
                          <input type="number" placeholder="นาที" min="0" max="59" required value={newLog.minutes} onChange={e => setNewLog({...newLog, minutes: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center outline-none transition" />
                        </div>
                        <div className="space-y-1">
                          <input type="number" placeholder="วินาที" min="0" max="59" value={newLog.seconds} onChange={e => setNewLog({...newLog, seconds: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center outline-none transition" />
                        </div>
                      </div>
                    </div>

                    {calculatedPace > 0 && (
                      <div className={`${themeConfig.light} p-4 rounded-2xl flex items-center justify-between border ${themeConfig.border} border-opacity-30`}>
                        <div className="flex items-center gap-2">
                          <Timer className={themeConfig.text} size={20} />
                          <span className="text-sm font-bold text-gray-700">Pace:</span>
                        </div>
                        <span className={`text-xl font-black ${themeConfig.text}`}>
                          {formatPaceString(calculatedPace)}<span className="text-xs ml-1">/กม.</span>
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Dumbbell size={14} /> รายการท่าฝึก (Exercises)
                    </label>
                    <div className="space-y-2">
                      {newLog.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div>
                            <p className="text-sm font-bold">{ex.name}</p>
                            <p className="text-[10px] text-gray-500">{ex.sets} เซต x {ex.reps} ครั้ง {ex.weight && `(${ex.weight})`}</p>
                          </div>
                          <button type="button" onClick={() => removeExerciseFromLog(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-200 space-y-3">
                      <input 
                        type="text" 
                        placeholder="ชื่อท่าฝึก (เช่น Squat)" 
                        value={exerciseInput.name} 
                        onChange={e => setExerciseInput({...exerciseInput, name: e.target.value})}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" placeholder="เซต" value={exerciseInput.sets} onChange={e => setExerciseInput({...exerciseInput, sets: parseInt(e.target.value) || 0})} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm text-center outline-none" />
                        <input type="number" placeholder="ครั้ง" value={exerciseInput.reps} onChange={e => setExerciseInput({...exerciseInput, reps: parseInt(e.target.value) || 0})} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm text-center outline-none" />
                      </div>
                      <input type="text" placeholder="น้ำหนัก (ถ้ามี)" value={exerciseInput.weight} onChange={e => setExerciseInput({...exerciseInput, weight: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none" />
                      <button 
                        type="button" 
                        onClick={addExerciseToLog}
                        className={`w-full ${themeConfig.text} ${themeConfig.light} border ${themeConfig.border} border-opacity-30 py-2 rounded-xl text-xs font-bold hover:bg-white transition`}
                      >
                        + เพิ่มท่าฝึก
                      </button>
                    </div>
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={newLog.type !== WorkoutType.STRENGTH ? calculatedPace === 0 : newLog.exercises.length === 0}
                  className={`w-full ${themeConfig.bg} text-white py-4 rounded-2xl font-bold text-lg ${themeConfig.hover} transition shadow-xl ${themeConfig.shadow} mt-2 disabled:opacity-50`}
                >
                  บันทึกข้อมูล
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

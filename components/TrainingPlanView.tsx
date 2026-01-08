
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { generateMarathonPlan, suggestExercises } from '../services/geminiService';
import { TrainingPlan, WorkoutType, UserProfile, AppTheme, SavedTrainingPlan, PlanRevision, IntermediateGoal, StrengthExercise, Workout } from '../types';
import { 
  Calendar, 
  CheckCircle2, 
  Dumbbell, 
  Zap, 
  MapPin, 
  Loader2, 
  Settings2, 
  User, 
  Flag, 
  Library, 
  Trash2, 
  Plus, 
  Check,
  ChevronRight,
  Clock,
  History,
  ArrowRight,
  Target,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  X,
  Sparkles,
  Share2
} from 'lucide-react';

export const TrainingPlanView: React.FC<{ theme?: AppTheme }> = ({ theme = 'blue' }) => {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedTrainingPlan[]>([]);
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null);
  const [editingWorkoutIdx, setEditingWorkoutIdx] = useState<number | null>(null);
  const [isSuggestingIdx, setIsSuggestingIdx] = useState<number | null>(null);
  
  const themeClasses = useMemo(() => {
    const configs = {
      blue: { primary: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', hover: 'hover:bg-blue-700', shadow: 'shadow-blue-100', border: 'border-blue-100', groupHover: 'hover:border-blue-300', focus: 'focus:ring-blue-500', icon: 'text-blue-600' },
      emerald: { primary: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50', hover: 'hover:bg-emerald-700', shadow: 'shadow-emerald-100', border: 'border-emerald-100', groupHover: 'hover:border-emerald-300', focus: 'focus:ring-emerald-500', icon: 'text-emerald-600' },
      violet: { primary: 'bg-violet-600', text: 'text-violet-600', light: 'bg-violet-50', hover: 'hover:bg-violet-700', shadow: 'shadow-violet-100', border: 'border-violet-100', groupHover: 'hover:border-violet-300', focus: 'focus:ring-violet-500', icon: 'text-violet-600' },
      rose: { primary: 'bg-rose-600', text: 'text-rose-600', light: 'bg-rose-50', hover: 'hover:bg-rose-700', shadow: 'shadow-rose-100', border: 'border-rose-100', groupHover: 'hover:border-rose-300', focus: 'focus:ring-rose-500', icon: 'text-rose-600' }
    };
    return configs[theme];
  }, [theme]);

  // Profile & Config Inputs
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(70);
  const [fitnessLevel, setFitnessLevel] = useState<string>('Intermediate');
  const [targetDistance, setTargetDistance] = useState<5 | 10 | 21.1 | 42.2>(42.2);
  const [targetPaceMinutes, setTargetPaceMinutes] = useState<number>(6);
  const [targetPaceSeconds, setTargetPaceSeconds] = useState<number>(0);
  
  // Intermediate Goal States
  const [useIntermediateGoal, setUseIntermediateGoal] = useState(false);
  const [intermediateDistance, setIntermediateDistance] = useState<5 | 10 | 21.1>(10);
  const [intPaceMinutes, setIntPaceMinutes] = useState<number>(5);
  const [intPaceSeconds, setIntPaceSeconds] = useState<number>(30);

  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 4);
    return date.toISOString().split('T')[0];
  });
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  // View States
  const [showSettings, setShowSettings] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    const collection = localStorage.getItem('runpro_plans_collection');
    if (collection) {
      setSavedPlans(JSON.parse(collection));
    }

    const current = localStorage.getItem('runpro_current_plan');
    if (current) {
      setPlan(JSON.parse(current));
    } else {
      setShowSettings(true);
    }
  }, []);

  const suggestPace = useCallback((distance: number, level: string) => {
    const suggestions: Record<number, Record<string, [number, number]>> = {
      5: { 'Beginner': [6, 30], 'Intermediate': [5, 0], 'Advanced': [4, 0] },
      10: { 'Beginner': [7, 0], 'Intermediate': [5, 30], 'Advanced': [4, 30] },
      21.1: { 'Beginner': [7, 30], 'Intermediate': [6, 0], 'Advanced': [5, 0] },
      42.2: { 'Beginner': [8, 0], 'Intermediate': [6, 30], 'Advanced': [5, 30] }
    };

    const suggested = suggestions[distance]?.[level] || [6, 0];
    setTargetPaceMinutes(suggested[0]);
    setTargetPaceSeconds(suggested[1]);
  }, []);

  const handleDistanceSelect = (val: 5 | 10 | 21.1 | 42.2) => {
    setTargetDistance(val);
    suggestPace(val, fitnessLevel);
  };

  const handleFitnessLevelChange = (val: string) => {
    setFitnessLevel(val);
    suggestPace(targetDistance, val);
  };

  const persistPlanChanges = (updatedPlan: TrainingPlan) => {
    setPlan(updatedPlan);
    localStorage.setItem('runpro_current_plan', JSON.stringify(updatedPlan));

    const updatedCollection = savedPlans.map(p => {
      if (activeSavedPlan && p.id === activeSavedPlan.id) {
        return { ...p, plan: updatedPlan };
      }
      return p;
    });

    setSavedPlans(updatedCollection);
    localStorage.setItem('runpro_plans_collection', JSON.stringify(updatedCollection));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateWorkout = (idx: number, updates: Partial<Workout>) => {
    if (!plan) return;
    const newPlan = { ...plan };
    newPlan.workouts[idx] = { ...newPlan.workouts[idx], ...updates };
    setPlan(newPlan);
  };

  const handleUpdateExercise = (workoutIdx: number, exerciseIdx: number, updates: Partial<StrengthExercise>) => {
    if (!plan) return;
    const newPlan = { ...plan };
    const workout = { ...newPlan.workouts[workoutIdx] };
    if (workout.exercises) {
      const newExercises = [...workout.exercises];
      newExercises[exerciseIdx] = { ...newExercises[exerciseIdx], ...updates };
      workout.exercises = newExercises;
      newPlan.workouts[workoutIdx] = workout;
      setPlan(newPlan);
    }
  };

  const handleAddExercise = (workoutIdx: number) => {
    if (!plan) return;
    const newPlan = { ...plan };
    const workout = { ...newPlan.workouts[workoutIdx] };
    const newExercise: StrengthExercise = { name: 'ท่าใหม่', sets: 3, reps: 10 };
    workout.exercises = workout.exercises ? [...workout.exercises, newExercise] : [newExercise];
    newPlan.workouts[workoutIdx] = workout;
    setPlan(newPlan);
  };

  const handleRemoveExercise = (workoutIdx: number, exerciseIdx: number) => {
    if (!plan) return;
    const newPlan = { ...plan };
    const workout = { ...newPlan.workouts[workoutIdx] };
    if (workout.exercises) {
      workout.exercises = workout.exercises.filter((_, i) => i !== exerciseIdx);
      newPlan.workouts[workoutIdx] = workout;
      setPlan(newPlan);
    }
  };

  const handleSuggestMore = async (workoutIdx: number) => {
    if (!plan) return;
    setIsSuggestingIdx(workoutIdx);
    try {
      const profile: UserProfile = {
        age, gender, height, weight, fitnessLevel: fitnessLevel as any,
        targetDistance,
        targetPace: `${targetPaceMinutes}:${targetPaceSeconds.toString().padStart(2, '0')}`
      };
      const additional = await suggestExercises(plan.workouts[workoutIdx].exercises || [], profile);
      
      const newPlan = { ...plan };
      const workout = { ...newPlan.workouts[workoutIdx] };
      workout.exercises = [...(workout.exercises || []), ...additional];
      newPlan.workouts[workoutIdx] = workout;
      persistPlanChanges(newPlan);
    } catch (err) {
      console.error("Failed to suggest more exercises:", err);
    } finally {
      setIsSuggestingIdx(null);
    }
  };

  const handleShareWorkout = async (workout: Workout) => {
    const shareText = `🏃‍♂️ แผนการซ้อมวันนี้จาก RunPro AI Coach!\n📅 วัน: ${workout.day}\n🎯 ประเภท: ${workout.type}\n📝 รายละเอียด: ${workout.description}${workout.distance ? `\n📏 ระยะทาง: ${workout.distance}` : ''}\n\n#RunProAI #RunningPlan #MarathonTraining`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Training Day',
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      window.location.href = `mailto:?subject=แผนซ้อม RunPro AI - ${workout.day}&body=${encodeURIComponent(shareText)}`;
    }
  };

  const saveToLibrary = (newPlan: TrainingPlan, distance: number) => {
    const distanceLabel = distance === 5 ? '5K' : distance === 10 ? '10K' : distance === 21.1 ? '21.1K' : '42.2K';
    const paceString = `${targetPaceMinutes}:${targetPaceSeconds.toString().padStart(2, '0')}`;
    
    const existingPlanIndex = savedPlans.findIndex(p => p.targetDistance === distance);
    
    let updatedCollection = [...savedPlans];
    const revision: PlanRevision = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      changeNote: existingPlanIndex === -1 ? 'สร้างแผนเริ่มต้น' : 'อัปเดตแผนการฝึก (AI Regenerated)',
      targetDistance: distance,
      targetPace: paceString
    };

    if (existingPlanIndex !== -1) {
      const existing = updatedCollection[existingPlanIndex];
      updatedCollection[existingPlanIndex] = {
        ...existing,
        plan: newPlan,
        history: [revision, ...(existing.history || [])]
      };
    } else {
      const newSavedPlan: SavedTrainingPlan = {
        id: Date.now().toString(),
        name: `แผน ${distanceLabel} - ${newPlan.focus}`,
        targetDistance: distance,
        dateCreated: new Date().toISOString(),
        plan: newPlan,
        history: [revision]
      };
      updatedCollection = [newSavedPlan, ...updatedCollection];
    }
    
    setSavedPlans(updatedCollection);
    localStorage.setItem('runpro_plans_collection', JSON.stringify(updatedCollection));
    
    setPlan(newPlan);
    localStorage.setItem('runpro_current_plan', JSON.stringify(newPlan));
    window.dispatchEvent(new Event('storage'));
  };

  const deletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updated);
    localStorage.setItem('runpro_plans_collection', JSON.stringify(updated));
  };

  const switchActivePlan = (saved: SavedTrainingPlan) => {
    setPlan(saved.plan);
    localStorage.setItem('runpro_current_plan', JSON.stringify(saved.plan));
    window.dispatchEvent(new Event('storage'));
    setShowLibrary(false);
  };

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const intermediateGoal: IntermediateGoal | undefined = useIntermediateGoal ? {
        distance: intermediateDistance,
        targetPace: `${intPaceMinutes}:${intPaceSeconds.toString().padStart(2, '0')}`
      } : undefined;

      const profile: UserProfile = {
        age, gender, height, weight, fitnessLevel: fitnessLevel as any,
        targetDistance,
        targetPace: `${targetPaceMinutes}:${targetPaceSeconds.toString().padStart(2, '0')}`,
        intermediateGoal
      };
      const newPlan = await generateMarathonPlan(profile, targetDate, daysPerWeek);
      saveToLibrary(newPlan, targetDistance);
      setShowSettings(false);
    } catch (error) {
      console.error("Failed to generate training plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case WorkoutType.STRENGTH: return <Dumbbell className="text-purple-500" size={20} />;
      case WorkoutType.INTERVAL: return <Zap className="text-yellow-500" size={20} />;
      case WorkoutType.LONG: return <MapPin className="text-blue-500" size={20} />;
      default: return <Calendar className="text-gray-400" size={20} />;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-orange-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  // Helper to parse duration string like "1 ชม. 30 นาที" or "45 นาที"
  const parseDuration = (duration?: string) => {
    if (!duration) return { hours: 0, minutes: 0 };
    const hMatch = duration.match(/(\d+)\s*ชม/);
    const mMatch = duration.match(/(\d+)\s*นาที/);
    return {
      hours: hMatch ? parseInt(hMatch[1]) : 0,
      minutes: mMatch ? parseInt(mMatch[1]) : 0
    };
  };

  // Helper to format duration components to string
  const formatDurationString = (hours: number, minutes: number) => {
    let parts = [];
    if (hours > 0) parts.push(`${hours} ชม.`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes} นาที`);
    return parts.join(' ');
  };

  const distances = [
    { value: 5, label: '5K', sub: 'Fun Run' },
    { value: 10, label: '10K', sub: 'Mini' },
    { value: 21.1, label: '21.1K', sub: 'Half' },
    { value: 42.2, label: '42.2K', sub: 'Full' }
  ];

  const activeSavedPlan = savedPlans.find(p => plan && JSON.stringify(p.plan) === JSON.stringify(plan));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">แผนการฝึกซ้อม AI</h2>
          <p className="text-gray-500">
            {plan ? `เป้าหมายปัจจุบัน: ${plan.focus}` : "เริ่มต้นออกแบบแผนการซ้อมที่ตรงใจคุณ"}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setShowLibrary(!showLibrary); setShowSettings(false); setShowHistoryFor(null); }}
            className={`flex items-center gap-2 text-sm font-semibold transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 ${showLibrary ? `${themeClasses.text} border-current` : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Library size={18} />
            คลังแผนการฝึก ({savedPlans.length})
          </button>
          <button 
            onClick={() => { setShowSettings(!showSettings); setShowLibrary(false); setShowHistoryFor(null); }}
            className={`flex items-center gap-2 text-sm font-semibold transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 ${showSettings ? `${themeClasses.text} border-current` : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Settings2 size={18} />
            สร้าง/อัปเดตแผน
          </button>
        </div>
      </div>

      {showLibrary && (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4 animate-fadeIn relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Library size={20} className={themeClasses.icon} />
              คลังส่วนตัวของคุณ
            </h3>
            <button onClick={() => setShowLibrary(false)} className="text-gray-400 hover:text-gray-600"><Plus className="rotate-45" size={24} /></button>
          </div>
          {savedPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPlans.map((p) => {
                const isActive = plan && JSON.stringify(p.plan) === JSON.stringify(plan);
                return (
                  <div 
                    key={p.id} 
                    onClick={() => switchActivePlan(p)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col group ${
                      isActive ? `${themeClasses.border} ${themeClasses.light}` : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl shadow-sm ${isActive ? 'bg-white text-green-500' : 'bg-white text-gray-400'}`}>
                          {isActive ? <CheckCircle2 size={24} /> : <Flag size={20} />}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{p.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">
                            {p.targetDistance}K • {new Date(p.dateCreated).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowHistoryFor(p.id); }}
                          className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                          title="ดูประวัติการแก้ไข"
                        >
                          <History size={18} />
                        </button>
                        <button 
                          onClick={(e) => deletePlan(p.id, e)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="ลบแผนนี้"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    {isActive && (
                      <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                         <span className={`text-[10px] font-black ${themeClasses.text} uppercase tracking-tighter`}>กำลังใช้งาน</span>
                         <ArrowRight size={14} className={themeClasses.text} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Library size={48} className="mx-auto mb-3 opacity-10" />
              <p className="text-gray-400 text-sm font-medium">ยังไม่มีแผนที่บันทึกไว้ในคลัง</p>
              <button 
                onClick={() => { setShowSettings(true); setShowLibrary(false); }}
                className={`mt-4 text-xs font-bold ${themeClasses.text} hover:underline`}
              >
                เริ่มสร้างแผนแรกของคุณเลย
              </button>
            </div>
          )}

          {showHistoryFor && (
            <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm rounded-[32px] p-8 flex flex-col overflow-hidden animate-slideIn">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`${themeClasses.light} ${themeClasses.text} p-2 rounded-lg`}>
                    <History size={20} />
                  </div>
                  <h4 className="font-bold text-lg">ประวัติการปรับปรุงแผน</h4>
                </div>
                <button onClick={() => setShowHistoryFor(null)} className="text-gray-400 hover:text-gray-900 transition"><Plus className="rotate-45" size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {savedPlans.find(p => p.id === showHistoryFor)?.history?.map((rev, idx) => (
                  <div key={rev.id} className="relative pl-8 pb-6 border-l-2 border-gray-100 last:border-0 last:pb-0">
                    <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-white ${idx === 0 ? themeClasses.primary : 'bg-gray-200 shadow-sm'}`}></div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">เวอร์ชัน {savedPlans.find(p => p.id === showHistoryFor)?.history?.length! - idx}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(rev.timestamp).toLocaleString('th-TH')}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 font-medium">{rev.changeNote}</p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500">
                          <Flag size={12} /> {rev.targetDistance}K
                        </div>
                        {rev.targetPace && (
                          <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500">
                            <Clock size={12} /> {rev.targetPace}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showSettings && (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8 animate-fadeIn relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-gray-50 rounded-full -mr-32 -mt-32 pointer-events-none opacity-50"></div>
          
          <div>
            <div className="flex items-center gap-2 mb-6 text-gray-800">
              <Flag size={20} className={themeClasses.icon} />
              <h3 className="font-bold text-lg">เลือกระยะทางเป้าหมาย</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {distances.map((dist) => (
                <button
                  key={dist.value}
                  onClick={() => handleDistanceSelect(dist.value as any)}
                  className={`p-6 rounded-[24px] border-2 transition-all text-center group relative overflow-hidden ${
                    targetDistance === dist.value 
                    ? `${themeClasses.border} ${themeClasses.light} border-opacity-100 ring-4 ring-offset-2 ring-transparent` 
                    : 'border-gray-50 hover:border-gray-100 bg-gray-50/50'
                  }`}
                >
                  {targetDistance === dist.value && <div className={`absolute top-0 right-0 p-2 ${themeClasses.text}`}><Check size={16} /></div>}
                  <p className={`text-2xl font-black ${targetDistance === dist.value ? themeClasses.text : 'text-gray-400'} transition-colors`}>
                    {dist.label}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dist.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Intermediate Goal Section */}
          {targetDistance > 5 && (
            <div className="space-y-4">
              <button 
                onClick={() => setUseIntermediateGoal(!useIntermediateGoal)}
                className={`flex items-center justify-between w-full p-6 rounded-[32px] border-2 transition-all ${useIntermediateGoal ? `${themeClasses.border} ${themeClasses.light}` : 'border-dashed border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${useIntermediateGoal ? themeClasses.primary + ' text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Target size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">เพิ่มเป้าหมายย่อย (Intermediate Goal)</p>
                    <p className="text-xs text-gray-400 font-medium">ท้าทายตัวเองด้วยเป้าหมายระหว่างทาง เพื่อให้ AI ปรับตารางซ้อมให้เข้มข้นขึ้น</p>
                  </div>
                </div>
                {useIntermediateGoal ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </button>

              {useIntermediateGoal && (
                <div className="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100 space-y-6 animate-slideDown">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">ระยะเป้าหมายย่อย</label>
                      <div className="flex gap-2">
                        {distances.filter(d => d.value < targetDistance).map(d => (
                          <button 
                            key={d.value}
                            onClick={() => setIntermediateDistance(d.value as any)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${intermediateDistance === d.value ? `${themeClasses.border} bg-white ${themeClasses.text}` : 'bg-transparent border-gray-100 text-gray-400 hover:border-gray-200'}`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Pace เป้าหมายย่อย (นาที/กม.)</label>
                      <div className="flex gap-4 items-center">
                        <input 
                          type="number" 
                          value={intPaceMinutes} 
                          onChange={(e) => setIntPaceMinutes(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-center font-bold"
                        />
                        <span className="font-black text-gray-300">:</span>
                        <input 
                          type="number" 
                          value={intPaceSeconds} 
                          onChange={(e) => setIntPaceSeconds(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-center font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <hr className="border-gray-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-800">
                <User size={18} className={themeClasses.icon} />
                <h3 className="font-bold">ข้อมูลพื้นฐาน</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">เพศ</label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setGender('Male')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${gender === 'Male' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>ชาย</button>
                    <button onClick={() => setGender('Female')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${gender === 'Female' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>หญิง</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">อายุ</label>
                  <input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value))} className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 ${themeClasses.focus} outline-none`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">ส่วนสูง (ซม.)</label>
                  <input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value))} className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 ${themeClasses.focus} outline-none`} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">น้ำหนัก (กก.)</label>
                  <input type="number" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 ${themeClasses.focus} outline-none`} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-800">
                <Zap size={18} className="text-orange-500" />
                <h3 className="font-bold">ตารางการฝึก</h3>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">ระดับความฟิตปัจจุบัน</label>
                <select value={fitnessLevel} onChange={(e) => handleFitnessLevelChange(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none">
                  <option value="Beginner">มือใหม่ (0-10 กม./สัปดาห์)</option>
                  <option value="Intermediate">ปานกลาง (10-30 กม./สัปดาห์)</option>
                  <option value="Advanced">นักวิ่งตัวจริง (30+ กม./สัปดาห์)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">เป้าหมาย Pace (นาที/กม.)</label>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 animate-pulse">
                    <Sparkles size={10} /> แนะนำอัตโนมัติ
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      min="2" 
                      max="15" 
                      value={targetPaceMinutes} 
                      onChange={(e) => setTargetPaceMinutes(parseInt(e.target.value) || 0)} 
                      className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 ${themeClasses.focus} outline-none text-center font-bold`} 
                      placeholder="นาที"
                    />
                  </div>
                  <span className="font-black text-gray-300">:</span>
                  <div className="flex-1">
                    <input 
                      type="number" 
                      min="0" 
                      max="59" 
                      value={targetPaceSeconds} 
                      onChange={(e) => setTargetPaceSeconds(parseInt(e.target.value) || 0)} 
                      className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 ${themeClasses.focus} outline-none text-center font-bold`}
                      placeholder="วินาที"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">ซ้อม/สัปดาห์: {daysPerWeek} วัน</label>
                  <input type="range" min="3" max="7" value={daysPerWeek} onChange={(e) => setDaysPerWeek(parseInt(e.target.value))} className={`w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-current ${themeClasses.text}`} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">วันที่แข่ง (เป้าหมายหลัก)</label>
                  <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none font-bold" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button 
              onClick={fetchPlan}
              disabled={loading}
              className={`${themeClasses.primary} text-white px-12 py-4 rounded-2xl font-bold ${themeClasses.hover} transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl ${themeClasses.shadow} hover:scale-[1.02] active:scale-[0.98]`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  กำลังคำนวณแผนที่ดีที่สุด...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  {savedPlans.some(p => p.targetDistance === targetDistance) ? 'อัปเดตและปรับปรุงแผนเดิม' : 'สร้างและบันทึกแผนใหม่'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm animate-pulse">
          <div className={`${themeClasses.light} p-6 rounded-full mb-6`}>
            <Loader2 className={`animate-spin ${themeClasses.text}`} size={48} />
          </div>
          <p className="text-gray-900 font-bold text-xl mb-2">AI กำลังทำงาน</p>
          <p className="text-gray-400 text-sm max-w-xs text-center">เรากำลังสร้างตารางซ้อมที่เหมาะกับเป้าหมายและร่างกายของคุณโดยเฉพาะ...</p>
        </div>
      ) : plan ? (
        <div className="space-y-6 animate-fadeIn pb-12">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col gap-1">
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.text} bg-white px-5 py-2 rounded-full border border-gray-100 shadow-sm w-fit`}>
                <Flag size={12} /> สัปดาห์นี้: {plan.focus}
              </div>
              {useIntermediateGoal && (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 w-fit">
                  <Target size={10} /> แผนซ้อมมุ่งสู่ {intermediateDistance}K
                </div>
              )}
            </div>
            {activeSavedPlan?.history && activeSavedPlan.history.length > 1 && (
              <button 
                onClick={() => setShowHistoryFor(activeSavedPlan.id)}
                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-blue-500 transition-colors bg-white px-3 py-1.5 rounded-full shadow-xs border border-gray-50"
              >
                <History size={12} /> ดูประวัติการปรับแผน ({activeSavedPlan.history.length - 1} ครั้ง)
              </button>
            )}
            <div className="text-xs font-bold text-gray-300">ตารางซ้อมสัปดาห์ที่ {plan.weekNumber}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.workouts.map((workout, idx) => (
              <div key={idx} className={`bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden`}>
                {/* Compact Day Label & Intensity Dot */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{workout.day}</span>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                      <div className={`w-2 h-2 rounded-full ${getIntensityColor(workout.intensity)}`} />
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{workout.intensity}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleShareWorkout(workout)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors bg-gray-50 rounded-xl"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2.5 rounded-xl group-hover:bg-white transition-colors">
                      {getWorkoutIcon(workout.type)}
                    </div>
                    <h4 className="font-black text-gray-900 text-base uppercase tracking-tight">{workout.type}</h4>
                  </div>
                  
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">{workout.description}</p>
                  
                  {/* Strength Workout Integration */}
                  {workout.type === WorkoutType.STRENGTH && workout.exercises && (
                    <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ท่าฝึกความแข็งแรง</p>
                        <button 
                          onClick={() => editingWorkoutIdx === idx ? setEditingWorkoutIdx(null) : setEditingWorkoutIdx(idx)}
                          className={`text-[9px] font-black uppercase tracking-widest ${editingWorkoutIdx === idx ? 'text-red-500' : 'text-blue-500'} transition-colors`}
                        >
                          {editingWorkoutIdx === idx ? 'เสร็จสิ้น' : 'แก้ไขรายการ'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {workout.exercises.map((ex, i) => (
                          <div key={i} className={`flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border ${editingWorkoutIdx === idx ? 'border-blue-100 bg-white' : 'border-transparent'}`}>
                            {editingWorkoutIdx === idx ? (
                              <div className="flex-1 flex items-center justify-between gap-2">
                                <input 
                                  value={ex.name} 
                                  onChange={(e) => handleUpdateExercise(idx, i, { name: e.target.value })}
                                  className="flex-1 bg-transparent text-[11px] font-bold outline-none"
                                />
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="number" 
                                    value={ex.sets} 
                                    onChange={(e) => handleUpdateExercise(idx, i, { sets: parseInt(e.target.value) || 0 })}
                                    className="w-6 text-center text-[11px] font-black bg-white rounded border border-gray-100"
                                  />
                                  <span className="text-[10px] font-bold text-gray-300">x</span>
                                  <input 
                                    type="number" 
                                    value={ex.reps} 
                                    onChange={(e) => handleUpdateExercise(idx, i, { reps: parseInt(e.target.value) || 0 })}
                                    className="w-6 text-center text-[11px] font-black bg-white rounded border border-gray-100"
                                  />
                                </div>
                                <button onClick={() => handleRemoveExercise(idx, i)} className="text-gray-300 hover:text-red-500"><X size={12} /></button>
                              </div>
                            ) : (
                              <>
                                <span className="text-[11px] font-bold text-gray-700">{ex.name}</span>
                                <span className={`text-[11px] font-black ${themeClasses.text}`}>{ex.sets} x {ex.reps}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {editingWorkoutIdx === idx && (
                        <button 
                          onClick={() => handleAddExercise(idx)}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all font-bold text-[10px]"
                        >
                          <Plus size={12} /> เพิ่มท่าใหม่
                        </button>
                      )}

                      {!editingWorkoutIdx && (
                        <button 
                          onClick={() => handleSuggestMore(idx)}
                          disabled={isSuggestingIdx === idx}
                          className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${themeClasses.text} opacity-70 hover:opacity-100 transition-opacity`}
                        >
                          {isSuggestingIdx === idx ? (
                            <><Loader2 className="animate-spin" size={10} /> โค้ชกำลังประมวลผล...</>
                          ) : (
                            <><Sparkles size={10} /> ขอท่าฝึกเพิ่มด้วย AI</>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {editingWorkoutIdx === idx && workout.type !== WorkoutType.STRENGTH ? (
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                           <MapPin size={12} className="text-gray-400" />
                           <input 
                            type="text"
                            value={workout.distance || ''}
                            onChange={(e) => handleUpdateWorkout(idx, { distance: e.target.value })}
                            className="bg-transparent text-[11px] font-black outline-none w-16"
                            placeholder="ระยะทาง"
                           />
                        </div>
                      ) : (
                        workout.distance && workout.distance !== '0' && (
                          <div className={`flex items-center gap-1.5 ${themeClasses.light} ${themeClasses.text} px-3 py-1.5 rounded-xl text-[10px] font-black border ${themeClasses.border} border-opacity-30`}>
                            <MapPin size={10} /> {workout.distance}
                          </div>
                        )
                      )}
                      
                      {editingWorkoutIdx === idx && workout.type !== WorkoutType.STRENGTH ? (
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                           <Clock size={12} className="text-gray-400" />
                           <div className="flex items-center gap-1">
                             <input 
                              type="number"
                              value={parseDuration(workout.duration).hours}
                              onChange={(e) => {
                                const { minutes } = parseDuration(workout.duration);
                                handleUpdateWorkout(idx, { duration: formatDurationString(parseInt(e.target.value) || 0, minutes) });
                              }}
                              className="bg-transparent text-[11px] font-black outline-none w-6 text-center"
                             />
                             <span className="text-[10px] font-bold text-gray-300">ชม.</span>
                             <input 
                              type="number"
                              value={parseDuration(workout.duration).minutes}
                              onChange={(e) => {
                                const { hours } = parseDuration(workout.duration);
                                handleUpdateWorkout(idx, { duration: formatDurationString(hours, parseInt(e.target.value) || 0) });
                              }}
                              className="bg-transparent text-[11px] font-black outline-none w-6 text-center"
                             />
                             <span className="text-[10px] font-bold text-gray-300">น.</span>
                           </div>
                        </div>
                      ) : (
                        workout.duration && (
                          <div className={`flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-purple-100`}>
                            <Clock size={10} /> {workout.duration}
                          </div>
                        )
                      )}
                    </div>
                    
                    {editingWorkoutIdx === idx ? (
                      <button 
                        onClick={() => {
                          persistPlanChanges(plan);
                          setEditingWorkoutIdx(null);
                        }}
                        className={`${themeClasses.primary} text-white p-2.5 rounded-xl shadow-lg transition-transform active:scale-90`}
                      >
                        <Save size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => setEditingWorkoutIdx(idx)}
                        className="text-gray-200 group-hover:text-gray-400 transition-colors p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 p-20 rounded-[48px] text-center shadow-sm relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none"></div>
           <div className={`${themeClasses.light} w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 ${themeClasses.text} shadow-inner`}>
             <Flag size={44} />
           </div>
           <h3 className="text-3xl font-black text-gray-900 mb-4">กำหนดเป้าหมายใหม่</h3>
           <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">เลือกเป้าหมายที่ท้าทาย แล้วให้ AI ของเราออกแบบก้าวแรกสู่เส้นชัยที่สมบูรณ์แบบให้กับคุณ</p>
           {!showSettings && (
             <button 
              onClick={() => setShowSettings(true)}
              className={`${themeClasses.primary} text-white px-10 py-4 rounded-2xl font-bold shadow-2xl ${themeClasses.shadow} hover:scale-105 transition-transform active:scale-95`}
             >
               เริ่มออกแบบแผนการซ้อม
             </button>
           )}
        </div>
      )}
    </div>
  );
};

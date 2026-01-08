
import React, { useState, useMemo, useEffect } from 'react';
import { generateMarathonPlan } from '../services/geminiService';
import { TrainingPlan, WorkoutType, UserProfile, AppTheme, SavedTrainingPlan } from '../types';
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
  ListChecks, 
  Library, 
  Trash2, 
  Plus, 
  Check,
  ChevronRight
} from 'lucide-react';

export const TrainingPlanView: React.FC<{ theme?: AppTheme }> = ({ theme = 'blue' }) => {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedTrainingPlan[]>([]);
  
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
    // Load collection from storage
    const collection = localStorage.getItem('runpro_plans_collection');
    if (collection) {
      setSavedPlans(JSON.parse(collection));
    }

    // Load current active plan
    const current = localStorage.getItem('runpro_current_plan');
    if (current) {
      setPlan(JSON.parse(current));
    } else {
      setShowSettings(true);
    }
  }, []);

  const saveToLibrary = (newPlan: TrainingPlan, distance: number) => {
    const distanceLabel = distance === 5 ? '5K' : distance === 10 ? '10K' : distance === 21.1 ? '21.1K' : '42.2K';
    const newSavedPlan: SavedTrainingPlan = {
      id: Date.now().toString(),
      name: `แผน ${distanceLabel} - ${newPlan.focus}`,
      targetDistance: distance,
      dateCreated: new Date().toISOString(),
      plan: newPlan
    };
    
    const updatedCollection = [newSavedPlan, ...savedPlans];
    setSavedPlans(updatedCollection);
    localStorage.setItem('runpro_plans_collection', JSON.stringify(updatedCollection));
    
    // Set as active plan
    setPlan(newPlan);
    localStorage.setItem('runpro_current_plan', JSON.stringify(newPlan));
    
    // Notify other components (like Dashboard) that a plan update occurred
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
      const profile: UserProfile = {
        age,
        gender,
        height,
        weight,
        fitnessLevel: fitnessLevel as any,
        targetDistance
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

  const distances = [
    { value: 5, label: '5K', sub: 'Fun Run' },
    { value: 10, label: '10K', sub: 'Mini' },
    { value: 21.1, label: '21.1K', sub: 'Half' },
    { value: 42.2, label: '42.2K', sub: 'Full' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* View Selector Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">แผนการฝึกซ้อม AI</h2>
          <p className="text-gray-500">
            {plan ? `เป้าหมายปัจจุบัน: ${plan.focus}` : "เริ่มต้นออกแบบแผนการซ้อมที่ตรงใจคุณ"}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setShowLibrary(!showLibrary); setShowSettings(false); }}
            className={`flex items-center gap-2 text-sm font-semibold transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 ${showLibrary ? `${themeClasses.text} border-current` : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Library size={18} />
            คลังแผนการฝึก ({savedPlans.length})
          </button>
          <button 
            onClick={() => { setShowSettings(!showSettings); setShowLibrary(false); }}
            className={`flex items-center gap-2 text-sm font-semibold transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 ${showSettings ? `${themeClasses.text} border-current` : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Settings2 size={18} />
            สร้างแผนใหม่
          </button>
        </div>
      </div>

      {/* Library View */}
      {showLibrary && (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
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
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                      isActive ? `${themeClasses.border} ${themeClasses.light}` : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'
                    }`}
                  >
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
                    <div className="flex items-center gap-1">
                      {isActive && <span className={`text-[10px] font-bold ${themeClasses.text} uppercase mr-2 tracking-tighter`}>กำลังใช้งาน</span>}
                      <button 
                        onClick={(e) => deletePlan(p.id, e)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="ลบแผนนี้"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
        </div>
      )}

      {/* Generator Settings View */}
      {showSettings && (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8 animate-fadeIn relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-gray-50 rounded-full -mr-32 -mt-32 pointer-events-none opacity-50"></div>
          
          {/* Goal Selector */}
          <div>
            <div className="flex items-center gap-2 mb-6 text-gray-800">
              <Flag size={20} className={themeClasses.icon} />
              <h3 className="font-bold text-lg">เลือกระยะทางเป้าหมาย</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {distances.map((dist) => (
                <button
                  key={dist.value}
                  onClick={() => setTargetDistance(dist.value as any)}
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

          {/* Biometrics */}
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
                <select value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none">
                  <option value="Beginner">มือใหม่ (0-10 กม./สัปดาห์)</option>
                  <option value="Intermediate">ปานกลาง (10-30 กม./สัปดาห์)</option>
                  <option value="Advanced">นักวิ่งตัวจริง (30+ กม./สัปดาห์)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">จำนวนวันฝึกซ้อม/สัปดาห์: {daysPerWeek} วัน</label>
                <input type="range" min="3" max="7" value={daysPerWeek} onChange={(e) => setDaysPerWeek(parseInt(e.target.value))} className={`w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-current ${themeClasses.text}`} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">วันที่แข่ง (เป้าหมาย)</label>
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none" />
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
                  <Plus size={20} />
                  สร้างและบันทึกแผนใหม่
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Plan View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm animate-pulse">
          <div className={`${themeClasses.light} p-6 rounded-full mb-6`}>
            <Loader2 className={`animate-spin ${themeClasses.text}`} size={48} />
          </div>
          <p className="text-gray-900 font-bold text-xl mb-2">AI กำลังทำงาน</p>
          <p className="text-gray-400 text-sm max-w-xs text-center">เรากำลังสร้างตารางซ้อมที่เหมาะกับหัวใจและสรีระของคุณโดยเฉพาะ...</p>
        </div>
      ) : plan ? (
        <div className="space-y-6 animate-fadeIn pb-12">
          <div className="flex items-center justify-between px-2">
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.text} bg-white px-5 py-2 rounded-full border border-gray-100 shadow-sm`}>
              <Flag size={12} /> สัปดาห์นี้: {plan.focus}
            </div>
            <div className="text-xs font-bold text-gray-300">ตารางซ้อมสัปดาห์ที่ {plan.weekNumber}</div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {plan.workouts.map((workout, idx) => (
              <div key={idx} className={`bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:shadow-md transition-all`}>
                <div className={`bg-gray-50 p-4 rounded-2xl min-w-[100px] text-center group-hover:${themeClasses.light} transition-colors border border-transparent group-hover:border-current group-hover:border-opacity-10`}>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{workout.day}</p>
                  <p className="text-2xl font-black text-gray-900 leading-none">วัน {idx + 1}</p>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-gray-50 p-2.5 rounded-xl">
                      {getWorkoutIcon(workout.type)}
                    </div>
                    <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">{workout.type}</h4>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                      workout.intensity === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                      workout.intensity === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                      'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      LVL: {workout.intensity === 'High' ? 'เข้มข้นสูง' : workout.intensity === 'Medium' ? 'ปานกลาง' : 'เริ่มต้น'}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">{workout.description}</p>
                  
                  {workout.type === WorkoutType.STRENGTH && workout.exercises && (
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                       {workout.exercises.map((ex, i) => (
                         <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100 text-[11px] font-bold">
                           <span className="text-gray-700">{ex.name}</span>
                           <span className={themeClasses.text}>{ex.sets} x {ex.reps}</span>
                         </div>
                       ))}
                     </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {workout.distance && workout.distance !== '0' && (
                      <div className={`flex items-center gap-2 ${themeClasses.light} ${themeClasses.text} px-3 py-1.5 rounded-xl text-[10px] font-black border ${themeClasses.border} border-opacity-30`}>
                        <MapPin size={12} /> {workout.distance}
                      </div>
                    )}
                    {workout.duration && (
                      <div className={`flex items-center gap-2 bg-purple-50/50 text-purple-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-purple-100`}>
                        <Calendar size={12} /> {workout.duration}
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden md:block">
                   <ChevronRight className="text-gray-100 group-hover:text-gray-300 transition-colors" size={32} />
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

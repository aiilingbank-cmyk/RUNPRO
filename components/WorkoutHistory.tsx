import React, { useState, useMemo } from 'react';
import { LoggedWorkout, WorkoutType, AppTheme } from '../types';
import { 
  Calendar, 
  ArrowUpDown, 
  Filter, 
  Ruler, 
  Clock, 
  Dumbbell, 
  Search,
  Zap,
  Activity,
  Share2,
  Wind,
  History,
  TrendingUp,
  Flame,
  Coffee,
  MapPin,
  Map,
  X,
  Navigation,
  ChevronRight,
  Info
} from 'lucide-react';

interface WorkoutHistoryProps {
  workouts: LoggedWorkout[];
  theme: AppTheme;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ workouts, theme }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'mileage' | 'pace'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteWorkout, setSelectedRouteWorkout] = useState<LoggedWorkout | null>(null);

  const themeConfig = useMemo(() => {
    const configs = {
      blue: { text: 'text-blue-600', bg: 'bg-blue-600', hover: 'hover:bg-blue-700', light: 'bg-blue-50', border: 'border-blue-100', shadow: 'shadow-blue-100' },
      emerald: { text: 'text-emerald-600', bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-100', shadow: 'shadow-emerald-100' },
      violet: { text: 'text-violet-600', bg: 'bg-violet-600', hover: 'hover:bg-violet-700', light: 'bg-violet-50', border: 'border-violet-100', shadow: 'shadow-violet-100' },
      rose: { text: 'text-rose-600', bg: 'bg-rose-600', hover: 'hover:bg-rose-700', light: 'bg-rose-50', border: 'border-rose-100', shadow: 'shadow-rose-100' }
    };
    return configs[theme];
  }, [theme]);

  const filteredAndSortedWorkouts = useMemo(() => {
    let result = [...workouts];

    if (filterType !== 'all') {
      result = result.filter(w => w.type === filterType);
    }

    if (searchQuery) {
      result = result.filter(w => 
        w.date.includes(searchQuery) || 
        w.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'mileage') {
        comparison = a.mileage - b.mileage;
      } else if (sortBy === 'pace') {
        comparison = a.pace - b.pace;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [workouts, filterType, sortBy, sortOrder, searchQuery]);

  const summaryStats = useMemo(() => {
    const runsOnly = filteredAndSortedWorkouts.filter(w => w.pace > 0);
    const totalMileage = filteredAndSortedWorkouts.reduce((acc, w) => acc + w.mileage, 0);
    const avgPaceValue = runsOnly.length > 0 
      ? runsOnly.reduce((acc, w) => acc + w.pace, 0) / runsOnly.length 
      : 0;
    
    return {
      totalMileage: totalMileage.toFixed(1),
      avgPace: avgPaceValue,
      totalSessions: filteredAndSortedWorkouts.length
    };
  }, [filteredAndSortedWorkouts]);

  const formatPace = (paceValue: number) => {
    if (paceValue === 0) return "--'--\"";
    const minutes = Math.floor(paceValue);
    const seconds = Math.round((paceValue - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };

  const getWorkoutIcon = (type: WorkoutType) => {
    switch (type) {
      case WorkoutType.EASY: return <Wind size={18} className="text-emerald-500" />;
      case WorkoutType.INTERVAL: return <Zap size={18} className="text-yellow-500" />;
      case WorkoutType.TEMPO: return <TrendingUp size={18} className="text-orange-500" />;
      case WorkoutType.LONG: return <MapPin size={18} className="text-blue-500" />;
      case WorkoutType.STRENGTH: return <Dumbbell size={18} className="text-purple-500" />;
      case WorkoutType.REST: return <Coffee size={18} className="text-gray-400" />;
      default: return <Activity size={18} className="text-gray-400" />;
    }
  };

  const getIntensityStyles = (intensity?: string) => {
    switch (intensity) {
      case 'High': return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Low': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleShare = async () => {
    const shareText = `🏃‍♂️ สรุปผลการซ้อมจาก RunPro AI Coach!\n📊 ระยะทางรวม: ${summaryStats.totalMileage} กม.\n⏱️ Pace เฉลี่ย: ${formatPace(summaryStats.avgPace)} /กม.\n📅 จำนวนเซสชัน: ${summaryStats.totalSessions} ครั้ง\n\n#RunProAI #MarathonTraining #RunningThailand`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RunPro AI Coach Progress',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      window.location.href = `mailto:?subject=สรุปผลการซ้อม RunPro AI Coach&body=${encodeURIComponent(shareText)}`;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className={`${themeConfig.light} ${themeConfig.text} p-4 rounded-2xl`}>
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ระยะรวมที่เลือก</p>
            <h4 className="text-2xl font-black text-gray-900">{summaryStats.totalMileage} <span className="text-xs font-bold text-gray-400">กม.</span></h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl">
            <Flame size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pace เฉลี่ยช่วงนี้</p>
              {/* Fix: Wrapped Lucide icon in span to handle title attribute correctly */}
              <span title="ความเร็วเฉลี่ย (นาทีต่อกิโลเมตร)">
                <Info size={10} className="text-gray-300 cursor-help" />
              </span>
            </div>
            <h4 className="text-2xl font-black text-gray-900">{formatPace(summaryStats.avgPace)} <span className="text-xs font-bold text-gray-400">/กม.</span></h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl">
            <History size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">จำนวนเซสชัน</p>
            <h4 className="text-2xl font-black text-gray-900">{summaryStats.totalSessions} <span className="text-xs font-bold text-gray-400">ครั้ง</span></h4>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-gray-900">ประวัติการซ้อม</h3>
              <button 
                onClick={handleShare}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest ${themeConfig.bg} text-white shadow-xl ${themeConfig.shadow} ${themeConfig.hover} transition-all active:scale-95`}
              >
                <Share2 size={16} />
                แชร์ผลงาน
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="ค้นหาวันที่ หรือประเภท..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
                />
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                <Filter size={16} className="text-gray-400" />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                >
                  <option value="all">ทุกประเภท</option>
                  {Object.values(WorkoutType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => toggleSort('date')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${sortBy === 'date' ? `${themeConfig.bg} text-white shadow-lg ${themeConfig.shadow}` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <Calendar size={14} /> วันที่ {sortBy === 'date' && <ArrowUpDown size={12} />}
            </button>
            <button 
              onClick={() => toggleSort('mileage')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${sortBy === 'mileage' ? `${themeConfig.bg} text-white shadow-lg ${themeConfig.shadow}` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <Ruler size={14} /> ระยะทาง {sortBy === 'mileage' && <ArrowUpDown size={12} />}
            </button>
            <button 
              onClick={() => toggleSort('pace')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${sortBy === 'pace' ? `${themeConfig.bg} text-white shadow-lg ${themeConfig.shadow}` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <Clock size={14} /> Pace {sortBy === 'pace' && <ArrowUpDown size={12} />}
              {/* Fix: Wrapped Lucide icon in span to handle title attribute correctly */}
              <span title="ความเร็วเฉลี่ย (นาทีต่อกิโลเมตร)">
                <Info size={10} className="ml-1 text-gray-400 opacity-50" />
              </span>
            </button>
          </div>
        </div>

        {/* Compact Card-Based Workout List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedWorkouts.map((workout) => (
            <div key={workout.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gray-50 group-hover:${themeConfig.light} transition-colors ${themeConfig.text}`}>
                      {getWorkoutIcon(workout.type)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{workout.type}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(workout.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getIntensityStyles(workout.intensity)}`}>
                    {workout.intensity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-50 flex flex-col items-center justify-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">ระยะทาง</p>
                    <p className="text-sm font-black text-gray-900">{workout.type === WorkoutType.STRENGTH ? 'N/A' : `${workout.mileage} กม.`}</p>
                  </div>
                  <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-50 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{workout.type === WorkoutType.STRENGTH ? 'ท่าฝึก' : 'PACE'}</p>
                      {workout.type !== WorkoutType.STRENGTH && (
                        /* Fix: Wrapped Lucide icon in span to handle title attribute correctly */
                        <span title="นาทีต่อกิโลเมตร">
                          <Info size={8} className="text-gray-300" />
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-black ${themeConfig.text}`}>
                      {workout.type === WorkoutType.STRENGTH ? (workout.exercises?.length || 0) : formatPace(workout.pace)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                {workout.type !== WorkoutType.STRENGTH && workout.mileage > 0 ? (
                  <button 
                    onClick={() => setSelectedRouteWorkout(workout)}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Map size={14} /> ดูเส้นทาง
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-300">
                    <History size={14} /> Logged
                  </div>
                )}
                <div className="p-1.5 rounded-lg bg-gray-50 text-gray-300 group-hover:text-gray-400 transition-colors">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}

          {filteredAndSortedWorkouts.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-gray-100">
              <div className="max-w-xs mx-auto space-y-3">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                  <History size={32} />
                </div>
                <p className="text-gray-400 text-sm font-black uppercase tracking-widest">ไม่พบประวัติการซ้อม</p>
                <p className="text-gray-300 text-xs">ลองเปลี่ยนเงื่อนไขการค้นหาหรือบันทึกการซ้อมใหม่</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Route Visualization Modal */}
      {selectedRouteWorkout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 animate-slideIn">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">สรุปเส้นทางวิ่ง</h3>
                  <p className="text-sm text-gray-400 font-medium">
                    {new Date(selectedRouteWorkout.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => setSelectedRouteWorkout(null)} className="text-gray-400 hover:text-gray-600 transition p-2 bg-gray-50 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">ระยะทาง</p>
                    <p className={`text-lg font-black ${themeConfig.text}`}>{selectedRouteWorkout.mileage} กม.</p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">PACE เฉลี่ย</p>
                      {/* Fix: Wrapped Lucide icon in span to handle title attribute correctly */}
                      <span title="นาทีต่อกิโลเมตร">
                        <Info size={8} className="text-gray-300" />
                      </span>
                    </div>
                    <p className="text-lg font-black text-gray-900">{formatPace(selectedRouteWorkout.pace)}</p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">หัวใจเฉลี่ย</p>
                    <p className="text-lg font-black text-red-500">145 <span className="text-[10px]">bpm</span></p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">แคลอรี่</p>
                    <p className="text-lg font-black text-orange-500">{(selectedRouteWorkout.mileage * 60).toFixed(0)} <span className="text-[10px]">kcal</span></p>
                 </div>
              </div>

              {/* Route Placeholder Map */}
              <div className="relative aspect-video bg-blue-50/30 rounded-[32px] border border-blue-100/50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                </div>
                
                <svg width="80%" height="80%" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-lg">
                  <path 
                    d="M20 80C20 80 40 20 80 20C120 20 100 80 140 80C180 80 180 40 180 40" 
                    stroke={themeConfig.bg === 'bg-blue-600' ? '#2563eb' : themeConfig.bg === 'bg-emerald-600' ? '#059669' : themeConfig.bg === 'bg-violet-600' ? '#7c3aed' : '#e11d48'} 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeDasharray="8 4"
                    className="animate-[dash_5s_linear_infinite]"
                  />
                  <circle cx="20" cy="80" r="4" fill="#10b981" />
                  <circle cx="180" cy="40" r="4" fill="#ef4444" />
                </svg>

                <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-sm text-[10px] font-bold text-gray-600">
                  <Navigation size={12} className={themeConfig.text} />
                  Visualization generated from activity logs
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                 <button 
                  onClick={() => setSelectedRouteWorkout(null)}
                  className="flex-1 py-4 rounded-2xl font-bold bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all"
                 >
                   ปิดหน้าต่าง
                 </button>
                 <button 
                  className={`flex-[2] py-4 rounded-2xl font-bold ${themeConfig.bg} text-white shadow-xl ${themeConfig.shadow} hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
                 >
                   <Share2 size={18} />
                   แชร์เส้นทางนี้
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  );
};

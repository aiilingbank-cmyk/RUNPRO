
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
  Share2
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

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(w => w.type === filterType);
    }

    // Search query
    if (searchQuery) {
      result = result.filter(w => 
        w.date.includes(searchQuery) || 
        w.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sorting
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
      // Fallback: Open mailto
      window.location.href = `mailto:?subject=สรุปผลการซ้อม RunPro AI Coach&body=${encodeURIComponent(shareText)}`;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className={`${themeConfig.light} ${themeConfig.text} p-3 rounded-2xl`}>
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ระยะทางรวมที่เลือก</p>
            <h4 className="text-xl font-black text-gray-900">{summaryStats.totalMileage} <span className="text-xs font-bold text-gray-400">กม.</span></h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pace เฉลี่ยช่วงนี้</p>
            <h4 className="text-xl font-black text-gray-900">{formatPace(summaryStats.avgPace)} <span className="text-xs font-bold text-gray-400">/กม.</span></h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จำนวนเซสชัน</p>
            <h4 className="text-xl font-black text-gray-900">{summaryStats.totalSessions} <span className="text-xs font-bold text-gray-400">ครั้ง</span></h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters & Header */}
        <div className="p-6 md:p-8 border-b border-gray-50 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-gray-900">รายการซ้อมตามเงื่อนไข</h3>
              <button 
                onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${themeConfig.bg} text-white shadow-lg ${themeConfig.shadow} ${themeConfig.hover} transition-all active:scale-95`}
              >
                <Share2 size={14} />
                แชร์ผลงาน
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="ค้นหาวันที่ หรือประเภท..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                <Filter size={14} className="text-gray-400" />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-sm font-medium text-gray-600 outline-none cursor-pointer"
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
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${sortBy === 'date' ? `${themeConfig.bg} text-white shadow-md` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <Calendar size={14} /> วันที่ {sortBy === 'date' && <ArrowUpDown size={12} />}
            </button>
            <button 
              onClick={() => toggleSort('mileage')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${sortBy === 'mileage' ? `${themeConfig.bg} text-white shadow-md` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <Ruler size={14} /> ระยะทาง {sortBy === 'mileage' && <ArrowUpDown size={12} />}
            </button>
            <button 
              onClick={() => toggleSort('pace')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${sortBy === 'pace' ? `${themeConfig.bg} text-white shadow-md` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <Clock size={14} /> Pace {sortBy === 'pace' && <ArrowUpDown size={12} />}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">วันที่</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ประเภท</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">ระยะทาง / ท่าฝึก</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">ผลลัพธ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSortedWorkouts.map((workout) => (
                <tr key={workout.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${themeConfig.light} ${themeConfig.text}`}>
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{new Date(workout.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[10px] text-gray-400 font-medium">บันทึกเรียบร้อย</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      workout.type === WorkoutType.STRENGTH ? 'bg-purple-50 text-purple-600 border-purple-100' :
                      workout.type === WorkoutType.LONG ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      workout.type === WorkoutType.INTERVAL ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {workout.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {workout.type === WorkoutType.STRENGTH && workout.exercises ? (
                      <div className="flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                        <Dumbbell size={14} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">{workout.exercises.length} ท่าฝึก</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                        <Ruler size={14} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">{workout.mileage} กม.</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    {workout.type !== WorkoutType.STRENGTH ? (
                      <div>
                        <p className={`text-sm font-black ${themeConfig.text}`}>{formatPace(workout.pace)}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Pace เฉลี่ย</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-black text-purple-600">สำเร็จ</p>
                        <p className="text-[10px] text-gray-400 font-medium">เวทเทรนนิ่ง</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAndSortedWorkouts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center">
                    <p className="text-gray-400 text-sm font-medium">ไม่พบข้อมูลการซ้อมตามที่ระบุ</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useMemo, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TrainingPlanView } from './components/TrainingPlanView';
import { AICoachChat } from './components/AICoachChat';
import { AppTheme } from './types';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Bell, 
  Search,
  ChevronRight,
  Palette,
  User,
  X,
  Check
} from 'lucide-react';

const AVATAR_OPTIONS = ['64', '65', '103', '177', '209', '338', '342', '442', '550', '633', '823', '900'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plan' | 'coach'>('dashboard');
  const [theme, setTheme] = useState<AppTheme>('blue');
  const [avatarId, setAvatarId] = useState<string>(() => localStorage.getItem('runpro_avatar_id') || '64');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('runpro_avatar_id', avatarId);
  }, [avatarId]);

  // Mapping theme to tailwind classes
  const themeClasses = useMemo(() => {
    const map = {
      blue: { primary: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600', light: 'bg-blue-50', shadow: 'shadow-blue-200', hover: 'hover:bg-blue-700', active: 'bg-blue-600' },
      emerald: { primary: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', light: 'bg-emerald-50', shadow: 'shadow-emerald-200', hover: 'hover:bg-emerald-700', active: 'bg-emerald-600' },
      violet: { primary: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-600', light: 'bg-violet-50', shadow: 'shadow-violet-200', hover: 'hover:bg-violet-700', active: 'bg-violet-600' },
      rose: { primary: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', light: 'bg-rose-50', shadow: 'shadow-rose-200', hover: 'hover:bg-rose-700', active: 'bg-rose-600' }
    };
    return map[theme];
  }, [theme]);

  const NavItem: React.FC<{ id: typeof activeTab, icon: React.ReactNode, label: string }> = ({ id, icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-200 ${
        activeTab === id 
        ? `${themeClasses.active} text-white shadow-lg ${themeClasses.shadow}` 
        : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 animate-slideIn">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">เลือกตัวตนของคุณ</h3>
                  <p className="text-sm text-gray-400 font-medium">เปลี่ยนรูปโปรไฟล์ให้นักวิ่งของคุณ</p>
                </div>
                <button onClick={() => setIsAvatarModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-2 bg-gray-50 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {AVATAR_OPTIONS.map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      setAvatarId(id);
                      setIsAvatarModalOpen(false);
                    }}
                    className={`relative rounded-3xl overflow-hidden aspect-square border-4 transition-all hover:scale-105 active:scale-95 ${
                      avatarId === id ? `border-current ${themeClasses.text} ring-4 ring-offset-2 ring-transparent` : 'border-transparent hover:border-gray-100'
                    }`}
                  >
                    <img 
                      src={`https://picsum.photos/id/${id}/200/200`} 
                      alt={`Avatar ${id}`} 
                      className="w-full h-full object-cover"
                    />
                    {avatarId === id && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-white text-green-600 p-1.5 rounded-full shadow-lg">
                          <Check size={16} strokeWidth={4} />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsAvatarModalOpen(false)}
                className={`w-full mt-8 py-4 rounded-2xl font-bold transition-all ${themeClasses.primary} text-white ${themeClasses.hover} shadow-xl ${themeClasses.shadow}`}
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 p-8 flex flex-col sticky top-0 h-screen hidden lg:flex">
        <div className="flex items-center space-x-3 mb-12">
          <div className={`w-10 h-10 ${themeClasses.primary} rounded-xl flex items-center justify-center text-white font-bold text-xl transition-colors`}>R</div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">RunPro AI</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem id="dashboard" icon={<LayoutDashboard size={20} />} label="ภาพรวม" />
          <NavItem id="plan" icon={<Calendar size={20} />} label="แผนการฝึกซ้อม" />
          <NavItem id="coach" icon={<MessageSquare size={20} />} label="โค้ช AI" />
          <div className="pt-4">
             <p className="px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">ปรับแต่งธีม</p>
             <div className="px-6 flex gap-2">
                {(['blue', 'emerald', 'violet', 'rose'] as AppTheme[]).map(t => (
                  <button 
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${theme === t ? 'border-gray-400' : 'border-transparent'} ${
                      t === 'blue' ? 'bg-blue-600' : t === 'emerald' ? 'bg-emerald-600' : t === 'violet' ? 'bg-violet-600' : 'bg-rose-600'
                    }`}
                  />
                ))}
             </div>
          </div>
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-100">
          <button 
            onClick={() => setIsAvatarModalOpen(true)}
            className={`${themeClasses.light} p-4 rounded-2xl flex items-center justify-between transition-all w-full group hover:shadow-md border border-transparent hover:border-gray-100`}
          >
            <div className="flex items-center space-x-3 text-left">
              <img 
                src={`https://picsum.photos/id/${avatarId}/100/100`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" 
              />
              <div>
                <p className="text-sm font-black text-gray-900">Alex Runner</p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.text} transition-colors`}>Pro Plan</p>
              </div>
            </div>
            <div className={`p-1 rounded-lg bg-white/50 group-hover:bg-white transition-colors`}>
              <ChevronRight size={16} className={themeClasses.text} />
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="lg:hidden flex items-center space-x-3">
             <div className={`w-8 h-8 ${themeClasses.primary} rounded-lg flex items-center justify-center text-white font-bold transition-colors`}>R</div>
             <span className="font-bold">RunPro</span>
          </div>
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาข้อมูล, การวิ่ง, คำแนะนำ..." 
              className="bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-3 w-80 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="md:hidden flex gap-2 mr-2">
                {(['blue', 'emerald', 'violet', 'rose'] as AppTheme[]).map(t => (
                  <button 
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`w-5 h-5 rounded-full ${t === 'blue' ? 'bg-blue-600' : t === 'emerald' ? 'bg-emerald-600' : t === 'violet' ? 'bg-violet-600' : 'bg-rose-600'}`}
                  />
                ))}
            </div>
            <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-500 hover:text-blue-600 transition relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div 
              onClick={() => setIsAvatarModalOpen(true)}
              className="md:hidden cursor-pointer"
            >
              <img 
                src={`https://picsum.photos/id/${avatarId}/100/100`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" 
              />
            </div>
            <button className="bg-white border border-gray-100 rounded-2xl px-5 py-3 font-bold text-gray-800 shadow-sm hidden sm:block">
              เป้าหมายวันนี้: 85%
            </button>
          </div>
        </header>

        {/* Mobile Nav */}
        <nav className="lg:hidden flex justify-around mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
           <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? `${themeClasses.primary} text-white` : 'text-gray-400'}`}><LayoutDashboard size={20} /></button>
           <button onClick={() => setActiveTab('plan')} className={`p-3 rounded-xl transition-colors ${activeTab === 'plan' ? `${themeClasses.primary} text-white` : 'text-gray-400'}`}><Calendar size={20} /></button>
           <button onClick={() => setActiveTab('coach')} className={`p-3 rounded-xl transition-colors ${activeTab === 'coach' ? `${themeClasses.primary} text-white` : 'text-gray-400'}`}><MessageSquare size={20} /></button>
        </nav>

        {/* Active View */}
        <div className="pb-20">
          {activeTab === 'dashboard' && <Dashboard theme={theme} />}
          {activeTab === 'plan' && <TrainingPlanView theme={theme} />}
          {activeTab === 'coach' && <AICoachChat theme={theme} />}
        </div>
      </main>
    </div>
  );
};

export default App;

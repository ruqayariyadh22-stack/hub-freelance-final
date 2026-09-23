import React, { useState } from 'react';
import {
  Users,
  Search,
  Star,
  DollarSign,
  Briefcase,
  CheckCircle,
  Filter,
  ArrowUpRight,
  Sparkles,
  Award
} from 'lucide-react';
import { FreelancerItem } from '../../types';

interface FreelancersDirectoryViewProps {
  freelancers: FreelancerItem[];
  onInviteFreelancer: (freelancer: FreelancerItem) => void;
  isArabic: boolean;
}

export const FreelancersDirectoryView: React.FC<FreelancersDirectoryViewProps> = ({
  freelancers,
  onInviteFreelancer,
  isArabic
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredFreelancers = freelancers.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'all' ? true : f.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isArabic ? 'تصفح نخبة المستقلين (Freelancers Directory)' : 'Find Freelancers'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isArabic
              ? 'ابحث عن أفضل الكفاءات في مجالات البرمجة والتصميم والتسويق ودعوتهم لمشاريعك'
              : 'Browse verified top talent, inspect portfolios, and invite directly to your projects'}
          </p>
        </div>

        {/* Categories quick pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { id: 'all', label: isArabic ? 'الكل' : 'All' },
            { id: 'Development', label: isArabic ? 'تطوير وبرمجة' : 'Development' },
            { id: 'Design', label: isArabic ? 'تصميم و UI/UX' : 'Design' },
            { id: 'Writing', label: isArabic ? 'كتابة وسيو' : 'Writing' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                categoryFilter === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isArabic
                ? 'ابحث بالاسم، المهارة (React, Figma, SEO...)، أو التخصص...'
                : 'Search by name, skill (React, Figma, SEO...), or specialty...'
            }
            className="w-full text-xs bg-slate-50 rounded-xl py-2.5 ps-10 pe-4 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Freelancers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFreelancers.map((freelancer) => (
          <div
            key={freelancer.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <img
                      src={freelancer.avatar}
                      alt={freelancer.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                    />
                    <span className="absolute -bottom-1 -end-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{freelancer.name}</h3>
                      {freelancer.badge && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-0.5">
                          <Award className="w-3 h-3 text-amber-500" />
                          {freelancer.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">
                      {freelancer.specialty}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {freelancer.ratingAvg}
                      </span>
                      <span>•</span>
                      <span>{freelancer.experienceYears} {isArabic ? 'سنوات خبرة' : 'yrs exp'}</span>
                      <span>•</span>
                      <span>{freelancer.completedProjectsCount} {isArabic ? 'مشروع منجز' : 'jobs done'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-end shrink-0">
                  <span className="text-base font-extrabold text-slate-900">
                    ${freelancer.hourlyRate}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{isArabic ? '/ ساعة' : '/ hr'}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-600 mt-3.5 leading-relaxed line-clamp-2">
                {freelancer.bio}
              </p>

              {/* Skills badges */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {freelancer.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Portfolio Previews */}
              {freelancer.portfolio.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    {isArabic ? 'نماذج من الأعمال السابقة:' : 'Portfolio Samples:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {freelancer.portfolio.map((item, pIdx) => (
                      <div key={pIdx} className="relative rounded-xl overflow-hidden h-20 group border border-slate-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-1.5">
                          <span className="text-[10px] font-semibold text-white truncate">
                            {item.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isArabic ? 'متاح للعمل فوراً' : 'Available now'}
              </span>

              <button
                onClick={() => onInviteFreelancer(freelancer)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <span>{isArabic ? 'دعوة لمشروعي' : 'Invite to Project'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  FolderPlus,
  Search,
  Filter,
  Eye,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types';

interface ProjectsViewProps {
  projects: Project[];
  openNewProjectModal: () => void;
  onSelectProjectProposals: (projectId: string) => void;
  onOpenWorkspaceForProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  isArabic: boolean;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  openNewProjectModal,
  onSelectProjectProposals,
  onOpenWorkspaceForProject,
  onDeleteProject,
  isArabic
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter((proj) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'open'
        ? proj.status === 'open'
        : proj.status === statusFilter;
    const matchesSearch =
      proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isArabic ? 'مفتوح للعروض' : 'Open for Bids'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            {isArabic ? 'قيد التنفيذ' : 'In Progress'}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle className="w-3.5 h-3.5" />
            {isArabic ? 'مكتمل ومستلم' : 'Completed'}
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            {isArabic ? 'مسودة' : 'Draft'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header Controls (Matching Screen 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isArabic ? 'إدارة المشاريع (Projects)' : 'Projects'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isArabic
              ? 'متابعة كافة المشاريع المنشورة، مراجعة العروض المقدمة، وفتح مساحات العمل'
              : 'Manage client projects and track progress across all stages'}
          </p>
        </div>

        <button
          onClick={openNewProjectModal}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto active:scale-95"
        >
          <FolderPlus className="w-4 h-4" />
          <span>{isArabic ? '+ نشر مشروع جديد' : '+ Add Project'}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {[
              { id: 'all', label: isArabic ? 'الكل' : 'All' },
              { id: 'open', label: isArabic ? 'مفتوح للعروض' : 'Active / Open' },
              { id: 'in_progress', label: isArabic ? 'قيد التنفيذ' : 'In Progress' },
              { id: 'completed', label: isArabic ? 'مكتملة' : 'Completed' },
              { id: 'draft', label: isArabic ? 'مسودات' : 'Drafts' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  statusFilter === tab.id
                    ? 'bg-[#122338] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box inside filter */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isArabic ? 'تصفية المشاريع...' : 'Filter projects...'}
              className="w-full text-xs bg-slate-50 rounded-xl py-2 ps-9 pe-3 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Projects Table (Matching Screen 4 layout) */}
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50/80 text-slate-400 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-4 text-start">{isArabic ? 'عنوان المشروع والتصنيف' : 'Title & Category'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'الميزانية المتوقعة' : 'Budget'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'المدة' : 'Duration'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'العروض المستلمة' : 'Proposals'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'الموعد النهائي' : 'Deadline'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-end">{isArabic ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    {isArabic ? 'لا توجد مشاريع تطابق خيارات التصفية' : 'No projects found'}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {proj.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {proj.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {isArabic ? `نُشر في: ${proj.publishedAt}` : `Published: ${proj.publishedAt}`}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${proj.budgetMin} - ${proj.budgetMax}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {proj.durationDays} {isArabic ? 'يوم' : 'days'}
                    </td>

                    <td className="py-3.5 px-4">
                      {proj.proposalsCount > 0 ? (
                        <button
                          onClick={() => onSelectProjectProposals(proj.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                        >
                          <Users className="w-3 h-3" />
                          <span>{proj.proposalsCount} {isArabic ? 'عروض' : 'bids'}</span>
                          <Sparkles className="w-3 h-3 text-amber-500" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">{isArabic ? 'لا توجد عروض' : '0 bids'}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {proj.deadline}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(proj.status)}
                    </td>

                    <td className="py-3.5 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        {proj.status === 'open' && proj.proposalsCount > 0 && (
                          <button
                            onClick={() => onSelectProjectProposals(proj.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                            title={isArabic ? 'مراجعة العروض' : 'Review Proposals'}
                          >
                            <Eye className="w-3 h-3" />
                            <span>{isArabic ? 'العروض' : 'Proposals'}</span>
                          </button>
                        )}

                        {proj.status === 'in_progress' && (
                          <button
                            onClick={() => onOpenWorkspaceForProject(proj.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                            title={isArabic ? 'مساحة العمل' : 'Workspace'}
                          >
                            <Briefcase className="w-3 h-3" />
                            <span>{isArabic ? 'مساحة العمل' : 'Workspace'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteProject(proj.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title={isArabic ? 'حذف المشروع' : 'Delete Project'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination (Matching Screen 4) */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            {isArabic
              ? `عرض 1 - ${filteredProjects.length} من إجمالي ${projects.length} مشاريع`
              : `Showing 1 - ${filteredProjects.length} of ${projects.length} projects`}
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50">
              &lt;
            </button>
            <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">2</button>
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

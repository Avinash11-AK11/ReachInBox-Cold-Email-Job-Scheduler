import React, { useState } from 'react';
import {
  LayoutDashboard,
  Clock,
  Send,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

import logoImg from '../assets/logo.png';
import logoColapsImg from '../assets/logo_colaps.png';
import { HelpModal } from './HelpModal';

interface SidebarProps {
  activeTab: 'dashboard' | 'scheduled' | 'sent';
  onTabChange: (tab: any) => void;
  stats: { scheduled: number; sent: number; failed: number };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, stats }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <aside
      className={`relative shrink-0 bg-[#F6F5F2] border-r border-[#E8E5DC] h-screen sticky top-0 flex flex-col justify-between hidden lg:flex select-none z-30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isCollapsed ? 'w-20 p-3' : 'w-72 p-5'
      }`}
    >
      <div className="space-y-6">

        <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-3 items-center justify-center' : 'justify-between px-1'} py-1 transition-all duration-300`}>

          <div className="flex items-center overflow-hidden">
            {isCollapsed ? (
              <img
                src={logoColapsImg}
                alt="ReachInbox Icon"
                className="h-11 w-11 object-contain shrink-0 filter drop-shadow-xs hover:scale-110 transition-transform duration-300 cursor-pointer"
              />
            ) : (
              <img
                src={logoImg}
                alt="ReachInbox Logo"
                className="h-16 sm:h-18 w-auto object-contain shrink-0 max-w-[215px] filter drop-shadow-xs hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
              />
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-200/70 transition-all duration-200 shrink-0 transform hover:scale-110 active:scale-95"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 transition-transform duration-300" />
            ) : (
              <PanelLeftClose className="h-4 w-4 transition-transform duration-300" />
            )}
          </button>
        </div>

        <div className="relative group flex justify-center">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center rounded-2xl py-3 text-xs font-extrabold transition-all duration-200 ${
              isCollapsed ? 'h-11 w-11 justify-center px-0' : 'space-x-3 px-4'
            } ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-[#EADDCB] to-[#F2E6D8] text-stone-900 border border-[#DCCBB5] shadow-[0_4px_12px_rgba(217,199,178,0.4)] scale-[1.01]'
                : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 hover:-translate-y-0.5'
            }`}
          >
            <LayoutDashboard className={`h-4 w-4 shrink-0 transition-transform duration-200 ${activeTab === 'dashboard' ? 'text-stone-900 scale-110' : 'text-stone-600'}`} />
            {!isCollapsed && <span className="transition-opacity duration-300">Dashboard</span>}
          </button>

          {isCollapsed && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap translate-x-1 group-hover:translate-x-0">
              Dashboard
            </div>
          )}
        </div>

        <div className="space-y-2">
          {!isCollapsed ? (
            <p className="px-4 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-2 transition-opacity duration-300">
              Email Management
            </p>
          ) : (
            <div className="h-px bg-stone-200/80 my-2 mx-2" />
          )}

          <div className="relative group flex justify-center">
            <button
              onClick={() => onTabChange('scheduled')}
              className={`w-full flex items-center rounded-xl py-2.5 text-xs font-extrabold transition-all duration-200 ${
                isCollapsed ? 'h-11 w-11 justify-center px-0 relative' : 'justify-between px-4'
              } ${
                activeTab === 'scheduled'
                  ? 'bg-gradient-to-r from-[#EADDCB] to-[#F2E6D8] text-stone-900 border border-[#DCCBB5] shadow-[0_4px_12px_rgba(217,199,178,0.4)] scale-[1.01]'
                  : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 hover:-translate-y-0.5'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                <Clock className={`h-4 w-4 shrink-0 transition-transform duration-200 ${activeTab === 'scheduled' ? 'text-stone-900 scale-110' : 'text-stone-600'}`} />
                {!isCollapsed && <span className="transition-opacity duration-300">Scheduled Emails</span>}
              </div>

              {!isCollapsed ? (
                stats.scheduled > 0 && (
                  <span className="bg-[#DFCEB8] text-stone-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs transform transition-transform group-hover:scale-110">
                    {stats.scheduled}
                  </span>
                )
              ) : (
                stats.scheduled > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-amber-600 ring-2 ring-[#F6F5F2] animate-pulse" />
                )
              )}
            </button>

            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-2 translate-x-1 group-hover:translate-x-0">
                <span>Scheduled Emails</span>
                {stats.scheduled > 0 && (
                  <span className="bg-amber-500 text-stone-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {stats.scheduled}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="relative group flex justify-center">
            <button
              onClick={() => onTabChange('sent')}
              className={`w-full flex items-center rounded-xl py-2.5 text-xs font-extrabold transition-all duration-200 ${
                isCollapsed ? 'h-11 w-11 justify-center px-0' : 'justify-between px-4'
              } ${
                activeTab === 'sent'
                  ? 'bg-gradient-to-r from-[#EADDCB] to-[#F2E6D8] text-stone-900 border border-[#DCCBB5] shadow-[0_4px_12px_rgba(217,199,178,0.4)] scale-[1.01]'
                  : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 hover:-translate-y-0.5'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                <Send className={`h-4 w-4 shrink-0 transition-transform duration-200 ${activeTab === 'sent' ? 'text-stone-900 scale-110' : 'text-stone-600'}`} />
                {!isCollapsed && <span className="transition-opacity duration-300">Sent / History Log</span>}
              </div>
            </button>

            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap translate-x-1 group-hover:translate-x-0">
                Sent / History Log
              </div>
            )}
          </div>

        </div>

      </div>

      <div className="pt-4 border-t border-[#E8E5DC]">
        {!isCollapsed ? (
          <div
            onClick={() => setIsHelpOpen(true)}
            className="bg-white/80 border border-[#E8E5DC] rounded-2xl p-3.5 shadow-sm flex items-center space-x-3 transition-all duration-300 hover:border-stone-300 hover:shadow-md cursor-pointer hover:bg-stone-50/80 active:scale-95"
            title="Open ReachInbox Help & Support Drawer"
          >
            <div className="clay-icon-pill h-8 w-8 rounded-xl flex items-center justify-center text-stone-700 shrink-0 shadow-xs">
              <HelpCircle className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Need Help?</p>
              <p className="text-[10px] text-stone-400 font-medium">Check our docs or <span className="underline font-bold text-stone-600 hover:text-stone-900">contact support</span></p>
            </div>
          </div>
        ) : (
          <div className="relative group flex justify-center">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="h-11 w-11 rounded-2xl bg-white border border-[#E8E5DC] flex items-center justify-center text-stone-700 shadow-sm hover:scale-110 hover:border-stone-300 transition duration-200 cursor-pointer"
            >
              <HelpCircle className="h-5 w-5 text-stone-700" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap translate-x-1 group-hover:translate-x-0">
              Need Help? Support
            </div>
          </div>
        )}
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

    </aside>
  );
};

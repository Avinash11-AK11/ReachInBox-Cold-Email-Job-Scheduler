import React, { useState } from 'react';
import { X } from 'lucide-react';
import scheduledImg from '../assets/home/sheduled.png';
import monitorImg from '../assets/home/monitor.png';
import useTemplatesImg from '../assets/home/Use.png';

export const QuickTips: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="clay-card rounded-3xl p-6 sm:p-7 relative select-none overflow-hidden">
      
      {/* Close button */}
      <button
        onClick={() => setVisible(false)}
        className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition z-20"
        title="Dismiss Quick Tips"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center space-x-2 mb-5">
        <span className="text-base">💡</span>
        <h4 className="text-xs font-extrabold text-stone-900 tracking-wide">Quick Tips</h4>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* Tip 1 - Schedule Smart with Prominent 3D Clock Pillow Asset */}
        <div className="flex items-center space-x-4 pr-0 lg:pr-6 lg:border-r border-stone-200/80">
          <div className="shrink-0 relative flex items-center justify-center">
            {/* Soft Ambient Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-[#FAF4EB]/90 via-[#F3E7D5]/50 to-transparent blur-2xl pointer-events-none" />

            <img
              src={scheduledImg}
              alt="Schedule Smart"
              className="h-24 w-24 object-contain filter drop-shadow-[0_12px_24px_rgba(170,140,110,0.28)] relative z-10 transform hover:scale-105 transition duration-300"
            />
          </div>
          <div>
            <p className="text-xs font-extrabold text-stone-900">Schedule Smart</p>
            <p className="text-[11px] text-stone-500 mt-1 leading-relaxed font-medium">
              Set optimal send times for better engagement
            </p>
          </div>
        </div>

        {/* Tip 2 - Monitor Delivery with Prominent 3D Bar Chart Pillow Asset */}
        <div className="flex items-center space-x-4 px-0 lg:px-6 lg:border-r border-stone-200/80">
          <div className="shrink-0 relative flex items-center justify-center">
            {/* Soft Ambient Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-[#FAF4EB]/90 via-[#F3E7D5]/50 to-transparent blur-2xl pointer-events-none" />

            <img
              src={monitorImg}
              alt="Monitor Delivery"
              className="h-24 w-24 object-contain filter drop-shadow-[0_12px_24px_rgba(170,140,110,0.28)] relative z-10 transform hover:scale-105 transition duration-300"
            />
          </div>
          <div>
            <p className="text-xs font-extrabold text-stone-900">Monitor Delivery</p>
            <p className="text-[11px] text-stone-500 mt-1 leading-relaxed font-medium">
              Track delivery rates and bounce rates
            </p>
          </div>
        </div>

        {/* Tip 3 - Use Templates with Prominent 3D Template Folder Asset */}
        <div className="flex items-center space-x-4 pl-0 lg:pl-6">
          <div className="shrink-0 relative flex items-center justify-center">
            {/* Soft Ambient Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-[#FAF4EB]/90 via-[#F3E7D5]/50 to-transparent blur-2xl pointer-events-none" />

            <img
              src={useTemplatesImg}
              alt="Use Templates"
              className="h-24 w-24 object-contain filter drop-shadow-[0_12px_24px_rgba(170,140,110,0.28)] relative z-10 transform hover:scale-105 transition duration-300"
            />
          </div>
          <div>
            <p className="text-xs font-extrabold text-stone-900">Use Templates</p>
            <p className="text-[11px] text-stone-500 mt-1 leading-relaxed font-medium">
              Save time with reusable email templates
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

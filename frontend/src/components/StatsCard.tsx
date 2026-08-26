import React from 'react';
import { EmailStats } from '../types';
import totalEmailImg from '../assets/home/total_email.png';
import scheduledImg from '../assets/home/sheduled.png';
import successfullyImg from '../assets/home/successfully.png';
import failureImg from '../assets/home/failure.png';

interface StatsCardProps {
  stats: EmailStats;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Emails',
      value: stats.total,
      subtext: 'All campaigns',
      iconSrc: totalEmailImg,
    },
    {
      title: 'Scheduled Queue',
      value: stats.scheduled,
      subtext: 'Upcoming emails',
      iconSrc: scheduledImg,
    },
    {
      title: 'Successfully Sent',
      value: stats.sent,
      subtext: 'Delivered emails',
      iconSrc: successfullyImg,
    },
    {
      title: 'Delivery Failures',
      value: stats.failed,
      subtext: 'Failed deliveries',
      iconSrc: failureImg,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 select-none">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="clay-card rounded-3xl p-6 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden min-h-[140px]"
        >
          <div>
            <p className="text-xs font-semibold text-stone-500">{card.title}</p>
            {loading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-stone-200" />
            ) : (
              <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900">
                {card.value}
              </h3>
            )}
            <p className="text-[11px] text-stone-400 mt-1 font-medium">{card.subtext}</p>
          </div>

          {/* 3D Icon Container using exact high-res custom assets */}
          <div className="shrink-0 relative flex items-center justify-center">
            
            {/* Soft Ambient Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-[#FAF4EB]/90 via-[#F3E7D5]/50 to-transparent blur-xl pointer-events-none" />

            {/* Main 3D Icon Asset */}
            <img
              src={card.iconSrc}
              alt={card.title}
              className="h-24 w-24 object-contain filter drop-shadow-[0_10px_20px_rgba(170,140,110,0.25)] relative z-10 transform hover:scale-105 transition"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { Zap } from 'lucide-react';
import { TOWERS, type TowerType } from '../../game/Constants';
import { skinTowerColor } from '../../game/Skins';

interface Props {
  type: TowerType;
  size?: number;
  glow?: boolean;
}

export const TowerIcon: React.FC<Props> = ({ type, size = 40, glow = false }) => {
  const color = skinTowerColor(type, TOWERS[type].color);
  return (
    <div
      className="rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: color, boxShadow: glow ? `0 0 14px ${color}` : 'none' }}
    >
      {type === 'BASIC' && <div className="w-1/3 h-1/3 bg-white rounded-full" />}
      {type === 'SNIPER' && <div className="w-1/2 h-1 bg-white" />}
      {type === 'RAPID' && <div className="flex gap-0.5"><div className="w-1 bg-white" style={{ height: size * 0.4 }} /><div className="w-1 bg-white" style={{ height: size * 0.4 }} /><div className="w-1 bg-white" style={{ height: size * 0.4 }} /></div>}
      {type === 'FROST' && <div className="w-1/3 h-1/3 bg-white rotate-45" />}
      {type === 'SPLASH' && <div className="w-2/5 h-1/4 bg-white" />}
      {type === 'LASER' && <div className="w-1/2 h-0.5 bg-white" />}
      {type === 'TESLA' && <Zap size={size * 0.5} className="text-white fill-current" />}
      {type === 'TACK' && <div className="w-2/5 h-2/5 bg-white rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-slate-900 rounded-full" /></div>}
      {type === 'BEACON' && <div className="w-1/4 h-1/4 border-2 border-white rounded-sm" />}
      {type === 'FARM' && <div className="w-1/3 h-1/3 bg-white" />}
      {type === 'PLASMA' && <div className="w-1/2 h-1/2 rounded-full border-2 border-white bg-violet-300" />}
    </div>
  );
};

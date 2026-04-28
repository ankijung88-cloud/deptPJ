import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Monitor, User, Plus, X } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

interface OfficeEnvironment2DProps {
    seats: any[];
    participants: any[];
    departments: any[];
    onAddSeat: (deptId: string) => void;
    onRemoveSeat: (seatId: string) => void;
    onAssignUser: (seatId: string) => void;
    onSit: (seatId: string) => void;
    onMove: (point: [number, number, number]) => void;
    onEnterRoom: (deptId: string | null) => void;
    user: any;
    isAdmin: boolean;
    isAgency: boolean;
}

export const OfficeEnvironment2D: React.FC<OfficeEnvironment2DProps> = ({
    seats,
    participants,
    departments,
    onAddSeat,
    onRemoveSeat,
    onAssignUser,
    onSit,
    onMove: _onMove,
    onEnterRoom: _onEnterRoom,
    user,
    isAdmin,
    isAgency
}) => {
    const isManagement = isAdmin || isAgency;

    return (
        <div className="w-full h-full p-8 md:p-12 overflow-y-auto custom-scrollbar bg-[#050505]">
            <div className="max-w-7xl mx-auto">
                {/* 2D Floor Plan Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {departments.map((dept) => (
                        <motion.div
                            key={dept.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative group"
                        >
                            {/* Department Card / Room */}
                            <div 
                                className="h-full bg-[#111] border border-white/10 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-[#00D2FF]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col"
                                style={{
                                    boxShadow: `inset 0 0 100px ${dept.color}08`
                                }}
                            >
                                {/* Glow Accent */}
                                <div 
                                    className="absolute -top-10 -right-10 w-32 h-32 blur-[80px] rounded-full opacity-20"
                                    style={{ backgroundColor: dept.color }}
                                />

                                {/* Header */}
                                <div className="mb-6 relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                                        <h3 className="text-xl font-serif font-black tracking-tight text-white/90">
                                            <AutoTranslatedText text={dept.name} />
                                        </h3>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                                        <AutoTranslatedText text={dept.desc} />
                                    </p>
                                </div>

                                {/* Seats Grid */}
                                <div className="grid grid-cols-2 gap-4 relative z-10 flex-grow">
                                    {seats.filter(s => s.deptId === dept.id).map((seat) => {
                                        const participant = participants.find(p => p.seatId === seat.id);
                                        const isMySeat = participant?.id === user?.id || participant?.id === user?.uid;

                                        return (
                                            <motion.div
                                                key={seat.id}
                                                whileHover={{ scale: 1.02 }}
                                                className={`relative aspect-square rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 p-3 ${
                                                    participant 
                                                        ? 'bg-white/5 border-white/20' 
                                                        : 'bg-white/[0.02] border-white/5 border-dashed hover:bg-white/5 cursor-pointer'
                                                }`}
                                                onClick={() => !participant && onSit(seat.id)}
                                            >
                                                {/* Seat Icon / Content */}
                                                {participant ? (
                                                    <>
                                                        <div className="relative">
                                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 overflow-hidden">
                                                                <User size={20} className={isMySeat ? 'text-[#00D2FF]' : 'text-white/60'} />
                                                            </div>
                                                            <div 
                                                                className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#111]"
                                                                style={{ backgroundColor: participant.status === 'working' ? '#10b981' : '#f59e0b' }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black tracking-tight text-white/80 truncate w-full text-center">
                                                            {participant.name}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Monitor size={16} className="text-white/10 group-hover:text-white/30 transition-colors" />
                                                        {seat.assignedUser && (
                                                            <span className="text-[8px] font-bold uppercase tracking-widest text-white/20 absolute top-2">
                                                                {seat.assignedUser.name}
                                                            </span>
                                                        )}
                                                    </>
                                                )}

                                                {/* Admin Controls */}
                                                {isManagement && (
                                                    <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); onRemoveSeat(seat.id); }}
                                                            className="p-1 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); onAssignUser(seat.id); }}
                                                            className="p-1 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] hover:bg-[#00D2FF] hover:text-black transition-all"
                                                        >
                                                            <Plus size={10} />
                                                        </button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}

                                    {/* Add Seat Placeholder */}
                                    {isAdmin && (
                                        <button
                                            onClick={() => onAddSeat(dept.id)}
                                            className="aspect-square rounded-2xl border border-dashed border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-[#00D2FF]/30 transition-all group/add"
                                        >
                                            <Plus size={20} className="text-white/10 group-hover/add:text-[#00D2FF] transition-colors" />
                                        </button>
                                    )}
                                </div>

                                {/* Footer Stats */}
                                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-white/20">
                                    <div className="flex items-center gap-2">
                                        <Users size={12} />
                                        <span>{participants.filter(p => seats.some(s => s.id === p.seatId && s.deptId === dept.id)).length} / {seats.filter(s => s.deptId === dept.id).length}</span>
                                    </div>
                                    <span style={{ color: dept.color }}>{Math.round((participants.filter(p => seats.some(s => s.id === p.seatId && s.deptId === dept.id)).length / (seats.filter(s => s.deptId === dept.id).length || 1)) * 100)}%</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Standing / Hallway Area */}
                <div className="mt-16 bg-[#111] border border-white/10 rounded-[3rem] p-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="mb-8">
                        <h3 className="text-2xl font-serif font-black tracking-tight text-white/90">
                            <AutoTranslatedText text="Common Area" />
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            <AutoTranslatedText text="Hallway & Open Lounge" />
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <AnimatePresence>
                            {participants.filter(p => !p.seatId).map((p) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex flex-col items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-[2rem] min-w-[100px] hover:bg-white/10 transition-all cursor-default"
                                >
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            <User size={32} className={p.id === user?.id ? 'text-[#00D2FF]' : 'text-white/40'} />
                                        </div>
                                        <div 
                                            className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-4 border-[#111]"
                                            style={{ backgroundColor: p.status === 'working' ? '#10b981' : '#f59e0b' }}
                                        />
                                    </div>
                                    <span className="text-[11px] font-black tracking-tight text-white/90">
                                        {p.name}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {participants.filter(p => !p.seatId).length === 0 && (
                            <div className="w-full py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2rem] text-white/10">
                                <Users size={40} className="mb-4" />
                                <p className="text-xs font-bold uppercase tracking-[0.3em]"><AutoTranslatedText text="All members are at their desks" /></p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

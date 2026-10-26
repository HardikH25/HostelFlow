import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TicketCard from './TicketCard';
import confetti from 'canvas-confetti';
import {
    CircleDot,
    UserCheck,
    Clock,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';

const COLUMNS = [
    {
        id: 'Open',
        title: 'Open Issues',
        badgeColor: 'bg-white text-black',
        icon: CircleDot,
        description: 'New issues awaiting dispatch'
    },
    {
        id: 'Assigned',
        title: 'Assigned / In-Progress',
        badgeColor: 'bg-[#60A5FA] text-black',
        icon: UserCheck,
        description: 'Technician on-site resolving'
    },
    {
        id: 'Awaiting-Student-Reply',
        title: 'Awaiting Reply (SLA Paused)',
        badgeColor: 'bg-[#FFD93D] text-black',
        icon: Clock,
        description: 'Clock frozen until student responds'
    },
    {
        id: 'Resolved',
        title: 'Resolved',
        badgeColor: 'bg-[#38E54D] text-black',
        icon: CheckCircle2,
        description: 'Completed & closed tickets'
    }
];

const KanbanBoard = ({ tickets = [], onStatusChange }) => {
    const [columnsData, setColumnsData] = useState({
        'Open': [],
        'Assigned': [],
        'Awaiting-Student-Reply': [],
        'Resolved': []
    });

    useEffect(() => {
        const grouped = {
            'Open': [],
            'Assigned': [],
            'Awaiting-Student-Reply': [],
            'Resolved': []
        };

        tickets.forEach((ticket) => {
            if (grouped[ticket.status]) {
                grouped[ticket.status].push(ticket);
            } else {
                grouped['Open'].push(ticket);
            }
        });

        setColumnsData(grouped);
    }, [tickets]);

    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;

        // Optimistic UI update
        const sourceList = Array.from(columnsData[sourceColId]);
        const destList = sourceColId === destColId ? sourceList : Array.from(columnsData[destColId]);

        const [movedTicket] = sourceList.splice(source.index, 1);
        const updatedTicket = { ...movedTicket, status: destColId };

        if (sourceColId === destColId) {
            sourceList.splice(destination.index, 0, updatedTicket);
            setColumnsData({
                ...columnsData,
                [sourceColId]: sourceList
            });
        } else {
            destList.splice(destination.index, 0, updatedTicket);
            setColumnsData({
                ...columnsData,
                [sourceColId]: sourceList,
                [destColId]: destList
            });

            // Trigger confetti if resolved!
            if (destColId === 'Resolved') {
                try {
                    confetti({
                        particleCount: 80,
                        spread: 60,
                        origin: { y: 0.6 }
                    });
                } catch (e) {
                    // Ignore confetti error
                }
            }

            // Call backend API status update
            if (onStatusChange) {
                await onStatusChange(draggableId, destColId);
            }
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {COLUMNS.map((col) => {
                    const IconComponent = col.icon;
                    const items = columnsData[col.id] || [];

                    return (
                        <div
                            key={col.id}
                            className="flex flex-col bg-[#F8F9FA] border-2 border-black rounded-xl p-3 neo-shadow-sm min-h-[580px]"
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between p-2 mb-2 border-b-2 border-black pb-2.5">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-black text-white rounded">
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-sm text-black leading-tight">
                                            {col.title}
                                        </h4>
                                        <p className="text-[10px] text-gray-500 font-mono">
                                            {col.description}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-mono font-black text-xs px-2 py-0.5 border border-black rounded ${col.badgeColor}`}>
                                    {items.length}
                                </span>
                            </div>

                            {/* Droppable Area */}
                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 flex flex-col gap-3 p-1 rounded-lg transition-colors overflow-y-auto max-h-[700px] ${
                                            snapshot.isDraggingOver ? 'bg-[#FFD93D]/15 border-2 border-dashed border-black' : ''
                                        }`}
                                    >
                                        {items.length === 0 ? (
                                            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-xs font-mono">
                                                <span>No issues in this stage</span>
                                            </div>
                                        ) : (
                                            items.map((ticket, index) => (
                                                <Draggable
                                                    key={ticket._id}
                                                    draggableId={ticket._id}
                                                    index={index}
                                                >
                                                    {(dragProvided, dragSnapshot) => (
                                                        <div
                                                            ref={dragProvided.innerRef}
                                                            {...dragProvided.draggableProps}
                                                            {...dragProvided.dragHandleProps}
                                                            className={`transition-shadow ${
                                                                dragSnapshot.isDragging ? 'rotate-1 neo-shadow-lg scale-102 z-50' : ''
                                                            }`}
                                                        >
                                                            <TicketCard ticket={ticket} isStaff={true} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
};

export default KanbanBoard;

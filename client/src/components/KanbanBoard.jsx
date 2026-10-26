import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TicketCard from "./TicketCard";
import confetti from "canvas-confetti";
import {
    CircleDot,
    UserCheck,
    Clock,
    CheckCircle2
} from "lucide-react";

const COLUMNS = [
    {
        id: "Open",
        title: "Open Issues",
        badgeColor: "border-[#222222] bg-[#121212] text-[#f2f2f2]",
        icon: CircleDot,
        description: "Awaiting dispatch & review"
    },
    {
        id: "Assigned",
        title: "Assigned & Active",
        badgeColor: "border-sky-900/50 bg-sky-950/30 text-sky-300",
        icon: UserCheck,
        description: "Technician dispatched to room"
    },
    {
        id: "Awaiting-Student-Reply",
        title: "Awaiting Reply (Paused)",
        badgeColor: "border-amber-900/50 bg-amber-950/30 text-amber-300",
        icon: Clock,
        description: "Timer paused for student input"
    },
    {
        id: "Resolved",
        title: "Resolved",
        badgeColor: "border-emerald-900/50 bg-emerald-950/30 text-emerald-300",
        icon: CheckCircle2,
        description: "Completed & closed issues"
    }
];

const KanbanBoard = ({ tickets = [], onStatusChange, isWarden = false }) => {
    const [columnsData, setColumnsData] = useState({
        "Open": [],
        "Assigned": [],
        "Awaiting-Student-Reply": [],
        "Resolved": []
    });

    useEffect(() => {
        const grouped = {
            "Open": [],
            "Assigned": [],
            "Awaiting-Student-Reply": [],
            "Resolved": []
        };

        tickets.forEach((ticket) => {
            if (grouped[ticket.status]) {
                grouped[ticket.status].push(ticket);
            } else {
                grouped["Open"].push(ticket);
            }
        });

        setColumnsData(grouped);
    }, [tickets]);

    const handleDragEnd = async (result) => {
        if (!isWarden) return; // Only Wardens can drag-and-drop update status

        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;

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

            if (destColId === "Resolved") {
                try {
                    confetti({
                        particleCount: 80,
                        spread: 60,
                        origin: { y: 0.6 }
                    });
                } catch {}
            }

            if (onStatusChange) {
                await onStatusChange(draggableId, destColId);
            }
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {COLUMNS.map((col) => {
                    const IconComponent = col.icon;
                    const items = columnsData[col.id] || [];

                    return (
                        <div
                            key={col.id}
                            className="flex flex-col bg-[#0a0a0a] border border-[#222222] rounded-[6px] p-3 min-h-[580px]"
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between p-2 mb-2 border-b border-[#222222] pb-2.5">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-[#141414] border border-[#222222] rounded text-[#a6a9ad]">
                                        <IconComponent className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-xs text-[#f2f2f2] leading-tight">
                                            {col.title}
                                        </h4>
                                        <p className="text-[10px] text-[#717478] font-mono mt-0.5">
                                            {col.description}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-mono text-xs px-2 py-0.5 border rounded-full ${col.badgeColor}`}>
                                    {items.length}
                                </span>
                            </div>

                            {/* Droppable Area */}
                            <Droppable droppableId={col.id} isDropDisabled={!isWarden}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 flex flex-col gap-2.5 p-1 rounded transition-colors overflow-y-auto max-h-[700px] ${
                                            snapshot.isDraggingOver ? "bg-[#141414] border border-dashed border-[#3fd6c6]/40" : ""
                                        }`}
                                    >
                                        {items.length === 0 ? (
                                            <div className="h-28 flex flex-col items-center justify-center border border-dashed border-[#1f1f1f] rounded text-[#55585d] text-xs font-mono">
                                                <span>No issues in this stage</span>
                                            </div>
                                        ) : (
                                            items.map((ticket, index) => (
                                                <Draggable
                                                    key={ticket._id}
                                                    draggableId={ticket._id}
                                                    index={index}
                                                    isDragDisabled={!isWarden}
                                                >
                                                    {(dragProvided, dragSnapshot) => (
                                                        <div
                                                            ref={dragProvided.innerRef}
                                                            {...dragProvided.draggableProps}
                                                            {...dragProvided.dragHandleProps}
                                                            className={`transition-all ${
                                                                dragSnapshot.isDragging ? "opacity-90 scale-[1.02] shadow-2xl z-50" : ""
                                                            }`}
                                                        >
                                                            <TicketCard ticket={ticket} />
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

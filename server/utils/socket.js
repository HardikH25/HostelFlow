let ioInstance = null;

export const initSocket = (io) => {
    ioInstance = io;
};

export const emitToRoom = (room, event, data) => {
    if (ioInstance) {
        ioInstance.to(room).emit(event, data);
    }
};


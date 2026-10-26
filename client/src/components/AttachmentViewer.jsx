import { useState } from 'react';
import { FileText, Image as ImageIcon, ExternalLink, Download, X, Eye } from 'lucide-react';

const isImage = (file) => {
    if (!file) return false;
    const type = file.fileType || '';
    const filename = file.filename || file.url || '';
    return type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
};

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentViewer = ({ attachments = [], compact = false }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="flex flex-col gap-2">
            <div className={`grid ${compact ? 'grid-cols-1 sm:grid-cols-2 gap-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'}`}>
                {attachments.map((att, idx) => {
                    const imageFile = isImage(att);

                    if (imageFile) {
                        return (
                            <div
                                key={idx}
                                className="group relative border-2 border-black rounded-lg overflow-hidden bg-white neo-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
                            >
                                <div
                                    onClick={() => setSelectedImage(att)}
                                    className="cursor-pointer relative aspect-video bg-gray-100 flex items-center justify-center overflow-hidden"
                                >
                                    <img
                                        src={att.url}
                                        alt={att.filename || 'Attachment'}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/400x250/FFD93D/000000?text=Image+Attachment';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <span className="p-1.5 bg-white text-black border border-black rounded shadow">
                                            <Eye className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>

                                <div className="p-2 bg-white border-t-2 border-black flex items-center justify-between gap-1 text-[11px]">
                                    <span className="font-bold text-black truncate" title={att.filename}>
                                        {att.filename}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-500 shrink-0">
                                        {formatFileSize(att.size)}
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    // PDF Document Card
                    return (
                        <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 p-2.5 border-2 border-black rounded-lg bg-white neo-shadow-sm hover:bg-red-50 hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-xs group"
                        >
                            <div className="p-2 bg-red-100 text-red-600 border border-black rounded shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="font-extrabold text-black block truncate group-hover:text-red-700">
                                    {att.filename}
                                </span>
                                <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
                                    <span>PDF Document</span>
                                    {att.size ? <span>• {formatFileSize(att.size)}</span> : null}
                                </span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-black shrink-0" />
                        </a>
                    );
                })}
            </div>

            {/* Lightbox Modal for Full Image Zoom */}
            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-3xl w-full bg-white border-3 border-black rounded-xl p-4 neo-shadow-lg"
                    >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-black">
                            <span className="font-bold text-xs truncate max-w-md">
                                {selectedImage.filename}
                            </span>
                            <div className="flex items-center gap-2">
                                <a
                                    href={selectedImage.url}
                                    download={selectedImage.filename}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="neo-btn bg-white hover:bg-gray-100 text-xs px-2.5 py-1"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download</span>
                                </a>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="p-1 border-2 border-black rounded hover:bg-gray-100 cursor-pointer"
                                >
                                    <X className="w-4 h-4 text-black" />
                                </button>
                            </div>
                        </div>
                        <div className="max-h-[75vh] flex items-center justify-center overflow-auto rounded bg-gray-50 border border-dashed border-gray-300">
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.filename}
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttachmentViewer;

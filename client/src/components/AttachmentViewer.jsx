import { useState } from "react";
import { FileText, ExternalLink, Download, X, Eye } from "lucide-react";

const isImage = (file) => {
    if (!file) return false;
    const type = file.fileType || "";
    const filename = file.filename || file.url || "";
    return type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
};

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentViewer = ({ attachments = [], compact = false }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="flex flex-col gap-2">
            <div className={`grid ${compact ? "grid-cols-1 sm:grid-cols-2 gap-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"}`}>
                {attachments.map((att, idx) => {
                    const imageFile = isImage(att);

                    if (imageFile) {
                        return (
                            <div
                                key={idx}
                                className="group relative border border-[#222222] rounded-[6px] overflow-hidden bg-[#0e0e0e] hover:border-[#303030] transition-colors"
                            >
                                <div
                                    onClick={() => setSelectedImage(att)}
                                    className="cursor-pointer relative aspect-video bg-[#050505] flex items-center justify-center overflow-hidden"
                                >
                                    <img
                                        src={att.url}
                                        alt={att.filename || "Attachment"}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/400x250/141414/f2f2f2?text=Image+Attachment";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <span className="p-1.5 bg-[#141414] text-[#f2f2f2] border border-[#222222] rounded-full">
                                            <Eye className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </div>

                                <div className="p-2 bg-[#0a0a0a] border-t border-[#222222] flex items-center justify-between gap-1 text-[11px]">
                                    <span className="font-mono text-[#f2f2f2] truncate" title={att.filename}>
                                        {att.filename}
                                    </span>
                                    <span className="text-[10px] font-mono text-[#8a8d91] shrink-0">
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
                            className="flex items-center gap-2.5 p-2.5 border border-[#222222] rounded-[6px] bg-[#0e0e0e] hover:border-[#303030] hover:bg-[#141414] transition-all text-xs group"
                        >
                            <div className="p-2 bg-[#1a0f0f] text-rose-400 border border-rose-900/40 rounded-[4px] shrink-0">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="font-medium text-[#f2f2f2] block truncate group-hover:text-white">
                                    {att.filename}
                                </span>
                                <span className="text-[10px] font-mono text-[#8a8d91] uppercase flex items-center gap-1">
                                    <span>PDF</span>
                                    {att.size ? <span>• {formatFileSize(att.size)}</span> : null}
                                </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-[#8a8d91] group-hover:text-[#f2f2f2] shrink-0" />
                        </a>
                    );
                })}
            </div>

            {/* Lightbox Modal for Full Image Zoom */}
            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-3xl w-full bg-[#0e0e0e] border border-[#222222] rounded-[6px] p-4 shadow-2xl"
                    >
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222]">
                            <span className="font-mono text-xs text-[#f2f2f2] truncate max-w-md">
                                {selectedImage.filename}
                            </span>
                            <div className="flex items-center gap-2">
                                <a
                                    href={selectedImage.url}
                                    download={selectedImage.filename}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 rounded-full bg-[#141414] border border-[#222222] hover:border-[#303030] text-[#f2f2f2] text-xs font-medium flex items-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download</span>
                                </a>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="p-1.5 rounded-full hover:bg-[#1a1a1a] text-[#8a8d91] hover:text-[#f2f2f2] cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="max-h-[75vh] flex items-center justify-center overflow-auto rounded-[6px] bg-[#050505] border border-[#1f1f1f]">
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

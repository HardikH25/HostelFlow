import { useState, useRef } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { axiosInstance } from "../axiosCalls/axios";

const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUploadZone = ({ attachments = [], onChange, maxFiles = 5 }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = async (fileList) => {
        if (!fileList || fileList.length === 0) return;
        setUploadError(null);

        if (attachments.length + fileList.length > maxFiles) {
            setUploadError(`Maximum ${maxFiles} attachments allowed.`);
            return;
        }

        const formData = new FormData();
        Array.from(fileList).forEach((file) => {
            formData.append("files", file);
        });

        setUploading(true);
        try {
            const res = await axiosInstance.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.data?.success && res.data.files) {
                onChange([...attachments, ...res.data.files]);
            } else {
                setUploadError(res.data?.message || "Failed to upload files.");
            }
        } catch (err) {
            setUploadError(err.response?.data?.message || "File upload failed. Ensure files are images or PDFs under 15MB.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = (index) => {
        const updated = attachments.filter((_, idx) => idx !== index);
        onChange(updated);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    return (
        <div className="flex flex-col gap-2.5">
            {/* Dropzone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-[6px] border border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    dragActive
                        ? "border-[#3fd6c6] bg-[#0c1614]"
                        : "border-[#222222] hover:border-[#303030] bg-[#080808] hover:bg-[#0c0c0c]"
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />

                {uploading ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-[#a6a9ad]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#3fd6c6]" />
                        <span>Uploading documents &amp; images...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-[#8a8d91]">
                        <Upload className="w-4 h-4 text-[#a6a9ad]" />
                        <span className="text-xs text-[#f2f2f2]">
                            Click to upload or drag &amp; drop evidence
                        </span>
                        <span className="text-[10px] font-mono text-[#8a8d91]">
                            PNG, JPG, WEBP, PDF (up to 15MB each, max {maxFiles} files)
                        </span>
                    </div>
                )}
            </div>

            {uploadError && (
                <span className="text-[11px] text-red-400 font-mono block">
                    {uploadError}
                </span>
            )}

            {/* Uploaded File Chips */}
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {attachments.map((file, idx) => {
                        const isPdf = file.fileType === "application/pdf" || file.filename?.endsWith(".pdf");

                        return (
                            <div
                                key={idx}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] border border-[#222222] rounded-full text-xs text-[#f2f2f2]"
                            >
                                {isPdf ? (
                                    <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                ) : (
                                    <img
                                        src={file.url}
                                        alt={file.filename}
                                        className="w-4 h-4 object-cover rounded-full shrink-0"
                                    />
                                )}
                                <div className="flex items-center gap-1.5 max-w-[150px]">
                                    <span className="truncate text-[11px] font-mono">
                                        {file.filename}
                                    </span>
                                    <span className="text-[9px] font-mono text-[#8a8d91]">
                                        {formatSize(file.size)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(idx);
                                    }}
                                    className="p-0.5 hover:bg-[#222222] rounded-full text-[#8a8d91] hover:text-[#f2f2f2] ml-1 cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FileUploadZone;

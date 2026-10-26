import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { axiosInstance } from '../axiosCalls/axios';

const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
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
            formData.append('files', file);
        });

        setUploading(true);
        try {
            const res = await axiosInstance.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data?.success && res.data.files) {
                onChange([...attachments, ...res.data.files]);
            } else {
                setUploadError(res.data?.message || 'Failed to upload files.');
            }
        } catch (err) {
            setUploadError(err.response?.data?.message || 'File upload failed. Ensure files are images or PDFs under 15MB.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
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
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
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
        <div className="flex flex-col gap-2">
            {/* Dropzone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    dragActive
                        ? 'border-black bg-[#FFD93D]/20'
                        : 'border-black/40 hover:border-black bg-gray-50 hover:bg-[#FFFDF5]'
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
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Uploading documents & images...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-600">
                        <Upload className="w-5 h-5 text-black" />
                        <span className="font-bold text-xs text-black">
                            Click to upload or drag & drop documents / images
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                            PNG, JPG, WEBP, GIF, PDF (up to 15MB each, max {maxFiles} files)
                        </span>
                    </div>
                )}
            </div>

            {uploadError && (
                <span className="text-[11px] text-red-600 font-bold block">
                    {uploadError}
                </span>
            )}

            {/* Uploaded File Chips */}
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {attachments.map((file, idx) => {
                        const isPdf = file.fileType === 'application/pdf' || file.filename?.endsWith('.pdf');

                        return (
                            <div
                                key={idx}
                                className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white border-2 border-black rounded-lg text-xs neo-shadow-sm"
                            >
                                {isPdf ? (
                                    <FileText className="w-4 h-4 text-red-600 shrink-0" />
                                ) : (
                                    <img
                                        src={file.url}
                                        alt={file.filename}
                                        className="w-5 h-5 object-cover rounded shrink-0 border border-black"
                                    />
                                )}
                                <div className="flex flex-col max-w-[150px]">
                                    <span className="font-bold text-black truncate text-[11px]">
                                        {file.filename}
                                    </span>
                                    <span className="text-[9px] font-mono text-gray-500">
                                        {formatSize(file.size)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(idx);
                                    }}
                                    className="p-0.5 hover:bg-gray-200 rounded cursor-pointer text-gray-600 hover:text-black ml-1"
                                >
                                    <X className="w-3.5 h-3.5" />
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

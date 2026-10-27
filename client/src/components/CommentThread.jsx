import { useState, useRef, useEffect } from "react";
import { axiosInstance } from "../axiosCalls/axios";
import AttachmentViewer from "./AttachmentViewer";
import { formatAuditTimestamp } from "../utils/dateUtils";
import {
    MessageSquare,
    Lock,
    Unlock,
    Paperclip,
    FileText,
    Loader2,
    X,
    Send
} from "lucide-react";

const CommentThread = ({ ticketId, comments = [], user, isStaff }) => {
    const [message, setMessage] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentAttachments, setCommentAttachments] = useState([]);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const commentFileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    // Auto-scroll chat to bottom on new comments
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    // Handle attaching file to comment
    const handleCommentFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("files", file);

        setUploadingAttachment(true);
        try {
            const res = await axiosInstance.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data?.success && res.data.files?.length > 0) {
                setCommentAttachments((prev) => [...prev, ...res.data.files]);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to attach document/image.");
        } finally {
            setUploadingAttachment(false);
            if (commentFileInputRef.current) commentFileInputRef.current.value = "";
        }
    };

    // Post a comment
    const handleSendComment = async (e) => {
        e.preventDefault();
        const hasText = message.trim() !== "";
        const hasFiles = commentAttachments.length > 0;
        if (!hasText && !hasFiles) return;

        setSubmittingComment(true);
        try {
            const res = await axiosInstance.post(`/tickets/${ticketId}/comments`, {
                message: hasText ? message.trim() : (hasFiles ? "📎 Attached document/image" : ""),
                isInternal: isStaff ? isInternal : false,
                attachments: commentAttachments
            });

            if (res.data?.success) {
                setMessage("");
                setIsInternal(false);
                setCommentAttachments([]);
            }
        } catch (err) {
            console.error("Failed to post comment:", err);
            alert(err.response?.data?.message || "Failed to post message. Please check your connection and try again.");
        } finally {
            setSubmittingComment(false);
        }
    };

    return (
        <div className="rounded-[6px] bg-[#0e0e0e] border border-[#222222] p-5 flex flex-col h-[740px]">
            {/* Discussion Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#222222]">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#3fd6c6]" />
                    <h3 className="font-medium text-sm text-[#f2f2f2]">
                        Issue Discussion &amp; Activity
                    </h3>
                </div>
                <span className="text-xs font-mono text-[#8a8d91] px-2.5 py-0.5 rounded-full bg-[#141414] border border-[#222222]">
                    {comments.length} {comments.length === 1 ? "entry" : "entries"}
                </span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3.5 bg-[#090909] rounded-[6px] border border-[#181818]">
                {comments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8a8d91]">
                        <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                        <p className="font-mono text-xs uppercase text-[#a6a9ad]">No discussion entries yet</p>
                        <p className="text-[11px] text-[#8a8d91] mt-1 max-w-xs">
                            Post an update, note, or inquiry to begin coordinated resolution.
                        </p>
                    </div>
                ) : (
                    comments.map((comment) => {
                        const isSenderMe = comment.senderId?._id === user?._id;
                        const isInternalNote = comment.isInternal;

                        return (
                            <div
                                key={comment._id}
                                className={`flex flex-col ${isSenderMe ? "items-end" : "items-start"}`}
                            >
                                {/* Sender Info Bar */}
                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                    <span className="font-medium text-xs text-[#f2f2f2]">
                                        {comment.senderId?.fullname || "User"}
                                    </span>
                                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                                        comment.senderId?.role === "Warden" ? "bg-rose-950/60 text-rose-300 border-rose-800/40" :
                                        comment.senderId?.role === "Technician" ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/40" :
                                        "bg-[#1a1a1a] text-[#a6a9ad] border-[#2a2a2a]"
                                    }`}>
                                        {comment.senderId?.role || "Resident"}
                                    </span>
                                    <span className="text-[10px] font-mono text-[#8a8d91]">
                                        {formatAuditTimestamp(comment.createdAt)}
                                    </span>
                                </div>

                                {/* Message Bubble */}
                                <div
                                    className={`max-w-[85%] rounded-[6px] p-3.5 text-xs leading-relaxed border ${
                                        isInternalNote
                                            ? "bg-[#181208] border-amber-900/50 text-amber-200/95"
                                            : isSenderMe
                                            ? "bg-[#161616] border-[#2c2c2c] text-[#f2f2f2]"
                                            : "bg-[#101010] border-[#222222] text-[#f2f2f2]"
                                    }`}
                                >
                                    {isInternalNote && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 uppercase mb-1.5 pb-1 border-b border-amber-900/40">
                                            <Lock className="w-3 h-3" />
                                            <span>Internal Staff Note (Hidden from Resident)</span>
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap font-normal">
                                        {comment.message}
                                    </p>

                                    {/* Comment Attachments */}
                                    {comment.attachments && comment.attachments.length > 0 && (
                                        <div className="mt-2.5 pt-2 border-t border-[#222222]">
                                            <AttachmentViewer attachments={comment.attachments} compact={true} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Comment Input Footer */}
            <form
                onSubmit={handleSendComment}
                className="p-3 bg-[#0a0a0a] rounded-[6px] border border-[#1f1f1f] mt-3 flex flex-col gap-2.5"
            >
                {/* Staff Only Internal Note Toggle */}
                {isStaff && (
                    <div className="flex items-center justify-between bg-[#141005] px-3 py-1.5 border border-amber-900/40 rounded-[6px] text-xs">
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-300 select-none">
                            <input
                                type="checkbox"
                                checked={isInternal}
                                onChange={(e) => setIsInternal(e.target.checked)}
                                className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-0 bg-[#0a0a0a] border-[#333]"
                            />
                            <span className="flex items-center gap-1.5">
                                {isInternal ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-[#8a8d91]" />}
                                <span>Post as Internal Staff Note</span>
                            </span>
                        </label>
                        <span className="text-[10px] font-mono text-amber-400/80">
                            {isInternal ? "Hidden from students" : "Visible to everyone"}
                        </span>
                    </div>
                )}

                {/* Preview Selected Comment Attachments */}
                {commentAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-[#080808] border border-[#222222] rounded-[6px]">
                        {commentAttachments.map((att, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-[#141414] border border-[#222222] rounded-full px-2.5 py-0.5 text-[11px] text-[#f2f2f2]">
                                {att.fileType?.includes("pdf") || att.filename?.endsWith(".pdf") ? (
                                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                                ) : (
                                    <img src={att.url} alt="" className="w-3.5 h-3.5 object-cover rounded-full" />
                                )}
                                <span className="font-mono truncate max-w-[120px]">{att.filename}</span>
                                <button
                                    type="button"
                                    onClick={() => setCommentAttachments((prev) => prev.filter((_, i) => i !== idx))}
                                    className="text-[#8a8d91] hover:text-[#f2f2f2] cursor-pointer ml-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={commentFileInputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                        onChange={handleCommentFileUpload}
                    />

                    <button
                        type="button"
                        onClick={() => commentFileInputRef.current?.click()}
                        disabled={uploadingAttachment}
                        title="Attach image or PDF document"
                        className="p-2 rounded-full bg-[#141414] border border-[#222222] hover:border-[#303030] text-[#a6a9ad] hover:text-[#f2f2f2] transition-colors"
                    >
                        {uploadingAttachment ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#3fd6c6]" />
                        ) : (
                            <Paperclip className="w-4 h-4" />
                        )}
                    </button>

                    <input
                        type="text"
                        placeholder={isInternal ? "Write internal staff note..." : "Type reply to resident or staff (Enter to send)..."}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 px-4 py-2 text-xs border border-[#222222] rounded-full bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                    />
                    <button
                        type="submit"
                        disabled={submittingComment || (!message.trim() && commentAttachments.length === 0)}
                        className="px-4 py-2 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommentThread;

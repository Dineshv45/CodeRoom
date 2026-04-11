import React, { useEffect, useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { useParams } from 'react-router-dom';
import { RotateCcw, History, Plus, User, Clock, CheckCircle2, FileCode2, FileJson, FileText, File, FileType, FileCode, Minus, PlusCircle, MinusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; 
import { jwtDecode } from 'jwt-decode';
import RevertConfirmModal from './RevertConfirmModel';

const TimelineSidebar = () => {
    const { roomId } = useParams();
    const { timelines, loading, fetchTimelines, fetchFiles, saveRecord, revertRecord, allFiles, stageFiles, setStageFiles } = useTimeline();
    const [recordLabel, setRecordLabel] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [confirmingRecord, setConfirmingRecord] = useState(null);

    const currentUser = React.useMemo(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return null;
        try {
            return jwtDecode(token)?.username;
        } catch (e) {
            return null;
        }
    }, []);

    // Internal File Item Component
    const FileItem = ({ file, isStaged, status, onAction }) => (
        <div className="flex items-center gap-2 px-4 py-1 hover:bg-neutral-800/50 group transition-colors cursor-default">
            {file.fileName.endsWith('.js') || file.fileName.endsWith('.jsx') ? (
                <FileCode2 size={12} className="text-yellow-500/80" />
            ) : file.fileName.endsWith('.py') ? (
                <FileJson size={12} className="text-blue-400/80" />
            ) : file.fileName.endsWith('.html') ? (
                <FileCode2 size={12} className="text-orange-500/80" />
            ) : file.fileName.endsWith('.css') ? (
                <FileCode2 size={12} className="text-blue-500/80" />
            ) : (
                <FileText size={12} className="text-neutral-500" />
            )}
            <span className="text-[11px] text-neutral-400 group-hover:text-neutral-200 truncate flex-1">{file.fileName}</span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => { e.stopPropagation(); onAction(); }}
                    className={`p-0.5 rounded hover:bg-neutral-700 ${isStaged ? "text-red-400" : "text-blue-400"}`}
                >
                    {isStaged ? <Minus size={10} /> : <Plus size={10} />}
                </button>
            </div>
            <span className={`text-[9px] font-mono w-3 text-center ${status === 'A' ? "text-blue-500" : (status === 'U' ? "text-green-500" : "text-yellow-500/70")}`}>
                {status}
            </span>
        </div>
    );

    useEffect(() => {
        if (roomId) {
            fetchTimelines(roomId);
            fetchFiles(roomId);
        }
    }, [roomId, fetchTimelines, fetchFiles]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!recordLabel.trim()) return;
        setIsCreating(true);
        await saveRecord(roomId, recordLabel);
        setRecordLabel("");
        setIsCreating(false);
    };



    const formatDate = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch (err) {
            return new Date(date).toLocaleTimeString();
        }
    };

    // Helper to get status for a changed file
    const getFileStatus = (file, isStaged) => {
        if (isStaged) return 'A';
        const snapshotFile = timelines[0]?.records?.find(r => 
            String(r.fileId) === String(file._id)
        );
        return !snapshotFile ? 'U' : 'M';
    };

    // Calculate Modified & Staged Files based on database modified flag
    const modifiedFilesWithStatus = allFiles
        .filter(file => file.modified || stageFiles.some(id => String(id) === String(file._id)))
        .map(file => {
            const isStaged = stageFiles.some(id => String(id) === String(file._id));
            const status = getFileStatus(file, isStaged);
            return { ...file, status, isStaged };
        });

    const stagedList = modifiedFilesWithStatus.filter(f => f.isStaged);
    const unstagedList = modifiedFilesWithStatus.filter(f => !f.isStaged);

    const toggleStage = (fileId) => {
        if (stageFiles.includes(fileId)) {
            setStageFiles(prev => prev.filter(id => id !== fileId));
        } else {
            setStageFiles(prev => [...prev, fileId]);
        }
    };
    const stageAll = () => setStageFiles(modifiedFilesWithStatus.filter(f => !f.isStaged).map(f => f._id));
    const unstageAll = () => setStageFiles([]);

    return (
        <div className="flex flex-col h-full bg-neutral-900 text-neutral-300 border-l border-neutral-800 w-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <History size={18} className="text-blue-400" />
                    <h2 className="text-sm font-semibold tracking-wide uppercase text-neutral-400">Timeline</h2>
                </div>
            </div>

            {/* Create Snapshot Input */}
            <div className="p-4 border-b border-neutral-800">
                <form onSubmit={handleCreate} className="flex flex-col gap-2">
                    <input
                        type="text"
                        value={recordLabel}
                        onChange={(e) => setRecordLabel(e.target.value)}
                        placeholder="Record label..."
                        className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={isCreating || !recordLabel.trim()}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-800 disabled:text-neutral-600 text-white text-xs font-medium py-1.5 rounded transition-all duration-200"
                    >
                        <Plus size={14} />
                        {isCreating ? "Saving..." : (stageFiles.length === 0 ? "Commit All" : `Commit ${stageFiles.length} files`)}
                    </button>
                </form>
            </div>

            {/* Changes / Files List (VS Code Style) */}
            <div className="border-b border-neutral-800 bg-neutral-900/30 flex flex-col min-h-0">
                {/* Staged Section */}
                {stagedList.length > 0 && (
                    <div className="flex flex-col border-b border-neutral-800/50">
                        <div className="flex items-center justify-between px-4 py-1.5 bg-neutral-800/30">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400">Staged Changes</span>
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-600/20 text-blue-400 text-[10px] px-1.5 rounded-full">{stagedList.length}</span>
                                <button onClick={unstageAll} title="Unstage all" className="hover:text-red-400 transition-colors">
                                    <MinusCircle size={12} />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col py-1">
                            {stagedList.map(file => (
                                <FileItem key={file._id} file={file} isStaged={true} status={file.status} onAction={() => toggleStage(file._id)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Unstaged Section */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between px-4 py-1.5 bg-neutral-800/10">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                            {stagedList.length > 0 ? "Changes" : "Modified Files"}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="bg-neutral-800 text-neutral-400 text-[10px] px-1.5 rounded-full">{unstagedList.length}</span>
                            {unstagedList.length > 0 && (
                                <button onClick={stageAll} title="Stage all" className="hover:text-blue-400 transition-colors text-neutral-500">
                                    <PlusCircle size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col py-1 max-h-48 overflow-y-auto scrollbar-hide">
                        {unstagedList.length === 0 ? (
                            <div className="px-4 py-3 text-[10px] text-neutral-600 italic">No modifications detected</div>
                        ) : (
                            unstagedList.map(file => (
                                <FileItem key={file._id} file={file} isStaged={false} status={file.status} onAction={() => toggleStage(file._id)} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide relative">
                {loading && timelines.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-neutral-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                        <span className="text-xs">Loading...</span>
                    </div>
                ) : timelines.length === 0 ? (
                    <div className="text-center py-10 opacity-40">
                        <Clock size={32} className="mx-auto mb-2" />
                        <p className="text-xs italic">No history yet</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[11px] top-1 bottom-1 w-[2px] bg-neutral-800 z-0" />

                        <div className="flex flex-col gap-8">
                            {timelines.map((item, index) => (
                                <div key={item._id} className="group relative flex items-start gap-4 z-10 w-full transition-all duration-300">
                                    {/* Circle Node */}
                                    <div className={`
                                        w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all duration-300
                                        ${index === 0 
                                            ? "bg-blue-600 border-blue-400 scale-110 shadow-lg shadow-blue-500/20" 
                                            : "bg-neutral-900 border-neutral-700 group-hover:border-blue-500 group-hover:bg-neutral-800"}
                                    `}>
                                        {index === 0 ? <CheckCircle2 size={12} className="text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 group-hover:bg-blue-500 transition-colors" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className={`text-xs font-medium truncate ${index === 0 ? "text-blue-400" : "text-neutral-200 group-hover:text-blue-300"}`}>
                                                {item.label}
                                            </span>
                                            <button
                                                onClick={() => setConfirmingRecord(item)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-600/20 text-neutral-400 hover:text-blue-400 rounded transition-all duration-200"
                                                title="Revert to this Record"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatDate(item.createdAt)}
                                            </span>
                                            <span className="flex items-center gap-1 uppercase tracking-tighter opacity-80">
                                                <User size={10} />
                                                {item.userId?.username === currentUser ? "You" : (item.userId?.username || "Unknown")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <RevertConfirmModal 
                isOpen={!!confirmingRecord}
                onClose={() => setConfirmingRecord(null)}
                label={confirmingRecord?.label}
                onConfirm={async (deleteExtra) => {
                    await revertRecord(confirmingRecord._id, roomId, deleteExtra);
                    setConfirmingRecord(null);
                }}
            />
            
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default TimelineSidebar;


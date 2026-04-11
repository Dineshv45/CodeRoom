import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const TimelineContext = createContext();

export const useTimeline = () => {
    const context = useContext(TimelineContext);
    if (!context) {
        throw new Error('useTimeline must be used within a TimelineProvider');
    }
    return context;
};

export const TimelineProvider = ({ children }) => {
    const [timelines, setTimelines] = useState([]);
    const [allFiles, setAllFiles] = useState([]);
    const [stageFiles, setStageFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTimelines = useCallback(async (roomId) => {
        if (!roomId) return;
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/timeline/getTimeline?roomId=${roomId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setTimelines(data.timeline || []);
            } else {
                console.error("Failed to fetch timelines:", data.message);
            }
        } catch (err) {
            console.error("Error fetching timelines:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFiles = useCallback(async (roomId) => {
        if (!roomId) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}/files`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setAllFiles(data);
                return data;
            }
        } catch (err) {
            console.error("Failed to fetch files:", err);
            toast.error("Failed to fetch files");
        }
        return null;
    }, []);

    const saveRecord = async (roomId, label) => {
        try {
            const filesToSave = stageFiles;
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/timeline/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({ roomId, label, files: filesToSave }), // User ID handled by auth middlewear anyway
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Record created!");
                setStageFiles([]); // Clear staged files
                await fetchTimelines(roomId);
                await fetchFiles(roomId); // Re-fetch files to update 'modified' flags
                return data.timeline;
            } else {
                toast.error(data.message || "Failed to create Record");
            }
        } catch (err) {
            toast.error("Error creating Record");
            console.error(err);
        }
    };

    const revertRecord = async (recordId, roomId, deleteExtraFiles = false) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/timeline/revert`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({ recordId, roomId, deleteExtraFiles }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "Reverted successfully!");
                // The backend emits ROOM_REFRESH, so the UI might reload automatically
                return true;
            } else {
                toast.error(data.message || "Failed to revert");
            }
        } catch (err) {
            toast.error("Error reverting snapshot");
            console.error(err);
        }
        return false;
    };

    return (
        <TimelineContext.Provider value={{ timelines, loading, fetchTimelines, fetchFiles, saveRecord, revertRecord, allFiles, setAllFiles, stageFiles, setStageFiles }}>
            {children}
        </TimelineContext.Provider>
    );
};


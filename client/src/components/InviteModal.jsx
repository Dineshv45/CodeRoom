import React, { useState } from "react";
import { X, Mail, Link, Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function InviteModal({ isOpen, onClose, roomId, roomName }) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccessfully, setSentSuccessfully] = useState(false);

  if (!isOpen) return null;

  const inviteLink = `${import.meta.env.VITE_FRONTEND_URL}/editor/${roomId}`;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSending(true);
    // Simulate API call to send email
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ roomId, email, link: inviteLink }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to send invite");
        return;
      }
      setSentSuccessfully(true);
      setEmail("");
    } catch (err) {
      toast.error("Failed to send invite");
    } finally {
      setIsSending(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied!");
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Mail size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white">Invite User</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {sentSuccessfully ? (
          <div className="p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Invite Sent!</h3>
            <p className="text-sm text-neutral-400 mb-8">
              We've sent an invitation to <span className="text-white font-medium">{email || "the recipient"}</span>
            </p>
            <button
              onClick={onClose}
              className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSend} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm pl-11"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                  Quick Share Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-neutral-950/50 border border-neutral-800 border-dashed rounded-xl text-xs text-neutral-500 truncate select-all">
                    {inviteLink}
                  </div>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="p-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-all"
                    title="Copy link"
                  >
                    <Link size={18} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className={`
                  w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg
                  ${isSending
                    ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-[0.98]"
                  }
                `}
              >
                {isSending ? "Sending..." : (
                  <>
                    <Send size={18} />
                    Send Invitation
                  </>
                )}
              </button>
            </form>

            <div className="px-6 py-4 bg-neutral-950/50 border-t border-neutral-800 text-center">
              <p className="text-[10px] text-neutral-500 leading-relaxed uppercase tracking-widest">
                The user will receive a unique link to join <span className="text-blue-500 font-bold">{roomName}</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InviteModal;

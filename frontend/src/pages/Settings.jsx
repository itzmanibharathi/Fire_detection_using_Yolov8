import { useAuth } from "../context/AuthContext";
import { FiCopy, FiCheck, FiRefreshCw, FiSave, FiLock } from "react-icons/fi";
import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import { motion } from "framer-motion";

const Settings = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Profile Forms
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password Forms
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setOrganization(user.organization || "");
    }
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user?.uniqueAccessCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMessage({ type: "", text: "" });
    try {
      await updateProfile(fullName, phone, organization);
      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setProfileMessage({ type: "error", text: err });
    }
    setLoadingProfile(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoadingPassword(true);
    setPasswordMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      setLoadingPassword(false);
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage({ type: "error", text: err });
    }
    setLoadingPassword(false);
  };

  return (
    <div className="space-y-8 max-w-5xl pb-10">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-extrabold text-text-main mr-4">System Settings</h1>
        <p className="text-text-muted mt-2">Manage your profile, security, and hardware arrays.</p>
      </div>

      <Card className="p-8">
        <h2 className="text-xl font-bold text-text-main mb-6 border-b border-border-subtle pb-4">Hardware Integration</h2>
        <div className="mb-6">
          <p className="text-text-muted mb-4">
            Use your <strong className="text-white bg-primary/80 px-2 py-0.5 rounded shadow-sm">uniqueAccessCode</strong> in the Python `alert.py` edge scripts so devices securely map detections to your dashboard.
          </p>
          <div className="flex items-center bg-background border border-border-subtle rounded-xl overflow-hidden mt-2 shadow-inner">
            <code className="flex-1 p-4 font-mono text-primary font-bold tracking-widest text-lg">
              {user?.uniqueAccessCode}
            </code>
            <button 
              onClick={copyToClipboard}
              className="p-4 bg-surface hover:bg-surface-hover text-text-muted transition-colors border-l border-border-subtle h-full flex items-center justify-center font-semibold"
            >
              {copied ? <span className="text-success flex items-center"><FiCheck className="mr-2 w-5 h-5" /> Copied!</span> : <span className="flex items-center"><FiCopy className="w-5 h-5 mr-2" /> Copy logic</span>}
            </button>
          </div>
        </div>
        
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start shadow-sm">
          <FiRefreshCw className="text-warning mt-1 mr-3 flex-shrink-0" />
          <p className="text-sm text-text-muted">
            Regenerating an access code will immediately drop all active YOLO hardware sensors currently broadcasting using the old code. Ensure physical access to hardware before updating arrays.
          </p>
        </div>
      </Card>

      <form onSubmit={handleProfileUpdate}>
        <Card className="p-8">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
            <h2 className="text-xl font-bold text-text-main">Edit Profile Information</h2>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loadingProfile}
              type="submit"
              className="flex items-center bg-primary hover:bg-blue-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors"
            >
              <FiSave className="mr-2" /> {loadingProfile ? "Saving..." : "Save Profile"}
            </motion.button>
          </div>

          {profileMessage.text && (
            <div className={`p-4 rounded-xl mb-6 shadow-sm border ${profileMessage.type === 'error' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-success/10 border-success/20 text-success'}`}>
              <span className="font-semibold">{profileMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-bold text-text-muted mb-2 transition-colors group-focus-within:text-primary">Email Address</label>
              <input 
                type="text" 
                disabled 
                value={user?.email || "Not Specified"} 
                className="w-full bg-background border border-border-subtle text-text-muted rounded-xl py-3 px-4 cursor-not-allowed shadow-inner opacity-70"
              />
              <p className="text-xs text-text-muted mt-2">Email changes require admin portal permissions.</p>
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-text-muted mb-2 transition-colors group-focus-within:text-primary">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-background border border-border-subtle text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-xl py-3 px-4 shadow-inner transition-all"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-text-muted mb-2 transition-colors group-focus-within:text-primary">Phone Number</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-background border border-border-subtle text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-xl py-3 px-4 shadow-inner transition-all"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-text-muted mb-2 transition-colors group-focus-within:text-primary">Organization / Company</label>
              <input 
                type="text" 
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-background border border-border-subtle text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-xl py-3 px-4 shadow-inner transition-all"
              />
            </div>
          </div>
        </Card>
      </form>

      <form onSubmit={handlePasswordUpdate}>
        <Card className="p-8">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
            <h2 className="text-xl font-bold text-text-main flex items-center"><FiLock className="mr-3 text-primary"/> Security Settings</h2>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loadingPassword}
              type="submit"
              className="flex items-center bg-background border border-border-subtle hover:bg-surface-hover hover:border-primary text-text-main disabled:opacity-50 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
            >
              {loadingPassword ? "Processing..." : "Update Password"}
            </motion.button>
          </div>

          {passwordMessage.text && (
            <div className={`p-4 rounded-xl mb-6 shadow-sm border ${passwordMessage.type === 'error' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-success/10 border-success/20 text-success'}`}>
              <span className="font-semibold">{passwordMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <label className="block text-sm font-bold text-text-muted mb-2 transition-colors group-focus-within:text-primary">Current Password</label>
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-background border border-border-subtle text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-xl py-3 px-4 shadow-inner transition-all"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-text-muted mb-2 transition-colors group-focus-within:text-primary">New Password</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background border border-border-subtle text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-xl py-3 px-4 shadow-inner transition-all"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-text-muted mb-2 transition-colors group-focus-within:text-primary">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-border-subtle text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-xl py-3 px-4 shadow-inner transition-all"
              />
            </div>
          </div>
        </Card>
      </form>
      
    </div>
  );
};

export default Settings;

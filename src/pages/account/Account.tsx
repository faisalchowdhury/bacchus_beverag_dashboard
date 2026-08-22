import { useEffect, useRef, useState, type FormEvent } from "react";
import { KeyRound, Loader2, Save, Upload, UserCog } from "lucide-react";

import { changePassword, updateProfile } from "../../api/account";
import { apiErrorMessage } from "../../api/axiosInstance";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/Toast";
import Field, { Label, inputClass } from "../../components/Field";

const MIN_PASSWORD_LENGTH = 8;
const API_BASE = import.meta.env.VITE_BACKEND_BASE ?? "http://localhost:8080";

export default function Account() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
    setAddress(user.address ?? "");
  }, [user]);

  // Object URLs leak unless revoked when the chosen file changes.
  useEffect(() => {
    if (!avatar) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatar);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);

  const onSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Your name cannot be empty.");
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        profilePicture: avatar,
      });
      setAvatar(null);
      if (fileInput.current) fileInput.current.value = "";
      await refresh();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update your profile."));
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (event: FormEvent) => {
    event.preventDefault();

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }
    if (newPassword === oldPassword) {
      toast.error("The new password must be different from the current one.");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not change your password."));
    } finally {
      setSavingPassword(false);
    }
  };

  const storedAvatar = user?.profilePicture
    ? `${API_BASE.replace(/\/$/, "")}${user.profilePicture}`
    : null;
  const shownAvatar = avatarPreview ?? storedAvatar;

  const initials = (user?.name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start max-w-5xl">
      {/* Profile */}
      <form onSubmit={onSaveProfile} className="panel rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-luxury-gold/15 text-luxury-gold flex items-center justify-center flex-shrink-0">
            <UserCog size={17} />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold leading-tight">Your profile</h2>
            <p className="text-[11px] text-white/35">Name, contact details and avatar.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-luxury-charcoal ring-1 ring-luxury-gold/25 flex items-center justify-center flex-shrink-0">
            {shownAvatar ? (
              <img
                src={shownAvatar}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="font-serif text-lg font-bold text-luxury-gold/40">
                {initials || "?"}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <input
              ref={fileInput}
              id="avatar"
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-[11px] uppercase tracking-widest font-semibold text-white/60 hover:border-luxury-gold/40 hover:text-luxury-gold transition-colors focus-gold"
            >
              <Upload size={12} /> Change avatar
            </button>
            {avatar && (
              <p className="text-[11px] text-white/40 mt-2 truncate max-w-[14rem]">
                {avatar.name}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Field
            id="name"
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            hint="You sign in with this address — changing it changes your login."
          />
          <Field
            id="phone"
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
          <div>
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="w-full flex items-center justify-center gap-2 mt-6 py-3 bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest rounded-full hover:bg-white transition-colors focus-gold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {savingProfile ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save size={14} /> Save profile
            </>
          )}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={onChangePassword} className="panel rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-luxury-gold/15 text-luxury-gold flex items-center justify-center flex-shrink-0">
            <KeyRound size={17} />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold leading-tight">Password</h2>
            <p className="text-[11px] text-white/35">
              You stay signed in after changing it.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Field
            id="oldPassword"
            label="Current password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Field
            id="newPassword"
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          />
          <Field
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={savingPassword || !oldPassword || !newPassword}
          className="w-full flex items-center justify-center gap-2 mt-6 py-3 bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest rounded-full hover:bg-white transition-colors focus-gold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {savingPassword ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Changing…
            </>
          ) : (
            <>
              <KeyRound size={14} /> Change password
            </>
          )}
        </button>
      </form>
    </div>
  );
}

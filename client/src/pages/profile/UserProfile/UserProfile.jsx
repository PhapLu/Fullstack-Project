import { useEffect, useState } from "react";
import styles from "./UserProfile.module.scss";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlices";
import { apiUtils } from "../../../utils/newRequest";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-\s.\d]{6,20}$/;

export default function UserProfile() {
	const user = useSelector(selectUser);
	const [errors, setErrors] = useState({})
	const toForm = (u) => ({
		phone: u?.phone || "",
		country: u?.country || "Vietnam",
		bio: u?.bio || "",
		customerProfile: {
			name: u?.customerProfile?.name || "",
			address: u?.customerProfile?.address || "",
		},
		shipperProfile: {
			assignedHub: u?.shipperProfile?.assignedHub || "",
		},
	});

	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState(toForm(user));

	const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

	const validate = (f) => {
		const e = {};
		const t = (s) => String(s || "").trim();

		// Base fields
		if (t(f.phone) && !PHONE_RE.test(t(f.phone))) e["phone"] = "Phone contains invalid characters.";

		if (!t(f.country)) e["country"] = "Country is required.";

		if (t(f.bio).length > 200) e["bio"] = "Bio must be at most 200 characters.";

		// Role-specific
		if (user.role === "customer") {
		if (!t(f.customerProfile?.name)) e["customerProfile.name"] = "Customer name is required.";
		// address optional; add if you want: if (!t(f.customerProfile?.address)) e["customerProfile.address"] = "Address is required."
		}

		if (user.role === "shipper") {
		const hub =
			typeof f.shipperProfile?.assignedHub === "object"
			? f.shipperProfile?.assignedHub?._id || f.shipperProfile?.assignedHub?.name
			: f.shipperProfile?.assignedHub;
		if (!t(hub)) e["shipperProfile.assignedHub"] = "Assigned hub is required.";
		}

		return e;
	};

	useEffect(() => {
		setForm(toForm(user));
	}, [user]);

	const err = (k) => errors[k];

	if (!user) {
		return <div className="container-xl py-4">Loading profile…</div>;
	}	

	const startEdit = () => {
		setForm(toForm(user));
		setErrors({});
		setEditing(true);
	};

	const cancelEdit = () => {
		setEditing(false);
		setErrors({});
		setForm(toForm(user));
	};
	
	const saveEdit = async (e) => {
		e?.preventDefault?.();
		if (!editing || saving) return;
		
		const nextErrors = validate(form); // no email rules here
		console.log('VALIDATION', nextErrors)
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length) return;
		
		setSaving(true);
		console.log('PASSES')
		try {
			// Build payload without email
			const payload = {
				phone: form.phone,
				country: form.country,
				bio: form.bio,
			};
			if (user?.role === "customer") payload.customerProfile = form.customerProfile;
			if (user?.role === "shipper")  payload.shipperProfile  = form.shipperProfile;
			console.log(payload)
			await apiUtils.patch("/user/updateUserProfile", payload);
			setEditing(false);
		} catch (err) {
			const apiErr = err?.response?.data;
			setErrors((prev) => ({
				...prev,
				__api: apiErr?.message || "Failed to update profile.",
				...(apiErr?.errors || {}),
			}));
		} finally {
			setSaving(false);
		}
		};
	
	return (
		<div className={`${styles["profile-page"]} ${styles.white}`}>
			<div className="container-xl py-4">
				<div className={`text-center mb-2 ${styles["hero-name"]}`}>
					{user?.fullName || user?.username || "User"}
				</div>

				{/* Avatar*/}
				<div className="text-center mb-3">
					<div className={`${styles["avatar-hero"]} mx-auto`} role="img" aria-label="User avatar">
						<svg viewBox="0 0 24 24" width="96" height="96" aria-hidden>
							<path
								fill="#5b6cff"
								d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5A1.5 1.5 0 0 0 4.5 21h15A1.5 1.5 0 0 0 21 19.5C21 16.5 17 14 12 14Z"
							/>
						</svg>
					</div>
				</div>

				<div className={styles["sheet-tab"]}>Profile</div>

				<form className={styles["profile-sheet"]} onSubmit={saveEdit}>
					{/* Email */}
					<div className={styles["sheet-row"]}>
						<label className={styles["label"]}>Email</label>
						<input
							type="email"
							className={`form-control form-control-sm ${styles["form-control-sm"]}`}
							value={user.email}
							readOnly
							aria-readonly="true"
						/>
					</div>

					{/* Phone */}
					<div className={styles["sheet-row"]}>
						<label className={styles["label"]}>Phone</label>
						<input
							className={`form-control form-control-sm ${styles["form-control-sm"]}`}
							value={form.phone}
							onChange={(e) => setForm({ ...form, phone: e.target.value })}
							disabled={!editing}
							placeholder="Please update your phone"
						/>
						{err("phone") && (
							<div className="invalid-feedback d-block" role="alert">
								{err("phone")}
							</div>
						)}
					</div>

					{/* Bio */}
					<div className={styles["sheet-row"]}>
						<label className={styles["label"]}>Bio</label>
						<textarea
							className={`form-control form-control-sm ${styles["form-control-sm"]}`}
							rows={3}
							value={form.bio}
							onChange={(e) => setForm({ ...form, bio: e.target.value })}
							disabled={!editing}
							placeholder="Tell others a little about you (max 200 chars)"
						/>
						{err("bio") && (
							<div className="invalid-feedback d-block" role="alert">
								{err("bio")}
							</div>
						)}
					</div>

					{/* Customer profile */}
					{user.role === "customer" && (
						<>
							<div className={styles["sheet-row"]}>
								<label className={styles["label"]}>Customer Name</label>
								<input
									className={`form-control form-control-sm ${styles["form-control-sm"]}`}
									value={form.customerProfile?.name || ""}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											customerProfile: { ...(prev.customerProfile || {}), name: e.target.value },
										}))
									}
									disabled={!editing}
									placeholder="Full legal name"
								/>
								{err("customerProfile.name") && (
									<div className="invalid-feedback d-block" role="alert">
										{err("customerProfile.name")}
									</div>
								)}
							</div>

							<div className={styles["sheet-row"]}>
								<label className={styles["label"]}>Customer Address</label>
								<input
									className={`form-control form-control-sm ${styles["form-control-sm"]}`}
									value={form.customerProfile?.address || ""}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											customerProfile: { ...(prev.customerProfile || {}), address: e.target.value },
										}))
									}
									disabled={!editing}
									placeholder="Street/City"
								/>
								{err("customerProfile.address") && (
									<div className="invalid-feedback d-block" role="alert">
										{err("customerProfile.address")}
									</div>
								)}
							</div>
						</>)
					}

					{/* Shipper profile */}
					{user.role === "shipper" && (
						<div className={styles["sheet-row"]}>
							<label className={styles["label"]}>Assigned Hub</label>
							<input
								className={`form-control form-control-sm ${styles["form-control-sm"]}`}
								value={
									typeof form.shipperProfile?.assignedHub === "object"
									? (form.shipperProfile?.assignedHub?.name ||
										form.shipperProfile?.assignedHub?._id ||
										"")
									: (form.shipperProfile?.assignedHub || "")
								}
								onChange={(e) =>
									setForm((prev) => ({
									...prev,
									shipperProfile: {
										...(prev.shipperProfile || {}),
										assignedHub: e.target.value,
									},
									}))
								}
								disabled={!editing}
								placeholder="DistributionHub ID (or pick from a selector)"
							/>
							{err("shipperProfile.assignedHub") && (
								<div className="invalid-feedback d-block" role="alert">
									{err("shipperProfile.assignedHub")}
								</div>
							)}
						</div>
					)}


					{/* Country */}
					<div className={styles["sheet-row"]}>
						<label className={styles["label"]}>Country</label>
						<input
							className={`form-control form-control-sm ${styles["form-control-sm"]}`}
							value={form.country}
							onChange={(e) => setForm({ ...form, country: e.target.value })}
							disabled={!editing}
							placeholder="Country"
						/>
						{err("country") && (
							<div className="invalid-feedback d-block" role="alert">
								{err("country")}
							</div>
						)}
					</div>
					
					{errors.__api && (
						<div className="alert alert-danger py-2 mb-3" role="alert">
							{errors.__api}
						</div>
					)}

					{/* Actions */}
					<div className={`${styles["actions-bottom"]} d-flex justify-content-end`}>
						{!editing ? (
							<button
								type="button"
								className="btn btn-outline-primary"
								onClick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(); }}
							>
								Edit information
							</button>
						) : (
							<>
								<button 
									type="submit" 
									className="btn btn-primary" 
								>
									Save
								</button>
								<button
									type="button"
									className="btn btn-outline-secondary"
									onClick={(e) => { e.preventDefault(); e.stopPropagation(); cancelEdit(); }}
								>
									Cancel
								</button>
							</>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}

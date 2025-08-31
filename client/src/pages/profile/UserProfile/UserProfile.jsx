import { useEffect, useState } from "react";
import styles from "./UserProfile.module.scss";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlices";

export default function UserProfile() {
	// Seed a safe initial user so the page never crashes
	const user = useSelector(selectUser);
	const toForm = (u) => ({
		username: u?.username || "",
		fullName: u?.fullName || "",
		email: u?.email || "",
		phone: u?.phone || "",
		address: u?.address || "",
		country: u?.country || "Vietnam",
		bio: u?.bio || "",
		role: u?.role || "",
		customerProfile: {
			name: u?.customerProfile?.name || "",
			address: u?.customerProfile?.address || "",
		},
		vendorProfile: {
			businessName: u?.vendorProfile?.businessName || "",
			businessAddress: u?.vendorProfile?.businessAddress || "",
		},
		shipperProfile: {
			assignedHub: u?.shipperProfile?.assignedHub || "",
		},
	});

	// Edit mode
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState(toForm(user));

	useEffect(() => {
		if (!editing) setForm(toForm(user));
	}, [user, editing]);


	const startEdit = () => {
		setForm(toForm(user));
		setEditing(true);
	};
	
	const saveEdit = (e) => {
		e?.preventDefault?.();
		// TODO: dispatch(updateProfile(form)) if you have it
		setEditing(false);
	};
	
	const cancelEdit = () => {
		setEditing(false);
		setForm(toForm(user));
	};	  

	if (!user) {
		return <div className="container-xl py-4">Loading profile…</div>;
	}	  

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
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
							disabled={!editing}
							placeholder="Please update your email"
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
					</div>

					{/* Customer profile */}
					{form.role === "customer" && (
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
							</div>
						</>)
					}

					{/* Shipper profile */}
					{form.role === "shipper" && (
						<div className={styles["sheet-row"]}>
							<label className={styles["label"]}>Assigned Hub</label>
							<input
								className={`form-control form-control-sm ${styles["form-control-sm"]}`}
								value={form.shipperProfile?.assignedHub.name || ""}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										shipperProfile: { ...(prev.shipperProfile || {}), assignedHub: e.target.value },
									}))
								}
								disabled={!editing}
								placeholder="DistributionHub ObjectId"
							/>
						</div>)
					}

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
					</div>

					{/* Actions */}
					<div className={`${styles["actions-bottom"]} d-flex justify-content-end`}>
						{!editing ? (
							<button
								type="button"
								className="btn btn-outline-primary"
								onClick={startEdit}
							>
								Edit information
							</button>
						) : (
							<>
								<button type="submit" className="btn btn-primary">
									Save
								</button>
								<button
									type="button"
									className="btn btn-outline-secondary"
									onClick={cancelEdit}
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

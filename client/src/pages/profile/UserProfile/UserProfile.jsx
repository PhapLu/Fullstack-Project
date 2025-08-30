import { useState } from "react";
import styles from "./UserProfile.module.scss";

export default function UserProfile() {
	// Seed a safe initial user so the page never crashes
	const [user, setUser] = useState({
		firstName: "User",
		lastName: "Name",
		phone: "+84 123456789",
		gender: "male", // male | female | other
		dob: "", // ISO date string (yyyy-mm-dd)
		address: {
			hubName: "",
			zip: ""
		}
	});

	// Edit mode
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState(user);

	const startEdit = () => {
		setForm({
			...user,
			dob: (user.dob || "").substring(0, 10),
			address: {
				hubName: user.address?.hubName || "",
				zip: user.address?.zip || "",
				...user.address
			}
		});
		setEditing(true);
	};

	const saveEdit = (e) => {
		e?.preventDefault?.();
		setUser(form);
		setEditing(false);
	};

	const cancelEdit = () => {
		setEditing(false);
		setForm(user);
	};

	return (
		<div className={`${styles["profile-page"]} ${styles.white}`}>
			<div className="container-xl py-4">
				<div className={`text-center mb-2 ${styles["hero-name"]}`}>
					{(user.firstName || "User") + " " + (user.lastName || "Name")}
				</div>

				{/* Simple avatar placeholder — removed change handlers to avoid undefined errors */}
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

				{/* Unified form structure: each field is `div > label + input` */}
				<form className={styles["profile-sheet"]} onSubmit={saveEdit}>
					{/* First Name */}
					<div className={styles["sheet-row"]}>
						<label className={styles["label"]}>First name</label>
						<input
							className={`form-control form-control-sm ${styles["form-control-sm"]}`}
							value={form.firstName}
							onChange={(e) => setForm({ ...form, firstName: e.target.value })}
							disabled={!editing}
						/>
					</div>

					{/* Last Name */}
					<div className={styles["sheet-row"]}>
						<label className={styles["label"]}>Last name</label>
						<input
							className={`form-control form-control-sm ${styles["form-control-sm"]}`}
							value={form.lastName}
							onChange={(e) => setForm({ ...form, lastName: e.target.value })}
							disabled={!editing}
						/>
					</div>

					{/* Contact Number */}
					<div className={styles["sheet-row"]}>
						<label className={styles["label"]}>Contact Number</label>
						<input
							className={`form-control form-control-sm w-auto ${styles["form-control-sm"]}`}
							value={form.phone}
							onChange={(e) => setForm({ ...form, phone: e.target.value })}
							disabled={!editing}
						/>
					</div>

					{/* Gender (converted to select to keep label+input pattern) */}
					<div className={styles["sheet-row"]}>
						<label className={styles["label"]}>Gender</label>
						<select
							className={`form-select form-select-sm w-auto ${styles["form-control-sm"]}`}
							value={form.gender}
							onChange={(e) => setForm({ ...form, gender: e.target.value })}
							disabled={!editing}
						>
							<option value="male">Male</option>
							<option value="female">Female</option>
							<option value="other">Other</option>
						</select>
					</div>

					{/* Date of Birth */}
					<div className={styles["sheet-row"]}>
						<label className={styles["label"]}>Date of Birth</label>
						<input
							type="date"
							className={`form-control form-control-sm w-auto ${styles["form-control-sm"]}`}
							value={form.dob || ""}
							onChange={(e) => setForm({ ...form, dob: e.target.value })}
							disabled={!editing}
						/>
					</div>

					{/* Distribution Hub */}
					<div className={styles["sheet-row"]}>
						<label className={styles["label"]}>Distribution Hub</label>
						<input
							className={`form-control form-control-sm ${styles["form-control-sm"]}`}
							value={form.address?.hubName || ""}
							onChange={(e) =>
								setForm({
									...form,
									address: { ...(form.address || {}), hubName: e.target.value }
								})
							}
							disabled={!editing}
						/>
					</div>

					{/* Zip/Postal code */}
					<div className={styles["sheet-row"]}>
						<label className={styles["label"]}>Zip/Postal code</label>
						<input
							className={`form-control form-control-sm w-auto ${styles["form-control-sm"]}`}
							value={form.address?.zip || ""}
							onChange={(e) =>
								setForm({
									...form,
									address: { ...(form.address || {}), zip: e.target.value }
								})
							}
							disabled={!editing}
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

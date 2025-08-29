// /* Gia Hy-s4053650 */
// import React, { use, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import { useState } from "react";
// import logo from "../../../assets/logo.png";
// import styles from "./AuthForm.module.scss"; // switched to CSS module
// import {
//     faEnvelope,
//     faEye,
//     faEyeSlash,
//     faLock,
//     faLocationDot,
//     faUser,
// } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { apiUtils } from "../../../utils/newRequest";

// const AuthForm = () => {
//     const { mode, role } = useParams(); // mode: signup|signin, role: customer|vendor|shipper
//     const [hubs, setHubs] = useState([]);
//     const isSignup = mode === "signup";
//     const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

//     // dynamic fields
//     const extraSignupFields = {
//         customer: [
// 			// {
// 			// 	key: "name",
// 			// 	placeholder: "Name",
// 			// 	icon: <FontAwesomeIcon icon={faUser} />,
// 			// },
//             // {
//             //     key: "address",
//             //     placeholder: "Address",
//             //     icon: <FontAwesomeIcon icon={faLocationDot} />,
//             // },
//         ],
//         vendor: [
//             {
//                 key: "businessName",
//                 placeholder: "Business Name",
//                 icon: <FontAwesomeIcon icon={faUser} />,
//             },
//             {
//                 key: "businessAddress",
//                 placeholder: "Business Address",
//                 icon: <FontAwesomeIcon icon={faLocationDot} />,
//             },
//         ],
//         shipper: [
//             {
//                 key: "distributionHub",
//                 placeholder: "Select Distribution Hub",
//                 icon: <FontAwesomeIcon icon={faLocationDot} />,
//             },
//         ],
//     };

//     const [show1, setShow1] = useState(false);
//     const [show2, setShow2] = useState(false);

//     const onSubmit = (e) => {
//         e.preventDefault();
//         // TODO: hook up to your API
//     };

//     useEffect(() => {
//         const fetchHubs = async () => {
//             try {
//                 const response = await apiUtils.get("/distributionHub/readDistributionHubs");
//                 console.log(response)
//                 setHubs(response.data.metadata || []);
//             } catch (error) {
//                 console.error("Error fetching distribution hubs:", error);
//             }
//         }
//         if (role === "shipper") {
//             fetchHubs();
//         }
//     }, [role]);
//     return (
//         <div className={styles["auth__card"]}>
//             <div className={styles["auth__panel"]}>
//                 <div className={styles["auth__header"]}>
//                     {isSignup ? <h2>Welcome to</h2> : <h2>Welcome back</h2>}
//                     {isSignup && (
//                         <span className={styles["auth__name"]}>Bloomart</span>
//                     )}
//                 </div>

//                 <p className={styles["auth__text"]}>
//                     {isSignup
//                         ? "Create your new account and start with us now"
//                         : "Log in your account and start with us now"}
//                 </p>

//                 {!isSignup && (
//                     <img
//                         className={styles["auth__logo-form"]}
//                         src={logo}
//                         alt="Logo"
//                     />
//                 )}

//                 <form className={styles["auth__form"]} onSubmit={onSubmit}>
// 					<div className={styles.field}>
//                         <label htmlFor="username" className={styles.ico}>
//                             <FontAwesomeIcon icon={faUser} />
//                         </label>
//                         <input id="username" type="text" placeholder="Username" required />
//                     </div>

// 					<div className={styles.field}>
//                         <label htmlFor="email" className={styles.ico}>
//                             <FontAwesomeIcon icon={faEnvelope} />
//                         </label>
//                         <input id="email" type="email" placeholder="Email" required />
//                     </div>

//                     <div className={styles.field}>
//                         <label className={styles.ico}>
//                             <FontAwesomeIcon icon={faLock} />
//                         </label>
//                         <input
//                             type={show1 ? "text" : "password"}
//                             placeholder="Password"
//                             required
//                         />
//                         <button
//                             type="button"
//                             className={styles.eye}
//                             onClick={() => setShow1((v) => !v)}
//                         >
//                             <FontAwesomeIcon
//                                 icon={show1 ? faEyeSlash : faEye}
//                             />
//                         </button>
//                     </div>

//                     {isSignup && (
//                         <>
//                             <div className={styles.field}>
//                                 <label className={styles.ico}>
//                                     <FontAwesomeIcon icon={faLock} />
//                                 </label>
//                                 <input
//                                     type={show2 ? "text" : "password"}
//                                     placeholder="Confirm password"
//                                     required
//                                 />
//                                 <button
//                                     type="button"
//                                     className={styles.eye}
//                                     onClick={() => setShow2((v) => !v)}
//                                 >
//                                     <FontAwesomeIcon
//                                         icon={show2 ? faEyeSlash : faEye}
//                                     />
//                                 </button>
//                             </div>

//                             {(extraSignupFields[role] || []).map((f) => (
//                                 <label className={styles.field} key={f.key}>
//                                     <label className={styles.ico}>{f.icon}</label>
//                                     <input
//                                         type="text"
//                                         placeholder={f.placeholder}
//                                     />
//                                 </label>
//                             ))}
//                         </>
//                     )}

//                     <button
//                         className={`${styles.btn} ${styles["btn-primary"]} ${styles["auth__submit"]}`}
//                         type="submit"
//                     >
//                         {isSignup ? "Create Account" : "Sign in"}
//                     </button>

//                     <div className={styles.help}>
//                         {isSignup
//                             ? "Have an account? "
//                             : "Don’t have an account yet? "}
//                         <Link
//                             className={styles.link}
//                             to={`/auth/${
//                                 isSignup ? "signin" : "signup"
//                             }/${role}`}
//                         >
//                             {isSignup ? "Sign In" : "Sign Up"}
//                         </Link>
//                     </div>

//                     <div className={`${styles.help} ${styles.small}`}>
//                         {isSignup
//                             ? "Or create an account as a "
//                             : "Or sign in an account as a "}
//                         <div className={styles["help__role-selection"]}>
//                             {["customer", "vendor", "shipper"]
//                                 .filter((r) => r !== role)
//                                 .map((r, i) => (
//                                     <span key={r}>
//                                         {i > 0 && " / "}
//                                         <Link
//                                             className={styles["link-mode"]}
//                                             to={`/auth/${mode}/${r}`}
//                                         >
//                                             {cap(r)}
//                                         </Link>
//                                     </span>
//                                 ))}
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default AuthForm;

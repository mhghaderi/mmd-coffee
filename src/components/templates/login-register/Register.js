import { useState } from "react";
import styles from "./register.module.css";
import Sms from "./Sms";
import Swal from "sweetalert";
import { showSwal } from "@/utils/helpers";

const Register = ({ showloginForm }) => {
    const [isRegisterWithPass, setIsRegisterWithPass] = useState(false);
    const [isRegisterWithOtp, setIsRegisterWithOtp] = useState(false);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const hideOtpForm = () => setIsRegisterWithOtp(false);

    const isValidPhone = (phone) => {
        const cleanPhone = phone.replace(/[\s\-]/g, "");
        const pattern = [/^09[0-9]{9}$/, /^\+989[0-9]{9}$/, /^00989[0-9]{9}$/];
        return pattern.some((pattern) => pattern.test(cleanPhone));
    };

    const isValidEmail = (email) => {
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email);
    };

    const signup = async () => {
        const user = { name, phone, email, password };

        if (!name.trim()) {
            return showSwal("نام را وارد کنید", "error", "باشه");
        }

        if (isValidPhone(phone) == false) {
            return showSwal("یک شماره تماس صحیح وارد کنید", "error", "باشه");
        }

        if (isValidEmail(email) == false) {
            return showSwal("یک ایمیل صحیح وارد کنید", "error", "باشه");
        }

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        });
        console.log(res);
        if (res.status === 201) {
            showSwal("ثبت نام با موفقیت انجام شد", "success", "ورود به پنل کاربری");
        }
    };

    return (
        <>
            {!isRegisterWithOtp ? (
                <>
                    <div className={styles.form} data-aos="zoom-in">
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="نام"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="شماره موبایل (الزامی)  "
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                        />
                        <input
                            className={styles.input}
                            type="email"
                            placeholder="ایمیل (دلخواه)"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />

                        {isRegisterWithPass && (
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="رمز عبور"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        )}
                        {!isRegisterWithPass && (
                            <>
                                <p
                                    style={{ marginTop: "1rem" }}
                                    className={styles.btn}
                                    onClick={() => setIsRegisterWithOtp(true)}
                                >
                                    ثبت نام با کد تایید
                                </p>
                                <button
                                    style={{ marginTop: ".7rem" }}
                                    onClick={() => setIsRegisterWithPass(true)}
                                    className={styles.btn}
                                >
                                    ثبت نام با رمزعبور
                                </button>
                            </>
                        )}
                        {isRegisterWithPass && (
                            <>
                                <p
                                    style={{ marginTop: "1rem" }}
                                    className={styles.btn}
                                    onClick={signup}
                                >
                                    ثبت نام
                                </p>
                                <button
                                    style={{ marginTop: ".7rem" }}
                                    onClick={() => setIsRegisterWithPass(false)}
                                    className={styles.btn}
                                >
                                    ثبت نام با کد تایید
                                </button>
                            </>
                        )}

                        <p onClick={showloginForm} className={styles.back_to_login}>
                            برگشت به ورود
                        </p>
                    </div>
                    <p className={styles.redirect_to_home}>لغو</p>
                </>
            ) : (
                <Sms
                    cancelLoginWithOtp={() => {
                        setIsRegisterWithOtp(false);
                    }}
                />
            )}
        </>
    );
};

export default Register;

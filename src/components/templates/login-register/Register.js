import { useState } from "react";
import styles from "./register.module.css";
import Sms from "./Sms";

const Register = ({ showloginForm }) => {
    const [isRegisterWithPass, setIsRegisterWithPass] = useState(false);
    const [isRegisterWithOtp, setIsRegisterWithOtp] = useState(false);

    const hideOtpForm = () => setIsRegisterWithOtp(false);

    return (
        <>
            {!isRegisterWithOtp ? (
                <>
                    <div className={styles.form}>
                        <input className={styles.input} type="text" placeholder="نام" />
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="شماره موبایل (الزامی)  "
                        />
                        <input className={styles.input} type="email" placeholder="ایمیل (دلخواه)" />

                        {isRegisterWithPass && (
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="رمز عبور"
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
                                <p style={{ marginTop: "1rem" }} className={styles.btn}>
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

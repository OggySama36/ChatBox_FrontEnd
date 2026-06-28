import './login.css'
import { useState, useRef } from 'react'
function Login({AppearStatus, setAppearStatus, createSocket}){
    const [moveUpMail, setMoveUpMail] = useState(false);
    const [moveUpPWD, setMoveUpPWD] = useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [showPWD, setShowPWD] = useState(false);
    const [showRegainPwd, setShowNewPwd] = useState(false);
    const [lockButton, setLock] = useState(false);
    const [forgotState, setForgotState] = useState(false);
    const [progress, setProgress] = useState("");
    const [typeHandle, setTypeHandle] = useState("");
    const [ValueRecover, setValueRecover] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [recheck, setRecheck] = useState("");
    const [disableBtn, setDisable] = useState(false);
    const [checkSuccess, setCheckSuccess] = useState("");
    const [lockAcc, setLockAcc] = useState(false);
    const [countWrong, setCount] = useState(5);
    const [timeLock, setTimeLock] = useState("");
    const [vrfCode, setVrfCode] = useState(["", "", "", "", "", ""]);
    const inputCodeRef = useRef([]);
    function show(e){
        if(password == ""){
            e.target.checked = false;
            return
        }
        else {
          setShowPWD(e.target.checked);
        }
    }
    function check_ValidEmail(emailCheck){
        const checkCondition = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return checkCondition.test(emailCheck);
    }
    function check_ValidTelephone(telCheck){
        const checkCondition = /^[0-9]+$/;
        return checkCondition.test(telCheck);
    }
    function check_ValidPassword(pwdCheck){
        const checkCondition = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        return checkCondition.test(pwdCheck);
    }
    async function deleteOtp(user){
        await fetch(`https://chatbox-backend-3ru8.onrender.com/clearOtp?user=${user}&type=${typeHandle}`);
    }
    async function lockThisAccount(user){
        const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/lockAccount?user=${user}&type=${typeHandle}`);
        const res = await req.json();
        const day = new Date(res.TimeExpire);
        const dayArray = day.toString().split(" ");
        const dayReal = `${dayArray[4]} ${dayArray[0]} ${dayArray[2]}-${dayArray[1]}-${dayArray[3]} `
        setTimeLock(dayReal);
    }
    async function checkLock(email) {
        const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/checkLock?email=${email}`);
        const res = await req.json();
        const day = new Date(res.TimeExpire)
        const dayArray = day.toString().split(" ");
        const dayReal = `${dayArray[4]} ${dayArray[0]} ${dayArray[2]}-${dayArray[1]}-${dayArray[3]} `
        setTimeLock(dayReal);
        return res
    }
    function forgotPwdHandler(){
        return (
            <div 
            className='homeForgotPwd'
            style={{
                opacity: forgotState === true ? 1 : 0,
                pointerEvents: forgotState === true ? "auto" : "none",
                zIndex: forgotState === true ? 11 : -11,
            }}
            >
                <div className = "Exit" 
                onClick={() => {
                    setForgotState(false);
                    setProgress("");
                    setValueRecover("");
                }}
                >
                    &larr;
                </div>
                <div className='boxHandle'>
                    <h1>{progress === "InputVrfCodeInMail" ? "We have sent a verify code" : "SELECT YOUR VERIFICATION METHOD"}</h1>
                    {inputForgot()}
                    <div 
                    className='methodVrf'
                    style={{
                        opacity: progress === "" ? 1 : 0,
                        pointerEvents: progress === "" ? "auto" : "none",
                        zIndex: progress === "" ? 11 : -11,
                    }}
                    >
                        <div 
                        className='emailVrf'
                        onClick={() => {
                            setProgress("GetEmail");
                            setTypeHandle("Mail");
                            setMoveUpMail(false);
                            setMoveUpPWD(false);
                        }}
                        ><span>&rarr;</span> Send verification code to your <b>Email</b></div>
                        <div 
                        className='phoneNumberVrf'
                        onClick={() => {
                            setProgress("GetPhoneNumber");
                            setTypeHandle("Telephone");
                            setMoveUpMail(false);
                            setMoveUpPWD(false);
                        }}
                        ><span>&rarr;</span> Send verification code to your <b>Phone Number</b></div>
                    </div>
                </div>
            </div>
        )
    }
    function lockAccount(){
        return(
            <>
                <div className='lockedAccount'
                    style={{
                        opacity: lockAcc === true ? 1 : 0,
                        pointerEvents: lockAcc === true ? "auto" : "none",
                        zIndex: lockAcc === true ? 100 : -100,
                    }}
                >
                    <p>{`Your account has been locked until ${timeLock}`}</p>
                    <div className='optionsLocked'>
                        <p>Learn more</p>
                        <p
                        onClick={() => {
                            setLockAcc(false);
                            setEmail("");
                            setPassword("");
                            setLock(false);
                        }}
                        >Use Another account</p>
                    </div>
                </div>
            </>
        )
    }
    function inputForgot(){
        if (progress === "GetEmail"){
            return(
                <>
                    <div className='inputEmail'
                    style={{
                        opacity: progress === "GetEmail" ? 1 : 0,
                        pointerEvents: progress === "GetEmail" ? "auto" : "none",
                        zIndex: progress === "GetEmail" ? 11 : -11,
                    }}
                    >
                        <input 
                        type='text' 
                        placeholder='Input your Email'
                        value={ValueRecover}
                        onChange={(e) => {setValueRecover(e.target.value)}}
                        />
                        <button 
                        disabled={disableBtn}
                        onClick={async () => {
                            const checkLocked = await checkLock(ValueRecover);
                            if (checkLocked.Status){
                                setLockAcc(checkLocked.Status);
                                setForgotState(false);
                                setProgress("");
                                setValueRecover("");
                                return
                            }
                            if(ValueRecover.trim() === ""){
                                alert("Email can not be empty!");
                                return
                            }
                            if(!check_ValidEmail(ValueRecover)){
                                alert("Your email is not a valid email!")
                                return
                            }
                            setDisable(true)
                            const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/Recover?email=${ValueRecover}&type=${progress}`);
                            const res = await req.json();
                            if (res.Status){
                                setDisable(false);
                                setProgress("InputVrfCodeInMail");
                            }
                        }}
                        >Send</button>
                    </div>
                </>
            )
        }
        if (progress === "GetPhoneNumber"){
            return(
                <>
                    <div className='inputPhonenum'
                    style={{
                        opacity: progress === "GetPhoneNumber" ? 1 : 0,
                        pointerEvents: progress === "GetPhoneNumber" ? "auto" : "none",
                        zIndex: progress === "GetPhoneNumber" ? 11 : -11,
                    }}
                    >
                        <input 
                        type='text' 
                        placeholder='Input your Phone Number'
                        value={ValueRecover}
                        onChange={(e) => {setValueRecover(e.target.value)}}
                        />
                        <button 
                        disabled={disableBtn}
                        onClick={async () => {
                            if(ValueRecover.trim() === ""){
                                alert("Phone number can not be empty!");
                                return
                            }
                            if(!check_ValidTelephone(ValueRecover)){
                                alert("Your phone number is not a valid Phone number!");
                                return
                            }
                            setDisable(true);
                            const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/Recover?telephone=${ValueRecover}&type=${progress}`);
                            const res = await req.json();
                            if (res.Status){
                                setDisable(false);
                                setProgress("InputVrfCodeInMail");
                            }
                        }}
                        >Send</button>
                    </div>
                </>
            )
        }
        if (progress === "InputVrfCodeInMail"){
            return(
                <>
                    <div className='inputVrfCodeInMail'
                    style={{
                        opacity: progress === "InputVrfCodeInMail" ? 1 : 0,
                        pointerEvents: progress === "InputVrfCodeInMail" ? "auto" : "none",
                        zIndex: progress === "InputVrfCodeInMail" ? 11 : -11,
                    }}
                    >
                        {vrfCode.map((value, index) => {
                            return (
                                <input 
                                type='text'
                                disabled={disableBtn}
                                ref={(el) => inputCodeRef.current[index] = el}
                                maxLength={1} 
                                value={value}
                                onChange={async (e) => {
                                    const newArray = [...vrfCode];
                                    newArray[index] = e.target.value;
                                    setVrfCode(newArray);
                                    if (e.target.value && index < 5) {
                                        inputCodeRef.current[index + 1]?.focus();
                                    }
                                     if (!newArray.includes("")){
                                        setDisable(true);
                                        const inputOtp = newArray.join("");
                                        console.log(inputOtp);
                                        const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/Recover?type=${progress}&email=${ValueRecover}`, {
                                            method: "POST",
                                            headers: {"Content-Type": "application/json"},
                                            body: JSON.stringify({
                                                otp: inputOtp,
                                            })
                                        });
                                        const res = await req.json();
                                        if (res.Status){
                                            setCheckSuccess("Success");
                                            setCount(0);
                                            setDisable(false);
                                            setTimeout(() => {
                                                setProgress("NewPwdFromMail");
                                            }, 700);
                                        }
                                        else {
                                            if(res.ErrorType === "expiredOtp"){
                                                {forgotPwdHandler()}
                                                alert(res.Message);
                                                setDisable(false);
                                                setCheckSuccess("Unsuccess");
                                                setProgress("");
                                                deleteOtp(ValueRecover);
                                            }
                                            if(res.ErrorType === "WrongOtp"){
                                                setCount(countWrong - 1);
                                                setCheckSuccess("Unsuccess");
                                                setDisable(false);
                                                setVrfCode(["", "", "", "", "", ""]);
                                                inputCodeRef.current[0]?.focus();
                                                if (countWrong === 1){
                                                    alert("You have entered the WRONG CODE 5 times. Your account is temporarily locked");
                                                    lockThisAccount(ValueRecover);
                                                    setLockAcc(true);
                                                    deleteOtp(ValueRecover);
                                                    setForgotState(false);
                                                    setCheckSuccess("Unsuccess");
                                                    setDisable(false);
                                                    localStorage.clear();
                                                    setTimeout(() => {
                                                        setProgress("");
                                                        forgotPwdHandler()
                                                    })
                                                }
                                            }
                                        }
                                     }
                                }}
                                onClick={(e) => {
                                    if (index > 0 && vrfCode[index - 1] === "") {
                                        e.preventDefault();
                                        inputCodeRef.current[0].focus();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Backspace" &&
                                        vrfCode[index] === "" &&
                                        index > 0
                                    ) {
                                        inputCodeRef.current[index - 1].focus();
                                    }
                                }}
                                />
                            )
                        })}
                    </div>
                    <h3
                    style={{
                        opacity: checkSuccess !== "" ? 1 : 0,
                        zIndex: checkSuccess !== "" ? 11 : -11
                    }}
                    >{checkSuccess === "Success" ? "Successful" : `Unsuccessful! You have ${countWrong} attempts left`}</h3>
                </>
            )
        }
        if (progress === "NewPwdFromMail"){
            return (
                <>
                    <div 
                    style={{
                        opacity: progress === "NewPwdFromMail" ? 1 : 0,
                        pointerEvents: progress === "NewPwdFromMail" ? "auto" : "none",
                        zIndex: progress === "NewPwdFromMail" ? 11 : -11,
                    }}
                    className='regainPwd'>
                        <div className='bothNewPwd'>
                            <label>Input your new password</label>
                            <input 
                            type={showRegainPwd ? "text" : "password"}
                            value={newPwd}
                            onChange={(e) => {
                                setNewPwd(e.target.value);
                                if(!check_ValidPassword(newPwd)){
                                    e.target.style.border = "1px solid red";
                                }
                                else {
                                    e.target.style.border = "1px solid rgb(51, 255, 0)";
                                }
                            }}
                            />
                        </div>
                        <div className='bothNewPwd'>
                            <label>Confirm your new password</label>
                            <input 
                            type={showRegainPwd ? "text" : "password"}
                            value={recheck}
                            onChange={(e) => {
                                setRecheck(e.target.value);
                                if(e.target.value !== newPwd){
                                    e.target.style.border = "1px solid red";
                                }
                                else {
                                    e.target.style.border = "1px solid rgb(51, 255, 0)";
                                }
                            }}
                            />
                        </div>
                        <div className='optionSend'>
                            <div className='showNewPwd'>
                                <input 
                                type='checkbox' 
                                className='showPwd'
                                onClick={() => {
                                    if(!showRegainPwd){
                                        setShowNewPwd(true);
                                    }
                                    else{
                                        setShowNewPwd(false);
                                    }
                                }}
                                />
                                <label>Show</label>
                            </div>
                            <button
                            disabled={disableBtn}
                            onClick={async () => {
                                if(newPwd.trim() === ""){
                                    alert("Your password cannot be empty!");
                                    return
                                }
                                if(!check_ValidPassword(newPwd)){
                                    alert('Your password has to include:\n' +
                                        'At least 8 characters\n' +
                                        'Contains at least one uppercase letter\n' +
                                        'Contains at least one lowercase letter\n' +
                                        'Contains at least one number\n' +
                                        'Contains at least one special character'
                                    )
                                    return
                                }
                                setDisable(true);
                                const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/Recover?email=${ValueRecover}&type=${progress}`, {
                                    method: "POST",
                                    headers:{
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        NewPwd: recheck
                                    })
                                });
                                const res = await req.json();
                                if (res.Status){
                                    alert(res.Message);
                                    setDisable(false);
                                    setValueRecover("");
                                    setNewPwd("");
                                    setRecheck("");
                                    setTypeHandle("");
                                    setForgotState(false);
                                    deleteOtp(ValueRecover);
                                }
                            }}
                            >Accept</button>
                        </div>
                    </div>
                </>
            )
        }
    }
    return (
        <>
            {forgotPwdHandler()}
            {lockAccount()}
            <div className="mainBox_Login" 
            style={{
                opacity: AppearStatus === "login" ? 1 : 0,
                zIndex: AppearStatus === "login" ? 10 : -10,
                pointerEvents: AppearStatus === "login" ? "auto" : "none",
            }}
            >
                <h1 
                className='welcomeLogin'
                style={{
                    fontSize: "70px",
                    letterSpacing: "20px",
                    transition: "all 0.3s ease",
                    textShadow: "0px 0px 30px white"
                }}>WELCOME</h1>
                <form className='login_form' autoComplete="off">
                    <div className='both'>
                        <label style = {{
                            transform: moveUpMail ? "translateY(-20px)" : "translateY(0px)",
                            textShadow: moveUpMail ? "0 0 4px white" : "none"
                        }}>Email</label>
                        <input type='text' 
                        id="email_login" 
                        value = {email}
                        onClick={() => {
                            setMoveUpMail(true);
                        }}
                        onBlur={() => {
                            setMoveUpMail(false)
                        }}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                        />
                    </div>
                    <div className='both'>
                        <label style = {{
                            transform: moveUpPWD ? "translateY(-20px)" : "translateY(0px)",
                            textShadow: moveUpPWD ? "0 0 4px white" : "none"
                        }}>Password</label>
                        <div className='attachment_pwd'>
                            <input type={showPWD ? "text" : "password"} id="pwd_login" 
                            value = {password}
                            onClick={() => {
                                setMoveUpPWD(true);
                            }}
                            onBlur={() => {
                                setMoveUpPWD(false)
                            }}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            />
                            <input type='checkbox' 
                                onClick={show}
                            />
                        </div>
                        <div className='forgotPwd' 
                        onClick={() => {
                            setForgotState(true);
                        }}
                        >I forgot my password</div>
                    </div>
                    <div className='buttonForm'>
                        <p className='textSwitchForm' onClick={function(){
                            setAppearStatus("register")
                            setPassword("");
                        }}>You don't have an account? Register now</p>
                    <button 
                    disabled = {lockButton}
                    onClick={async function(e){
                        e.preventDefault();
                        if(email === "" || password === ""){
                            alert('Please fill out your information first!');
                            return
                        }
                        setLock(true);
                        const checkLocked = await checkLock(email);
                        if(checkLocked.Status){
                            setLockAcc(checkLocked.Status);
                            return
                        }
                        const res = await fetch('https://chatbox-backend-3ru8.onrender.com/LoginHandler', {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                email: email,
                                password: password,
                            })
                        });
                        const loginResponse = await res.json();
                        if (loginResponse.Status){
                            alert(loginResponse.Message);
                            localStorage.setItem('user', JSON.stringify({ 
                                'id': loginResponse.Id,
                                'name': loginResponse.Username, 
                                'birthday': loginResponse.Birthday,
                                'telephone': loginResponse.Telephone, 
                                'email': loginResponse.Email, 
                                'avatar': `https://chatbox-backend-3ru8.onrender.com/uploaded/${loginResponse.Avatar}`,
                                'maxim': loginResponse.Maxim
                            })); 
                            setLock(false);
                            setEmail("");
                            setPassword("");
                            setAppearStatus("dashboard");
                            createSocket(loginResponse.Id);
                        }
                        else {
                            if (loginResponse.ErrorType == "IncorrectPWD"){
                                alert(loginResponse.Message);
                                setLock(false);
                                setPassword("");
                            }
                            if (loginResponse.ErrorType == "Unfound"){
                                alert(loginResponse.Message);
                                setLock(false);
                                setAppearStatus("register")
                                setEmail("");
                                setPassword("");
                            }
                        }
                    }}>Log in</button> 
                    </div>
                </form>
            </div>
        </>
    )
}
export default Login


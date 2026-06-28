import { useState } from "react";
import './register.css'
function Register({AppearStatus, setAppearStatus, createSocket}){
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
    function check_ValidPassword(pwdCheck){
        const checkCondition = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        return checkCondition.test(pwdCheck);
    }
    function check_ValidTelephone(telCheck){
        const checkCondition = /^[0-9]+$/;
        return checkCondition.test(telCheck);
    }
    const [moveUpUSN, setMoveUpUSN] = useState(false);
    const [moveUpPWD, setMoveUpPWD] = useState(false);
    const [showPWD, setShowPWD] = useState(false);
    const [moveUpEmail, setMoveUpEmail] = useState(false);
    const [moveUpTel, setMoveUpTel] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [telephone, setTelephone] = useState("");
    const [lockButton, setLock] = useState(false);
    return (
        <div 
            className="mainBox_Register"
            style = {{
                opacity: AppearStatus === "register" ? 1 : 0,
                zIndex: AppearStatus === "register" ? 10 : -10,
                pointerEvents: AppearStatus === "register" ? "auto" : "none",
            }}
            >
            <form className='register_form' autoComplete="off">
                 <div className='both'>
                    <label style = {{
                        transform: moveUpUSN ? "translateY(-20px)" : "translateY(0px)",
                        textShadow: moveUpUSN ? "0 0 4px white" : "none"
                    }}>Username</label>
                    <input type='text' 
                    id="username_register" 
                    value = {username}
                    onChange={function(e){
                        setUsername(e.target.value);
                    }}
                    onClick={() => {
                        setMoveUpUSN(true);
                    }}
                    onBlur={() => {
                        setMoveUpUSN(false);
                    }}
                    />
                </div>
                <div className='both'>
                    <label style = {{
                        transform: moveUpPWD ? "translateY(-20px)" : "translateY(0px)",
                        textShadow: moveUpPWD ? "0 0 4px white" : "none"
                    }}>Password</label>
                    <div className='attachment_pwd'>
                        <input type={showPWD ? "text" : "password"} 
                        id="pwd_register" 
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
                </div>
                <div className='both'>
                    <label style = {{
                        transform: moveUpEmail ? "translateY(-20px)" : "translateY(0px)",
                        textShadow: moveUpEmail ? "0 0 4px white" : "none"
                    }}>Email</label>
                    <input id = "email" 
                    type="text"
                    value={email}
                    onChange={function(e){
                        setEmail(e.target.value);
                    }}
                    onClick={function(){
                        setMoveUpEmail(true);
                    }}
                    onBlur={function(){
                        setMoveUpEmail(false);
                    }}
                    />
                </div>
                <div className='both'>
                    <label style = {{
                        transform: moveUpTel ? "translateY(-20px)" : "translateY(0px)",
                        textShadow: moveUpTel ? "0 0 4px white" : "none"
                    }}>Telephone</label>
                    <input id = "phoneNumber" 
                    type="text"
                    value = {telephone}
                    onChange={function(e){
                        setTelephone(e.target.value);
                    }}
                    onClick={function(){
                        setMoveUpTel(true);
                    }}
                    onBlur={function(){
                        setMoveUpTel(false);
                    }}
                    />
                </div>
                <div className='buttonForm'>
                    <p className='textSwitchForm' onClick={function(){
                        setAppearStatus("login");
                        setPassword("");
                    }}>You had an account? Log in now</p>
                   <button 
                   disabled = {lockButton}
                   onClick={async function(e){
                    e.preventDefault();
                    if (username === "" || password === "" || email === "" || telephone === ""){
                        alert('Please fill out your information fisrt!!');
                        return
                    }
                    if(!check_ValidPassword(password)){
                        alert('Your password has to include:\n' +
                            'At least 8 characters\n' +
                            'Contains at least one uppercase letter\n' +
                            'Contains at least one lowercase letter\n' +
                            'Contains at least one number\n' +
                            'Contains at least one special character'
                        )
                        setPassword("");
                        return
                    }
                    if(!check_ValidEmail(email)){
                        alert('Your Email is not valid!');
                        setEmail("");
                        return
                    }
                    if(!check_ValidTelephone(telephone)){
                        alert('Your Telephone is not valid!');
                        setTelephone("");
                        return
                    }
                    setLock(true);
                    const res = await fetch('https://chatbox-backend-3ru8.onrender.com/RegisterHandler', { 
                        method: "POST", 
                        credentials: "include",
                        headers: { "Content-Type": "application/json", }, 
                        body: JSON.stringify({ 
                            username: username, 
                            password: password, 
                            email: email, 
                            telephone: telephone, 
                        }) 
                    }); 
                    const registerResponse = await res.json(); 
                    if(registerResponse.Status){ 
                        alert(registerResponse.Message);
                        setLock(false);
                        setUsername("");
                        setPassword("");
                        setEmail("");
                        setTelephone("");
                        setAppearStatus("dashboard");
                        localStorage.setItem('user', JSON.stringify({ 
                            'id': registerResponse.Id,
                            'name': registerResponse.Username, 
                            'birthday': registerResponse.Birthday,
                            'telephone': registerResponse.Telephone, 
                            'email': registerResponse.Email, 
                            'avatar': `https://chatbox-backend-3ru8.onrender.com/uploaded/${registerResponse.Avatar}`,
                            'maxim': registerResponse.Maxim
                        }));
                        createSocket(registerResponse.Id);
                        console.log("đã kết nối");
                    }
                    else {
                        alert(registerResponse.Message);  
                        setLock(false);
                        setUsername("");
                        setPassword("");
                        setEmail("");
                        setTelephone("");
                    }
                   }}>Register</button> 
                </div>
            </form>
            <div className="welcomeRegister">
                <span>W</span>
                <span>E</span>
                <span>L</span>
                <span>C</span>
                <span>O</span>
                <span>M</span>
                <span>E</span>
            </div>
        </div>
    )
}
export default Register

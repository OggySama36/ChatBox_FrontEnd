import './dashboard.css'
import { useEffect, useState } from 'react'
import { useRef } from 'react'
import Menu from './menu'
import Friend from './friend'
import App from '../App'

function Dashboard({AppearStatus, setAppearStatus, socket}){
    const [profileStatus, setProfileStatus] = useState(false);
    const [currentChat, setCurrentChat] = useState(null);
    const [onMessage, setOnMessage] = useState("");
    const [changeName, setChangeName] = useState(false);
    const [changeNameValue, setChangeNameValue] = useState("");
    const [chating, setChating] = useState("");
    const [messageChat, setMessageChat] = useState([]);
    const [info, setChangeInfo] = useState("");
    const [valueInfo, setValueInfo] = useState("");
    const avatarRef = useRef(null);
    const [history_chatbox, setHistory_chat] = useState([]);
    const [listBlocked, setListBlocked] = useState([]);
    const [avatar, setAvatar] = useState(JSON.parse(localStorage.getItem('user'))?.avatar);
    const [pwd, setPwd] = useState("");
    const [recheckPwd, setRecheck] = useState("");
    const [oldPwd, setOldPwd] = useState("");
    const [changePwdState, setChangePwdState] = useState(false);
    const [showChangePwd, setShow] = useState(false);
    const pwdRef = useRef(null);
    const reCheckRef = useRef(null);
    const [AvatarPartner, setAvatarPartner] = useState("");

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 680);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 680);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const [mobileView, setMobileView] = useState("friend");

    const goToChat = (id, name, avatar) => {
        setCurrentChat(id);
        setOnMessage(name);
        setAvatarPartner(avatar);
        if (isMobile) setMobileView("chat");
    };
    useEffect(() => {
        async function loadMessage(){
            if(!currentChat){
                return
            }
            setMessageChat([]);
            const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/loadMessage?idSender=${JSON.parse(localStorage.getItem('user'))?.id}&idReceiver=${currentChat}`)
            const res = await req.json()
            if(AppearStatus === "dashboard"){
                res.forEach((message) => {
                    setMessageChat((prev) => [...prev, message]);
                })
            } 
            else {
                return
            }
        }
        loadMessage();
    }, [currentChat, AppearStatus]);
    useEffect(() => {
        if(!socket){
            return
        }
        const handleMessage = (event) => {
            const listen = JSON.parse(event.data)
            if(listen.Type === "send"){
                setMessageChat((prev) => [...prev, listen])
            }
        }
        socket.addEventListener("message", handleMessage);
        return () => {
            socket.removeEventListener("message", handleMessage);
        }
    }, [socket])
    function resetValue(){
        setChangeName(false);
        setValueInfo("");
        setChangeNameValue("");
        setOldPwd("");
        setPwd("");
        setRecheck("");
        setChangePwdState(false);
        setShow(false);
        pwdRef.current.classList.remove("validPwd");
        pwdRef.current.classList.remove("InvalidPwd");
        reCheckRef.current.classList.remove("validPwd");
        reCheckRef.current.classList.remove("InvalidPwd");
    }
    async function clearCookie(){
       await fetch("https://chatbox-backend-3ru8.onrender.com/clearCookie", {
            method: "POST",
            credentials: "include"
       });        
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
    async function EmailANDTelephoneHandler(){
        if (info === "Email"){
            if (valueInfo.trim() === ""){
                alert("Email cannot be empty");
                return
            }
            if (!check_ValidEmail(valueInfo)){
                alert("Your email is not a valid email!");
                return
            }
            if (String(valueInfo) === String(JSON.parse(localStorage.getItem('user'))?.email)) {
                alert("The new email cannot be identical to the current email!");
                return;
            }
        }
        if (info === "Telephone"){
            if (valueInfo.trim() === ""){
                alert("Telephone cannot be empty");
                return
            }
            if (!check_ValidTelephone(valueInfo)){
                alert("Your telephone is not a valid telephone!");
                return
            }
            if (String(valueInfo) === String(JSON.parse(localStorage.getItem('user'))?.telephone)) {
                alert("The new phone number cannot be identical to the current phone number!");
                return;
            }
        }
        const changeInfoRequest = await fetch(`https://chatbox-backend-3ru8.onrender.com/editInformation?id=${JSON.parse(localStorage.getItem('user')).id}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Type: info,
                Value: valueInfo,
            })
        });
        const changeInfoResult = await changeInfoRequest.json();
        if(changeInfoResult.Status){
            alert(changeInfoResult.Message);
            setValueInfo("");
            setChangeInfo("");
            if (info === "Email"){
                const user = JSON.parse(localStorage.getItem('user'));
                user.email = changeInfoResult.Email;
                localStorage.setItem('user', JSON.stringify(user));
            }
            if (info === "Telephone") {
                const user = JSON.parse(localStorage.getItem('user'));
                user.telephone = changeInfoResult.Telephone;
                localStorage.setItem('user', JSON.stringify(user));
            }
        }
        else {
            alert(changeInfoResult.Message);
            setValueInfo("");
        }
    }
    async function BirthdayHandler(){
        const birthday_parts = valueInfo.split("-");
        const goodBirthday = `${birthday_parts[2]}/${birthday_parts[1]}/${birthday_parts[0]}`
        const changeBirthdayRequest = await fetch(`https://chatbox-backend-3ru8.onrender.com/editInformation?id=${JSON.parse(localStorage.getItem('user')).id}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Type: info,
                Value: goodBirthday,
            })
        });
        const changeBirthdayResult = await changeBirthdayRequest.json();
        if(changeBirthdayResult.Status){
            alert(changeBirthdayResult.Message);
            setValueInfo("");
            setChangeInfo("");
            const user = JSON.parse(localStorage.getItem('user'));
            user.birthday = goodBirthday;
            localStorage.setItem('user', JSON.stringify(user));
        }
        else {
            alert(changeBirthdayResult.Message);
            setValueInfo("");
        }
    }
    async function MaximHandler(){
        const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/editInformation?id=${IdSelf}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Type: info,
                Value: valueInfo,
            })
        })
        const res = await req.json()
        if(res.Status){
            setValueInfo("");
            setChangeInfo("");
            const user = JSON.parse(localStorage.getItem('user'));
            user.maxim = res.Maxim;
            localStorage.setItem('user', JSON.stringify(user));
        }
    }
    function boxChangePersonalInformation(){
        if (info === "Email" || info === "Telephone"){
            return (
                <div 
                className='changePersonalInformation'
                style = {{
                    zIndex: info === "Email" || info === "Telephone" ? 102 : -102,
                    pointerEvents: info === "Email" || info === "Telephone" ? "auto" : "none",
                    opacity: info === "Email" || info === "Telephone" ? 1 : 0,
                }}
                >
                    <div className='titleChangeInformation'>
                        <div className='exitChangeInformation' 
                        onClick={function(){
                            setChangeInfo("")
                        }}
                        >&larr;</div>
                        <h3>Input your {info}: </h3>
                    </div>
                    <input 
                    type='text'
                    className='inputChanges'
                    placeholder='Aa' 
                    value = {valueInfo}
                    onChange={function(e){
                        setValueInfo(e.target.value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter"){
                            EmailANDTelephoneHandler();
                        }
                    }}
                    />
                    <button className = "saveBtn" onClick={function(){
                        EmailANDTelephoneHandler();
                    }}>Save</button>
                </div>
            )
        }
        if (info === "Birthday"){
            return (
                <div 
                className='changePersonalInformation'
                style = {{
                    zIndex: info === "Birthday" ? 102 : -102,
                    pointerEvents: info === "Birthday" ? "auto" : "none",
                    opacity: info === "Birthday" ? 1 : 0,
                }}
                >
                    <div className='titleChangeInformation'>
                        <div className='exitChangeInformation' 
                        onClick={function(){
                            setChangeInfo("")
                        }}
                        >&larr;</div>
                        <h3>Input your {info}: </h3>
                    </div>
                    <input 
                    type="date"
                    className='inputChanges'
                    placeholder='Aa' 
                    value = {valueInfo}
                    onChange={function(e){
                        setValueInfo(e.target.value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter"){
                            BirthdayHandler();
                        }
                    }}
                    />
                    <button className = "saveBtn" 
                    onClick={function(){
                        BirthdayHandler();
                    }}>Save</button>
                </div>
            )
        }
        if (info === "Maxim"){
            return (
                <div 
                className='changePersonalInformation'
                style = {{
                    zIndex: info === "Maxim" ? 102 : -102,
                    pointerEvents: info === "Maxim" ? "auto" : "none",
                    opacity: info === "Maxim" ? 1 : 0,
                }}
                >
                    <div className='titleChangeInformation'>
                        <div className='exitChangeInformation' 
                        onClick={function(){
                            setChangeInfo("")
                        }}
                        >&larr;</div>
                        <h3>Input your {info}: </h3>
                    </div>
                    <input 
                    type="text"
                    className='inputChanges'
                    placeholder='Aa' 
                    value = {valueInfo}
                    onChange={function(e){
                        setValueInfo(e.target.value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter"){
                            MaximHandler();
                        }
                    }}
                    />
                    <button className = "saveBtn" 
                    onClick={function(){
                        MaximHandler();
                    }}>Save</button>
                </div>
            )
        }
    }
    async function unlockThisFriend(idFriend){
        await fetch(`https://chatbox-backend-3ru8.onrender.com/Unlock?idCurrent=${JSON.parse(localStorage.getItem('user'))?.id}&idFriend=${idFriend}`);
    }
    const IdSelf = JSON.parse(localStorage.getItem('user'))?.id;
    const isBlocker = listBlocked?.some(
        element => String(element.Blocker) === String(IdSelf) && String(element.BeBlocked) === String(currentChat)
    );
    const isBlocked = listBlocked?.some(
        element => String(element.Blocker) === String(currentChat) && String(element.BeBlocked) === String(IdSelf)
    );
    function getBlockContent(){
        if(isBlocker) return (
            <div className='blockNotification'>
                <p>{`You have blocked ${onMessage}`}</p> 
                <p
                title='Unlock'
                className='unlock'
                onClick={() => {
                    const warning = confirm(`Are you sure you want to unlock ${onMessage}?`);
                    if (warning){
                        unlockThisFriend(currentChat);
                        socket.send(JSON.stringify({
                            Case: "UnlockFriend",
                            one_Block: IdSelf,
                            one_BeBlocked: currentChat,
                        }));
                    }
                }}
                >Unlock</p>
            </div>
        )
        if(isBlocked) return (
            <div className='blockNotification'>
                <p>{`You have been blocked by ${onMessage}`}</p> 
            </div>
        )
        else return (
            <>
                <input placeholder='Aa'
                value = {chating}
                onChange={function(e){
                    setChating(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && chating.trim() !== ""){
                        setMessageChat([
                            ...messageChat,
                            {
                                Receiver: currentChat,
                                Sender: JSON.parse(localStorage.getItem('user'))?.id,
                                Content: chating
                            }
                        ]);
                        socket.send(JSON.stringify({
                            Receiver: currentChat,
                            Sender: JSON.parse(localStorage.getItem('user'))?.id,
                            Message: chating
                        }));
                        setChating("");
                    }
                }}
            />
            <div className='sendIcon'>
                <div 
                className='IconSend' 
                onClick={function(){
                    if (chating.trim() === ""){
                        return
                    } 
                    else {
                        setMessageChat([
                            ...messageChat,
                            {
                                Receiver: currentChat,
                                Sender: JSON.parse(localStorage.getItem('user'))?.id,
                                Content: chating
                            }
                        ]);
                        socket.send(JSON.stringify({
                            Receiver: currentChat,
                            Sender: JSON.parse(localStorage.getItem('user'))?.id,
                            Message: chating
                        }))
                        setChating("");
                    }
                }}
                >&#10148;</div>
            </div>
            </>
        )
    }
    function changePwdFunc(){
        return (
            <div className='changePwdBox'
            style = {{
                zIndex: changePwdState === true ? 102 : -102,
                pointerEvents: changePwdState === true ? "auto" : "none",
                opacity: changePwdState === true ? 1 : 0,
            }}
            >
                <div className='exitChangePwd' 
                onClick={function(){
                    setChangePwdState(false);
                    setOldPwd("");
                    setPwd("");
                    setRecheck("");
                    setShow(false);
                    pwdRef.current.classList.remove("validPwd");
                    pwdRef.current.classList.remove("InvalidPwd");
                    reCheckRef.current.classList.remove("validPwd");
                    reCheckRef.current.classList.remove("InvalidPwd");
                }}
                >&larr;</div>
                <input 
                type={showChangePwd ? 'text' : 'password'} 
                value={oldPwd}
                placeholder='Input your old password'
                onChange={(e) => {
                    setOldPwd(e.target.value);
                }}
                />
                <input
                ref={pwdRef}
                type={showChangePwd ? 'text' : 'password'}
                value={pwd}
                placeholder='Input your new password'
                onChange={(e) => {
                    setPwd(e.target.value);
                    if(!check_ValidPassword(pwd) || pwd.trim() === ""){
                        e.target.classList.add("InvalidPwd");
                        e.target.classList.remove("validPwd");
                    }
                    else{
                        e.target.classList.remove("InvalidPwd");
                        e.target.classList.add("validPwd");
                    }
                }}
                />
                <input
                ref={reCheckRef}
                type={showChangePwd ? 'text' : 'password'}
                value={recheckPwd}
                placeholder='Confirm your new password'
                onChange={(e) => {
                    setRecheck(e.target.value);
                    if(e.target.value !== pwd || e.target.value === ""){
                        e.target.classList.add("InvalidPwd");
                        e.target.classList.remove("validPwd");
                    }
                    else{
                        e.target.classList.remove("InvalidPwd");
                        e.target.classList.add("validPwd");
                    }
                }}
                />
                <div className='handleChangePwd'>
                    <div className='boxShow'>
                        <input
                        type='checkbox'
                        onClick={() => {
                            if(!showChangePwd){
                                setShow(true);
                            }
                            else{
                                setShow(false);
                            }
                        }} 
                        />
                        <p>Show</p>
                    </div>
                    <button 
                    className='SaveNewPwd'
                    onClick={async () => {
                        if(oldPwd.trim() === ""){
                            alert("Your current password cannot be empty!");
                            return
                        }
                        if(pwd.trim() === ""){
                            alert("Your new password cannot be empty!");
                            return
                        }
                        if(recheckPwd.trim() === ""){
                            alert("Please confirm your new password!");
                            return
                        }
                        if(!check_ValidPassword(pwd)){
                            alert('Your password has to include:\n' +
                                'At least 8 characters\n' +
                                'Contains at least one uppercase letter\n' +
                                'Contains at least one lowercase letter\n' +
                                'Contains at least one number\n' +
                                'Contains at least one special character'
                            )
                            return
                        }
                        if(recheckPwd !== pwd){
                            alert("Your confirm password need to be the same with your new password!");
                            return
                        }
                        const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/ChangePwdHandler?id=${IdSelf}`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                OldPwd: oldPwd,
                                NewPwd: recheckPwd
                            })
                        })
                        const res = await req.json();
                        if (res.Status){
                            alert(res.Message);
                            setChangePwdState(false);
                            setOldPwd("");
                            setPwd("");
                            setRecheck("");
                            setShow(false);
                            pwdRef.current.classList.remove("validPwd");
                            pwdRef.current.classList.remove("InvalidPwd");
                            reCheckRef.current.classList.remove("validPwd");
                            reCheckRef.current.classList.remove("InvalidPwd");
                            return
                        }
                        else {
                            alert(res.Message);
                            setOldPwd("");
                            setPwd("");
                            setRecheck("");
                            setShow(false);
                            pwdRef.current.classList.remove("validPwd");
                            pwdRef.current.classList.remove("InvalidPwd");
                            reCheckRef.current.classList.remove("validPwd");
                            reCheckRef.current.classList.remove("InvalidPwd");
                        }
                    }}
                    >Save</button>
                </div>
            </div>
        )
    }
    return (
        <>
            {boxChangePersonalInformation()}
            {changePwdFunc()}
            <div className="home" style = {{
                opacity: AppearStatus === "dashboard" && (!isMobile || mobileView === "chat") ? 1 : 0,
                zIndex: AppearStatus === "dashboard" && (!isMobile || mobileView === "chat") ? 100 : -100,
                pointerEvents: AppearStatus === "dashboard" && (!isMobile || mobileView === "chat") ? "auto" : "none",
            }}>
               {onMessage === "" ? (<><h1 className='startTitle'>Start a message now</h1></>) : (
                <>
                    <div className='titlePartner'>
                        {isMobile && (
                            <span
                                className='exitChating'
                                onClick={() => setMobileView("friend")}
                                style={{
                                    cursor: "pointer",
                                    fontSize: "24px",
                                    padding: "0 10px",
                                }}
                            >&#8592;</span>
                        )}
                        <img src={AvatarPartner} className='avatarPartner'/>
                        <h1>{onMessage}</h1>
                    </div>
                    <div className='boxChat' >
                        {messageChat.map(function(message){
                            return (
                                <>
                                    <div className='boxMessageSender'>
                                        {message.Sender === JSON.parse(localStorage.getItem('user'))?.id && message.Receiver === currentChat ? message.Content : null}
                                    </div>
                                    <div className='boxMessageReceiver'>
                                        {message.Receiver === JSON.parse(localStorage.getItem('user'))?.id && message.Sender === currentChat ? message.Content : null}
                                    </div>
                                </>
                            )
                        })}
                    </div>
                    <div className='sendBox'>
                        {getBlockContent()}
                    </div>
                </>
               )}
            </div>
            <Menu AppearStatus={AppearStatus} 
            profileStatus={profileStatus} 
            setProfileStatus={setProfileStatus}
            onMessage = {onMessage}
            setOnMessage = {setOnMessage}
            currentChat = {currentChat}
            setCurrentChat = {setCurrentChat}
            isMobile={isMobile}
            mobileView={mobileView}
            setMobileView={setMobileView}
            goToChat={goToChat}
            setAvatarPartner={setAvatarPartner}
            />
            <Friend 
            AppearStatus={AppearStatus}
            onMessage = {onMessage}
            setOnMessage = {setOnMessage}
            currentChat = {currentChat}
            setCurrentChat = {setCurrentChat}
            socket = {socket}
            history_chatbox = {history_chatbox}
            setHistory_chat = {setHistory_chat}
            listBlocked = {listBlocked}
            setListBlocked = {setListBlocked}
            unlockThisFriend = {unlockThisFriend}
            isMobile={isMobile}
            mobileView={mobileView}
            setMobileView={setMobileView}
            goToChat={goToChat}
            setAvatarPartner={setAvatarPartner}
            />
            <div 
            className='changeNameBox'
            style = {{
                zIndex: changeName === true ? 102 : -102,
                pointerEvents: changeName === true ? "auto" : "none",
                opacity: changeName === true ? 1 : 0,
            }}
            >
                <div className='titleChangeName'>
                    <div className='exitChangeName' 
                    onClick={function(){
                        setChangeName(false);
                    }}
                    >&larr;</div>
                    <h3>Input your name: </h3>
                </div>
                <input 
                className='inputChanges'
                placeholder='Aa' 
                value = {changeNameValue}
                onChange={function(e){
                    setChangeNameValue(e.target.value);
                }}
                />
                <button className = "saveBtn" onClick={async function(){
                    if (changeNameValue.trim() === ""){
                        alert("Name cannot be empty");
                        return
                    }
                    const changeNameRequest = await fetch(`https://chatbox-backend-3ru8.onrender.com/ChangeNameHandler?id=${JSON.parse(localStorage.getItem('user'))?.id}`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            Username: changeNameValue,
                        })
                    });
                    const changeNameResult = await changeNameRequest.json();
                    if(changeNameResult.Status){
                        alert(changeNameResult.Message);
                        setChangeNameValue("");
                        setChangeName(false);
                        const user = JSON.parse(localStorage.getItem('user'));
                        user.name = changeNameValue;
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                    else {
                        alert(changeNameResult.Message);
                        setChangeNameValue("");
                    }
                }}>Save</button>
            </div>
            <div 
            className='profile'
            style = {{
                zIndex: profileStatus === true ? 101 : -101,
                pointerEvents: profileStatus === true ? "auto" : "none",
                opacity: profileStatus === true ? 1 : 0,
            }}
            >
                <div className='title'>
                    <div className='exitProfile'>
                        <div title = "Exit" onClick={function(){
                            setProfileStatus(false);
                            setChangeName(false);
                            }}>&larr;
                        </div>
                    </div>
                    <div className='nameProfile'>
                        {JSON.parse(localStorage.getItem('user'))?.name}
                        <div 
                        title='Change Name'
                        className='changeName'
                        onClick={function(){
                            setChangeName(true);
                            setValueInfo("");
                            setChangeNameValue("");
                        }}
                        >&#128393;</div>
                    </div>
                </div>
                <div className='bothInfoProfile'>
                    <div className='profileBox1'>
                        <img 
                        title='Change Avatar'
                        src = {avatar}
                        className='avatarProfile'
                        onClick={function(){
                            avatarRef.current.click();
                        }}
                        />
                        <hr style = {{
                            width: "100%",
                            height: "1px",
                            backgroundColor: "black",
                        }}/>
                        <h1>Personal Information</h1>
                        <ul style={{
                            lineHeight: "1.5"
                        }}>
                            <li title='Change Birthday'>Birthday: <b>{JSON.parse(localStorage.getItem('user'))?.birthday}</b>  <span 
                                className = "editBirthday" 
                                onClick={() => {
                                    setChangeInfo("Birthday");
                                    resetValue();
                            }}>&#128393;</span></li>
                            <li title='Change Email'>Email: <b>{JSON.parse(localStorage.getItem('user'))?.email}</b>  <span 
                                className = "editEmail"
                                onClick={() => {
                                    setChangeInfo("Email");
                                    resetValue();
                                }}
                            >&#128393;</span></li>
                            <li title='Change Telephone'>Telephone: <b>{JSON.parse(localStorage.getItem('user'))?.telephone}</b>  <span 
                                className = "editTelephone"
                                onClick={() => {
                                    setChangeInfo("Telephone");
                                    resetValue();
                                }}
                            >&#128393;</span></li>
                            <li 
                            className='changePwd'
                            title='Change password'
                            onClick={() => {
                                setChangePwdState(true);
                            }}
                            ><b>Change password</b></li>
                        </ul>
                        <div className='manipulateAccount' style={{
                            display: "flex",
                            justifyContent: "space-around",
                            flexDirection: "row",
                            width: "100%",
                            padding: "10px",
                        }}>
                            <div 
                            title='Sign out'
                            className='logout'
                            onClick={function(){
                                const checkLogout = confirm('Bạn có muốn đăng xuất?')
                                if (checkLogout){
                                    localStorage.clear();
                                    setProfileStatus(false);
                                    setAppearStatus("login");
                                    setCurrentChat(null);
                                    setOnMessage("");
                                    socket.close()
                                    clearCookie();
                                }
                            }}
                            >Sign out</div>
                            <div 
                            title='Delete Account'
                            className='deleteAccount'
                            onClick={async function(){
                                const checkDelete = confirm('Delete this account? All data will be lost! Continue?');
                                if(checkDelete){
                                    const reqDelete = await fetch(`https://chatbox-backend-3ru8.onrender.com/DeleteHandler?id=${JSON.parse(localStorage.getItem('user'))?.id}`);
                                    const resDelete = await reqDelete.json();
                                    if (resDelete.Status){
                                        setAppearStatus("register");
                                        setProfileStatus(false);
                                        setCurrentChat(null);
                                        setOnMessage("");
                                        localStorage.clear();
                                        socket.close();
                                        clearCookie();
                                    }
                                }
                            }}
                            >Delete Account</div>
                        </div>
                    </div>
                    <div className='profileBox2'>
                        <div className='maxim'>
                            <p>{JSON.parse(localStorage.getItem('user'))?.maxim}</p>
                            <span 
                            className='changeMaxim'
                            onClick={() => {
                                setChangeInfo("Maxim");
                                resetValue();
                            }}
                            >&#128393;</span> 
                        </div>
                    </div>
                </div>
            </div>
            <input 
            type = 'file'
            hidden
            ref = {avatarRef}
            onChange={async function(e){
                const formData = new FormData();
                formData.append("file", e.target.files[0]);
                const uploadAvtReq = await fetch(`https://chatbox-backend-3ru8.onrender.com/uploadAvt?id=${JSON.parse(localStorage.getItem('user'))?.id}`, {
                    method: "POST",
                    body: formData
                });
                const uploadAvtRes = await uploadAvtReq.json();
                if (uploadAvtRes.Status){
                    alert(uploadAvtRes.Message);
                    const avatarLocalStorage = JSON.parse(localStorage.getItem('user'));
                    avatarLocalStorage.avatar = uploadAvtRes.Avatar;
                    localStorage.setItem('user', JSON.stringify(avatarLocalStorage));
                    setAvatar(uploadAvtRes.Avatar);
                }
                else {
                    alert(uploadAvtRes.Message);
                    return
                }
            }}
            />
        </>
    )
}
export default Dashboard
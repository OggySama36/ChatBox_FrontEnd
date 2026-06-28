import { useEffect, useRef, useState } from 'react'
import './dashboard.css'
function Friend({ 
    AppearStatus, 
    socket, 
    setCurrentChat, 
    setOnMessage, 
    history_chatbox, 
    setHistory_chat, 
    listBlocked,
    setListBlocked, 
    unlockThisFriend,
    isMobile, 
    mobileView, 
    setMobileView, 
    goToChat,
    setAvatarPartner
}) {
    const [HandleFriend, setHandleFriend] = useState(null);
    const [valueFindFriend, setValueFindFriend] = useState("");
    const [filteredChat, setFilteredChat] = useState([]);
    const searchFriendTimeout = useRef(null);
    useEffect(() => {
        if (!socket) return;
        const handleHistory = (event) => {
            const listen = JSON.parse(event.data);
            if (listen.Type === "historyChat") {
                setHistory_chat((prev) => [...prev, listen]);
            }
        };
        socket.addEventListener("message", handleHistory);
        return () => {
            socket.removeEventListener("message", handleHistory);
        };
    }, [socket, setHistory_chat]);

    useEffect(() => {
        if(!socket) return;
        const handleBlockSocket = (event) => {
            const listen = JSON.parse(event.data);
            console.log(listen);
            if (listen.Type === "BlockSuccess"){
                setListBlocked((prev) => [...prev, listen]);
            }
            if (listen.Type === "UnlockSuccess") {
                setListBlocked(prev => prev.filter(userUnlock => 
                    !(String(userUnlock.Blocker) === String(listen.Blocker) && String(userUnlock.BeBlocked) === String(listen.BeBlocked))
                ));
            }
        }
        socket.addEventListener("message", handleBlockSocket);
        return () => {
            socket.removeEventListener("message", handleBlockSocket);
        };
    }, [socket, setListBlocked]);

    useEffect(() => {
        async function loadFriends(){
            if (!JSON.parse(localStorage.getItem('user'))){
                return
            }
            const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/loadFriends?idSender=${JSON.parse(localStorage.getItem('user'))?.id}`);
            const res = await req.json()
            if (AppearStatus === "dashboard"){
                setHistory_chat(res);
            }
            else {
                return
            }
        }
        loadFriends()
    }, [AppearStatus, setHistory_chat])
    useEffect(() => {
        async function loadBlock(){
            if (!JSON.parse(localStorage.getItem('user'))){
                return
            }
            const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/loadBlockers?idCurrent=${JSON.parse(localStorage.getItem('user'))?.id}`);
            const res = await req.json()
            if (AppearStatus === "dashboard"){
                setListBlocked(Array.isArray(res) ? res : []);
            }
            else {
                return
            }
        }
        loadBlock()
    }, [AppearStatus, setListBlocked])
    
    const timeoutRef = useRef(null);
    return (
        <div
            className='friends'
            style={{
                opacity: AppearStatus === "dashboard" && (!isMobile || mobileView === "friend") ? 1 : 0,
                zIndex: AppearStatus === "dashboard" && (!isMobile || mobileView === "friend") ? 100 : -100,
                pointerEvents: AppearStatus === "dashboard" && (!isMobile || mobileView === "friend") ? "auto" : "none",
            }}
            >
            <h1>
                {isMobile && (
                    <span 
                        className='backMenuIcon'
                        onClick={() => setMobileView("menu")}
                        style={{cursor: "pointer", marginRight: "10px"}}
                    >&#8592;</span>
                )}
                My Conversations
            </h1>
            <hr />
            <div className='box_find_friends'>
                <input 
                type='text'
                className='inputFindFriend'
                placeholder='Find your friends'
                value={valueFindFriend}
                onChange={(e) => {
                    const newValue = e.target.value;
                    setValueFindFriend(newValue);
                    clearTimeout(searchFriendTimeout.current);
                    searchFriendTimeout.current = setTimeout(() => {
                        const filteredChat = history_chatbox?.filter((history) => {
                            const IdSelf = JSON.parse(localStorage.getItem('user'))?.id;
                            const NameFriend = IdSelf === history.IdSender ? history.NameReceiver : history.NameSender;
                            return NameFriend.toLowerCase().includes(newValue.toLowerCase());
                        });
                        setFilteredChat(filteredChat);
                    })
                }}
                />
                <div className='deleteValue'>&#10005;</div>
            </div>
            <div className='historyChat'>
                {(valueFindFriend ? filteredChat : history_chatbox)?.map((history) => {
                    const IdSelf = JSON.parse(localStorage.getItem('user'))?.id;
                    const IdFriend = JSON.parse(localStorage.getItem('user'))?.id === history.IdSender ? history.IdReceiver : history.IdSender;
                    const NameFriend = JSON.parse(localStorage.getItem('user'))?.id === history.IdSender ? history.NameReceiver : history.NameSender;
                    const AvatarFriend = JSON.parse(localStorage.getItem('user'))?.id === history.IdSender ? history.AvatarReceiver : history.AvatarSender;
                    const isBlocker = listBlocked?.some(
                        element => String(element.Blocker) === String(IdSelf) && String(element.BeBlocked) === String(IdFriend)
                    );
                    return (
                    <>
                        <div className='history_friend'
                        key={IdFriend}
                        >
                                <div className='oneLine'
                                onClick={() => {
                                    if (isMobile) {
                                        goToChat(IdFriend, NameFriend, AvatarFriend);
                                    } else {
                                        setOnMessage(NameFriend);
                                        setCurrentChat(IdFriend);
                                        setAvatarPartner(AvatarFriend)
                                    }
                                }}>
                                    <img className = "avtFriend" src={AvatarFriend}/>
                                    <p>{NameFriend}</p>  
                                </div>
                                <span 
                                className='friendsOptions'
                                style={{
                                    position: "relative"
                                }}
                                onMouseEnter={() => {
                                    if(timeoutRef.current){
                                        clearTimeout(timeoutRef.current);
                                        timeoutRef.current = null;
                                        setHandleFriend(IdFriend);
                                    }else{
                                        setHandleFriend(IdFriend);
                                    }
                                }}
                                onMouseLeave={() => {
                                    timeoutRef.current = setTimeout(() => {
                                        setHandleFriend(null);
                                    }, 100);
                                }}
                                onClick={() => {
                                    if(timeoutRef.current){
                                        clearTimeout(timeoutRef.current);
                                        timeoutRef.current = null;
                                        setHandleFriend(IdFriend);
                                    }else{
                                        setHandleFriend(IdFriend);
                                    }
                                }}
                                >&#8942;
                                {<div
                                tabIndex={0}
                                autoFocus
                                className='optionFriends'
                                style={{
                                    position: "absolute",
                                    zIndex: HandleFriend === (IdFriend) ? 102 : -102,
                                    pointerEvents: HandleFriend === (IdFriend) ? "auto" : "none",
                                    top: "100%",
                                    right: "20%",
                                    opacity: HandleFriend === (IdFriend) ? 1 : 0,
                                }}>
                                    <div
                                    className='deleteFriend' 
                                    onClick={async () => {
                                        const currentUserId = JSON.parse(localStorage.getItem('user')) === null ? null : JSON.parse(localStorage.getItem('user')).id;
                                        const checkDelete = confirm(`Are you sure you want to delete conversation with ${NameFriend}?`);
                                        if(checkDelete){
                                            const req = await fetch(`https://chatbox-backend-3ru8.onrender.com/DeleteFriends?idFriend=${(IdFriend)}&idOrigin=${(JSON.parse(localStorage.getItem('user')) === null ? null : JSON.parse(localStorage.getItem('user')).id )}`);
                                            const res = await req.json()
                                            if(res.Status){
                                                setHistory_chat((prevList) => {
                                                    return prevList.filter((item) => {
                                                        const itemFriendId = currentUserId === item.IdSender ? item.IdReceiver : item.IdSender;
                                                        return itemFriendId !== res.Id;
                                                    });
                                                });
                                                setHandleFriend(null);
                                                setCurrentChat(null);
                                                setOnMessage("");
                                            }
                                        }
                                    }}>
                                        Delete conversation
                                    </div>
                                    <div
                                    className='block'>
                                        <span
                                        onClick={async (e) => {
                                            if(e.currentTarget.textContent.includes("Unlock")){
                                                const warning = confirm(`Are you sure you want to unlock ${NameFriend}?`);
                                                if (warning){
                                                    unlockThisFriend(IdFriend);
                                                    socket.send(JSON.stringify({
                                                        Case: "UnlockFriend",
                                                        one_Block: IdSelf,
                                                        one_BeBlocked: IdFriend,
                                                    }));
                                                }
                                            }
                                            else {
                                                const warning = confirm(`Are you sure you want to block ${NameFriend}?`);
                                                if (warning){
                                                    const idCurrent = JSON.parse(localStorage.getItem('user')) === null ? null : JSON.parse(localStorage.getItem('user')).id;
                                                    const idFriend = IdFriend;
                                                    socket.send(JSON.stringify({
                                                        Case: "BlockFriend",
                                                        one_Block: idCurrent,
                                                        one_BeBlocked: idFriend,
                                                    }));
                                                    await fetch(`https://chatbox-backend-3ru8.onrender.com/BlockThisFriend?idCurrent=${idCurrent}&idFriend=${idFriend}`);
                                                }
                                            }
                                        }}
                                        >
                                            {isBlocker ? `Unlock ${NameFriend}?` : `Block ${NameFriend}?`}
                                        </span>
                                    </div>
                                </div>}
                            </span> 
                        </div>
                        <hr/>
                    </>
                )})}
            </div> 
        </div>
    )
}
export default Friend
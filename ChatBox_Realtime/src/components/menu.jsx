import './dashboard.css'
import { useState } from 'react'
import { useRef } from 'react';
import { useEffect } from 'react';
import Dashboard from './dashboard';
function Menu(
    {
        AppearStatus, 
        setProfileStatus, 
        setOnMessage,
        setCurrentChat,
        isMobile, 
        mobileView, 
        setMobileView, 
        goToChat
    }
){
    const [valueInput, setValueInput] = useState("");
    const [list, setList] = useState([]);
    const searchingTimeout = useRef(null);
    const hoverTimeoutRef = useRef(null);
    const [hoveredFriend, setHoveredFriend] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const miniProfileRef = useRef(null);
    useEffect(() => {
        if (!miniProfileRef.current) return;
        const rect = miniProfileRef.current.getBoundingClientRect();
        if (rect.bottom > window.innerHeight) {
            setMousePos(prev => ({
                ...prev,
                y: prev.y - (rect.bottom - window.innerHeight) - 10
            }));
        }
    }, [hoveredFriend]);
    return (
        <div className="menu" style = {{
                opacity: AppearStatus === "dashboard" && (!isMobile || mobileView === "menu") ? 1 : 0,
                zIndex: AppearStatus === "dashboard" && (!isMobile || mobileView === "menu") ? 100 : -100,
                pointerEvents: AppearStatus === "dashboard" && (!isMobile || mobileView === "menu") ? "auto" : "none",
            }}>
            <div className='currentProfile'>
                <div className='optionsBox'>
                    <div className = "optionIcon" onClick={() => {
                        setProfileStatus(true);
                    }}>
                        &#9881;
                    </div>
                    {isMobile && (
                    <div 
                        className='backFriendIcon'
                        onClick={() => setMobileView("friend")}
                        style={{
                            marginLeft: "auto",
                            cursor: "pointer",
                            fontSize: "22px",
                            padding: "5px 10px",
                        }}
                        >&#8594;</div>
                    )}
                </div>
                <img  className="avatarMain" src={JSON.parse(localStorage.getItem('user'))?.avatar}/>
                <h1 style={{
                    color: 'wheat',
                    textAlign: 'center',
                    fontSize: '20px',
                }} 
                className='titleUser'
                onClick={() => {
                    setProfileStatus(true);
                }}
                >{JSON.parse(localStorage.getItem('user')) === null ? "none" : JSON.parse(localStorage.getItem('user')).name}</h1>
            </div>
            <hr style={{
                width: '100%',
                }}/>
            <h1>Search your friends</h1>
            <div className='box-find-friends'>
                <input placeholder='Searching...' 
                id = "box_friends"
                value = {valueInput}
                autoComplete='off'
                onChange={function(e){
                    setValueInput(e.target.value)
                    clearInterval(searchingTimeout);
                    searchingTimeout.current = setTimeout(async () => {
                        const find_in_db = await fetch (`http://localhost:8080/FindFriendsHandler?q=${e.target.value}&id=${JSON.parse(localStorage.getItem('user')) === null ? null : JSON.parse(localStorage.getItem('user')).id}`);
                        const findResult =  await find_in_db.json();
                        if (findResult.Status){
                            setList(findResult.Friends);
                        }
                    }, 300)
                }}
                />
                <button id = "find-friend"
                onClick={ async () => {
                    if (valueInput.trim() === ""){
                        return
                    }
                    const find_in_db = await fetch (`http://localhost:8080/FindFriendsHandler?q=${valueInput}`);
                        const findResult =  await find_in_db.json();
                        if (findResult.Status){
                            setList(findResult.Friends);
                        }
                }}
                >&#128269;</button>
            </div>
            <ul className='listFound'>
                {valueInput.trim() === "" ? null : (
                    list.map((friendindex) => {
                        return (
                            <li key={friendindex.Id}
                                className='frienditem'
                                onClick={() => {
                                    if (isMobile) {
                                        goToChat(friendindex.Id, friendindex.Name);
                                    } else {
                                        setOnMessage(friendindex.Name);
                                        setCurrentChat(friendindex.Id);
                                    }
                                    setValueInput("");
                                    clearTimeout(hoverTimeoutRef.current);
                                    hoverTimeoutRef.current = null;
                                    setHoveredFriend(null);
                                }}
                                onMouseEnter={(e) => {
                                    setMousePos({ x: e.clientX, y: e.clientY });
                                    hoverTimeoutRef.current = setTimeout(() => {
                                        setHoveredFriend(friendindex);
                                    }, 1000);
                                }}
                                onMouseLeave={() => {
                                    clearTimeout(hoverTimeoutRef.current);
                                    hoverTimeoutRef.current = null;
                                    setHoveredFriend(null);
                                }}
                            >
                                {friendindex.Name}
                                <hr />
                            </li>
                        )
                    })
                )}
            </ul>
            {hoveredFriend && (
                <div 
                    className='miniProfile'
                    ref={miniProfileRef}
                    style={{
                        position: "fixed",
                        left: mousePos.x + 10,
                        top: mousePos.y + 10,
                        zIndex: 999,
                    }}
                >
                    <div className='nameMiniProfile'>
                        <img src={`http://localhost:8080/uploaded/avatar_${hoveredFriend.Id}.png`} className='avatarFriendMiniProfile'/>
                        <p>{hoveredFriend.Name}</p>
                    </div>
                    <div className='lineMiniProfile'></div>
                    <div className='infoMiniProfile'>
                        <p>{hoveredFriend.Maxim === "Change your maxim" ? "This friend has no precept here" : hoveredFriend.Maxim}</p>
                    </div>
                </div>
                )}
        </div>
    )
}
export default Menu
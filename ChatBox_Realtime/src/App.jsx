import { useState, useEffect } from 'react';
import Login from './components/login';
import Register from './components/register'
import bg from './assets/background.jpg'
import Dashboard from './components/dashboard';
import './responsive.css'
function App() {
  const [text, setText] = useState("");
  const [move, SetMove] = useState(false);
  const [pageAuth, setPageAuth] = useState("none");
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const greetingText = "All the best for you";
    let i = 0;
    const interval_greeting = setInterval(() => {
      if (i < greetingText.length) {
        const char = greetingText[i];
        setText((prev) => prev + char);
        i++;
      } else {
        clearInterval(interval_greeting);
      }
    }, 70);
    return () => clearInterval(interval_greeting);
  }, []);
  function createSocket(idCurrent){
      const ws = new WebSocket(`ws://localhost:8080/ws?id=${idCurrent}`);
      setSocket(ws);
  }
  async function checkAuth(){
    const req = await fetch("http://localhost:8080/checkAuth", {
      credentials: "include"
    });
    const res = await req.json();
    if (res.Status){
      await createSocket(JSON.parse(localStorage.getItem("user")).id);
      await setPageAuth("dashboard");
    }
    else {
      setPageAuth("login");
      localStorage.clear();
    }
  }
  useEffect(() => {
    if (window.innerWidth <= 430) {
        document.querySelector('.fullApp').style.transform = 'translateZ(0)';
        setTimeout(() => {
            document.querySelector('.fullApp').style.transform = '';
        }, 50);
    }
}, []);
  return (
    <div className='fullApp' 
    style={{
      backgroundImage: `url(${bg})`,
    }}>
       <div className='main'>
        <div className='title_box' style={{
          opacity: move ? 0 : 1,
          zIndex: move ? 0 : 1,
          pointerEvents: move ? "none" : "auto"
          }}>
          <h1 className='title'>
            Welcome to my ChatBox!^^
          </h1>
          <p>{text}</p>
          <div className='start' onClick={async function(){
            SetMove(true);
            await checkAuth();
          }}>
            Start Now
          </div>
        </div>
        <Login AppearStatus = {pageAuth} setAppearStatus = {setPageAuth} createSocket = {createSocket}/>
        <Register AppearStatus = {pageAuth} setAppearStatus = {setPageAuth} createSocket = {createSocket}/>
        {socket && pageAuth === "dashboard" ? (<Dashboard AppearStatus = {pageAuth} setAppearStatus = {setPageAuth} socket = {socket}/>) : null}
      </div>
    </div>
  );
}

export default App;

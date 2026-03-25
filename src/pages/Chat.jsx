import React,{useEffect,useState} from "react"
import { connectSocket } from "../socket"

const Chat = () => {

const [messages,setMessages] = useState([])
const [text,setText] = useState("")

useEffect(()=>{

const socket = connectSocket()

socket.on("receive-message",(msg)=>{
setMessages(prev=>[...prev,msg])
})

},[])

const sendMessage = ()=>{

const socket = connectSocket()

socket.emit("send-message",{
text,
receiver:"USER_ID"
})

setText("")

}

return (

<div className="max-w-xl mx-auto">

<div className="h-96 overflow-y-auto border">

{messages.map((m,i)=>(
<div key={i} className="p-2">
{m.text}
</div>
))}

</div>

<input
value={text}
onChange={e=>setText(e.target.value)}
className="border w-full p-2"
/>

<button onClick={sendMessage}>
Send
</button>

</div>

)

}

export default Chat
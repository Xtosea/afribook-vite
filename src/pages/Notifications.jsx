import React, { useEffect, useState } from "react";
import { API_BASE } from "../api/api";

const Notifications = () => {

const [notifications,setNotifications] = useState([])

useEffect(()=>{

fetchNotifications()

},[])

const fetchNotifications = async()=>{

const token = localStorage.getItem("token")

const res = await fetch(`${API_BASE}/api/notifications`,{

headers:{
Authorization:`Bearer ${token}`
}

})

const data = await res.json()

setNotifications(data)

}

return (

<div className="max-w-xl mx-auto">

<h2 className="text-xl font-bold mb-4">
Notifications
</h2>

{notifications.map(n=>(
<div key={n._id}
className="p-3 border-b flex gap-2"
>

<img
src={n.sender?.profilePic}
className="w-10 h-10 rounded-full"
/>

<div>

<p>{n.text}</p>

</div>

</div>
))}

</div>

)

}

export default Notifications
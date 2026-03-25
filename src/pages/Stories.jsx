import React, { useEffect, useState } from "react";
import { API_BASE } from "../api/api";

const Stories = () => {

const [stories,setStories] = useState([])

useEffect(()=>{

fetchStories()

},[])

const fetchStories = async()=>{

const res = await fetch(`${API_BASE}/api/stories`)
const data = await res.json()

setStories(data)

}

return (

<div className="flex overflow-x-auto gap-3 p-3">

{stories.map((story)=>(
<div key={story._id} className="text-center">

<img
src={story.user.profilePic}
className="w-16 h-16 rounded-full border-2 border-pink-500"
/>

<p className="text-xs">{story.user.name}</p>

</div>
))}

</div>

)

}

export default Stories
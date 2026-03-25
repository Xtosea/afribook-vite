import { useEffect, useState } from "react";
import { API_BASE } from "../api/api";

export const useStories = () => {

const [stories,setStories] = useState([])

useEffect(()=>{

fetchStories()

},[])

const fetchStories = async()=>{

const res = await fetch(`${API_BASE}/api/stories`)
const data = await res.json()

setStories(data)

}

return stories

}
import React, {
  useEffect,
  useRef,
  useState,
  Suspense,
  lazy,
  memo,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import StoryBar from "../components/stories/StoryBar";

import { API_BASE, fetchWithToken } from "../api/api";

import { getSocket, connectSocket } from "../socket";

import Adsterra from "../components/Adsterra.jsx";
import SuggestedFriends from "../components/friends/SuggestedFriends";
import ReelsHorizontal from "../components/reels/ReelsHorizontal";
import FeedSection from "../components/feed/FeedSection";
import TopCreators from "../components/feed/TopCreators";
import ChallengesWidget from "../components/feed/ChallengesWidget";
import PageLoader from "../components/common/PageLoader";
import UpComingEvents from "../components/events/UpComingEvents";
import TopEarners from "../components/events/TopEarners";
import TrendingHashtags from "../components/events/TrendingHashtags";
import Leaderboard from "./Leaderboard";




const PostCard = lazy(() => import("../components/PostCard"));


// ================= SKELETON =================
const SkeletonPost = memo(() => (
  <div className="bg-white p-4 rounded-2xl shadow animate-pulse">
    <div className="h-64 bg-gray-300 rounded-xl" />
  </div>
));


// ================= HOME =================
const Home = () => {

const navigate = useNavigate();

const token = localStorage.getItem("token");
const currentUserId = localStorage.getItem("userId");


const currentUser = {
  _id: currentUserId,
  profilePic: localStorage.getItem("profilePic"),
  name: localStorage.getItem("name"),
};



const [posts,setPosts] = useState([]);
const [stories,setStories] = useState([]);
const [reels,setReels] = useState([]);

const [loadingPosts,setLoadingPosts] = useState(true);
const [page,setPage] = useState(1);
const [hasMore,setHasMore] = useState(true);

const [networkError,setNetworkError] = useState(false);
const [isOffline,setIsOffline] = useState(!navigator.onLine);



const observer = useRef(null);
const fetchLock = useRef(false);
const feedRef = useRef(null);


const LIMIT = 5;



// ================= AUTH =================

useEffect(()=>{

if(!token){
 navigate("/login");
}

},[token,navigate]);





// ================= FETCH POSTS =================

const fetchPosts = useCallback(async()=>{


if(
 !token ||
 fetchLock.current ||
 !hasMore
){
 return;
}


fetchLock.current = true;


try{


setLoadingPosts(true);
setNetworkError(false);



const postsData = await fetchWithToken(

`${API_BASE}/api/posts?page=${page}&limit=${LIMIT}`,

token

);



const newPosts = Array.isArray(postsData)
? postsData
: [];



setPosts(prev=>

page === 1
? newPosts
: [...prev,...newPosts]

);



if(newPosts.length < LIMIT){
 setHasMore(false);
}



}

catch(err){


console.log("Posts error:",err);


if(!navigator.onLine){
 setNetworkError(true);
}
else{
 setNetworkError(true);
}


}


finally{

setLoadingPosts(false);
fetchLock.current=false;

}


},[page,token,hasMore]);




useEffect(()=>{

fetchPosts();

},[fetchPosts]);

// ================= REFRESH WHEN USER RETURNS =================
useEffect(() => {

  const handleVisibilityChange = () => {

    if (
      document.visibilityState === "visible"
    ) {

      console.log("User returned - refreshing");

      setPage(1);
      setHasMore(true);
      setPosts([]);
      
      fetchPosts();

      window.location.reload();
    }

  };


  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );


  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };


}, [fetchPosts]);




// ================= NETWORK WATCH =================

useEffect(()=>{


const online = ()=>{


setIsOffline(false);
setNetworkError(false);


setPage(1);
setHasMore(true);
setPosts([]);



setTimeout(()=>{

fetchPosts();

},300);


};



const offline = ()=>{

setIsOffline(true);

};



window.addEventListener(
"online",
online
);


window.addEventListener(
"offline",
offline
);



return()=>{

window.removeEventListener(
"online",
online
);


window.removeEventListener(
"offline",
offline
);

};



},[fetchPosts]);




// ================= STORIES + REELS =================

useEffect(()=>{


if(!token)return;



const loadExtra = async()=>{


try{


const [
storyRes,
reelRes

]= await Promise.all([


fetch(
`${API_BASE}/api/stories?limit=10`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
),


fetch(
`${API_BASE}/api/posts/reels`
)


]);



const storyData =
await storyRes.json();


const reelData =
await reelRes.json();



setStories(
storyData?.stories || []
);



setReels(

Array.isArray(reelData)
? reelData
: reelData?.reels || []

);



}

catch(err){

console.log(err);

}


};



loadExtra();


},[token]);


// ================= SOCKET =================

useEffect(()=>{


if(!token)return;


if(!getSocket()){
 connectSocket();
}


const socket = getSocket();


if(!socket)return;



const handleNewPost = (post)=>{


setPosts(prev=>{


if(
prev.some(
p=>p._id === post._id
)
){
return prev;
}


return [
post,
...prev
];


});


};



const handleNewStory = (story)=>{

setStories(prev=>[
story,
...prev
]);

};



socket.on(
"new-post",
handleNewPost
);


socket.on(
"new-story",
handleNewStory
);



return()=>{


socket.off(
"new-post",
handleNewPost
);


socket.off(
"new-story",
handleNewStory
);


};


},[token]);





// ================= INFINITE SCROLL =================


const lastPostRef = useCallback(
(node)=>{


if(
loadingPosts ||
!hasMore
)return;



if(observer.current){

observer.current.disconnect();

}



observer.current =
new IntersectionObserver(
(entries)=>{


if(entries[0].isIntersecting){


setPage(prev=>prev+1);


}


},
{
rootMargin:"300px"
}
);



if(node){

observer.current.observe(node);

}



},
[
loadingPosts,
hasMore
]
);





// ================= OFFLINE SCREEN =================


if(isOffline){

return (

<div className="
min-h-screen
flex
items-center
justify-center
bg-white
px-4
">

<div className="text-center">


<div className="text-6xl mb-4">
📡
</div>


<h2 className="
text-xl
font-bold
">

No Internet Connection

</h2>


<p className="
text-gray-500
mt-2
">

Waiting for network...

</p>


<button

onClick={()=>window.location.reload()}

className="
mt-4
bg-blue-500
text-white
px-5
py-2
rounded-lg
"

>

Retry

</button>


</div>

</div>

);

}




// ================= ERROR =================


if(networkError){

return (

<div className="
min-h-screen
flex
items-center
justify-center
bg-white
px-4
">


<div className="text-center">


<div className="text-5xl mb-4">
📶
</div>


<h2 className="font-bold text-lg">

Network Error

</h2>


<p className="text-gray-500 mt-2">

Unable to load Afribook.

</p>



<button

onClick={()=>{

setNetworkError(false);
setPage(1);
setPosts([]);
fetchPosts();

}}

className="
mt-4
bg-blue-600
text-white
px-5
py-2
rounded-lg
"

>

Retry

</button>


</div>


</div>

);

}





// =================UI RENDER =================



const feedSections = {
  1: (
    <FeedSection title="🎬 Trending Reels">
      <ReelsHorizontal reels={reels} />
    </FeedSection>
  ),

  3: (
    <FeedSection title="🏆 Top Leaderboard">
      <Leaderboard />
    </FeedSection>
  ),

  5: (
    <FeedSection title="💰 Top Earners">
      <TopEarners />
    </FeedSection>
  ),

  7: (
    <FeedSection title="📖 Top Stories">
       <StoryBar
        user={currentUser}
        stories={stories}
      />
    </FeedSection>
  ),

  9: (
    <FeedSection title="⭐ Top Creators">
      <TopCreators />
    </FeedSection>
  ),

  11: (
    <FeedSection title="👥 People You May Know">
      <SuggestedFriends limit={10} />
    </FeedSection>
  ),

  13: (
    <FeedSection title="🔥 Trending Hashtags">
      <TrendingHashtags />
    </FeedSection>
  ),

  15: (
    <FeedSection title="🎉 Upcoming Events">
      <UpcCmingEvents />
    </FeedSection>
  ),

  17: (
    <FeedSection title="📢 Sponsored">
      <Adsterra containerId="feed-ad-1" />
    </FeedSection>
  ),
};



return (

<div className="
w-full
min-h-screen
grid
grid-cols-1
md:grid-cols-4
gap-4
max-w-7xl
mx-auto
px-2
">


<aside className="
hidden
md:block
md:col-span-1
">

<SidebarLeft />

</aside>




<main className="
md:col-span-2
space-y-4
">



{/* Composer */}

<div className="
bg-white
p-4
rounded-2xl
shadow
">


<div className="
flex
items-center
gap-3
">


<img

loading="lazy"

src={
currentUser?.profilePic ||
      "/default-avatar.png"
    }
    alt=""
    className="
      w-12
      h-12
      rounded-full
      object-cover
      border
      border-white
    "
  />


<textarea
  placeholder={`What's on your mind, ${currentUser?.name?.split(" ")[0] || "there"}?`}
  onFocus={() => navigate("/create-post")}
  readOnly
  rows={1}
  className="
    flex-1
    bg-gray-100
    rounded-full
    px-4
    py-2
    text-sm
    placeholder:text-gray-500
    resize-none
    cursor-pointer
    overflow-hidden
  "
/>


</div>


</div>





<StoryBar

user={currentUser}

stories={stories}

/>




<div
ref={feedRef}
className="space-y-4"
>



{
loadingPosts &&
posts.length===0

?

<>

<SkeletonPost/>

<SkeletonPost/>

</>


:

posts.map(
(post,index)=>{


const isLast =
posts.length === index + 1;



return (

<div

key={post._id}

ref={
isLast
? lastPostRef
:null
}

>


<Suspense

fallback={<SkeletonPost/>}

>


<PostCard

post={post}

currentUserId={currentUserId}

/>


</Suspense>


{feedSections[index]}


{index===1 &&
reels.length>0 &&

(

<FeedSection

title="🎬 Trending Reels"

>


<ReelsHorizontal

reels={reels}

/>


</FeedSection>

)

}





{index===3 &&

(

<FeedSection

title="👥 People You May Know"

>

<SuggestedFriends

limit={10}

/>


</FeedSection>

)

}





{index===5 &&

(

<FeedSection

title="📢 Sponsored"

>


<Adsterra

containerId="feed-ad-1"

/>


</FeedSection>

)

}





{index===7 &&

(

<FeedSection

title="⭐ Top Creators"

>


<TopCreators/>


</FeedSection>

)

}





{index===9 &&

(

<FeedSection

title="🏆 Active Challenges"

>


<ChallengesWidget/>


</FeedSection>

)

}




</div>

);


}

)

}



{
loadingPosts &&
page>1 &&

<div className="text-center py-4">

Loading more posts...

</div>

}



</div>


</main>





<aside className="
hidden
md:block
md:col-span-1
space-y-4
">


<SidebarRight/>


</aside>




</div>

);

};


export default memo(Home);
import { useEffect,useState }
from "react";

import { getSocket }
from "@/services/socket";


export default function AlertBell({

 applicationId

}){


 const [count,setCount]
 =
 useState(0);



 useEffect(()=>{

 const socket =
 getSocket();


 socket.emit(
 "join_application",
 applicationId
 );


 socket.on(
 "alert_triggered",

 ()=>{

 setCount(
 prev=>prev+1
 );

 }


 );


 return ()=>{

 socket.off(
 "alert_triggered"
 );

 };


 },[]);



 return(

 <div className="relative">


 🔔


 {count>0 && (

 <span
 className="absolute px-1 text-xs text-white bg-red-600 rounded -top-2 -right-2">


 {count}


 </span>

 )}


 </div>

 );

}
import { useEffect } from "react";

export default function AlertToast({

 alert,
 onClose

}){

 useEffect(()=>{

 const timer =
 setTimeout(onClose,5000);

 return ()=>clearTimeout(timer);

 },[]);


 return(

 <div className="fixed px-4 py-3 text-white bg-red-600 rounded shadow-lg bottom-5 right-5">


 🚨 {alert.message}


 </div>

 );

}
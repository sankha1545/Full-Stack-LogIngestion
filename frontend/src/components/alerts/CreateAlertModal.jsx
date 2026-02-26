import {

 useState

} from "react";

import {

 createAlert

}
from "@/services/alertsApi";


export default function CreateAlertModal({

 applicationId,
 onClose,
 onCreated

}){


 const [name,setName]
 =
 useState("");


 const [query,setQuery]
 =
 useState("");


 async function submit(){

 await createAlert({

 name,
 query,
 applicationId

 });

 onCreated();

 onClose();

 }



 return(

 <div className="fixed inset-0 flex items-center justify-center bg-black/40">


 <div className="p-6 bg-white rounded">


 <h2>Create Alert</h2>


 <input
 placeholder="Name"
 value={name}
 onChange={e=>setName(e.target.value)}
 />


 <input
 placeholder="Search Query"
 value={query}
 onChange={e=>setQuery(e.target.value)}
 />


 <button
 onClick={submit}>Create</button>


 </div>


 </div>

 );

}
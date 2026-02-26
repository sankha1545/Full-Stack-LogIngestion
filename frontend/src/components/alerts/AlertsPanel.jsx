import {

 useState,
 useEffect

} from "react";

import {

 getAlerts,
 deleteAlert

}
from "@/services/alertsApi";

import CreateAlertModal
from "./CreateAlertModal";


export default function AlertsPanel({

 applicationId

}){


 const [alerts,setAlerts]
 =
 useState([]);


 const [showModal,setShowModal]
 =
 useState(false);



 async function load(){

 const data =
 await getAlerts(applicationId);

 setAlerts(data);

 }


 useEffect(()=>{

 load();

 },[]);



 async function remove(id){

 await deleteAlert(id);

 load();

 }



 return(

 <div className="p-4 border rounded">


 <div className="flex justify-between">


 <h2>Alerts</h2>


 <button
 onClick={()=>setShowModal(true)}>


 Create


 </button>


 </div>


 {alerts.map(alert=>(


 <div key={alert.id}>


 {alert.name}


 <button
 onClick={()=>remove(alert.id)}>


 Delete


 </button>


 </div>


 ))}


 {showModal && (

 <CreateAlertModal

 applicationId={applicationId}

 onClose={()=>setShowModal(false)}

 onCreated={load}

 />

 )}


 </div>

 );

}
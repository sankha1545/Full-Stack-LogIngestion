const BASE =
"http://localhost:3001/api/alerts";


function token(){

 return localStorage.getItem("token");

}


export async function getAlerts(applicationId){

 const res =
 await fetch(`${BASE}/${applicationId}`,{

 headers:{
 Authorization:`Bearer ${token()}`
 }

 });

 return res.json();

}



export async function createAlert(data){

 const res =
 await fetch(BASE,{

 method:"POST",

 headers:{

 "Content-Type":"application/json",

 Authorization:`Bearer ${token()}`

 },

 body:JSON.stringify(data)

 });

 return res.json();

}



export async function deleteAlert(id){

 const res =
 await fetch(`${BASE}/${id}`,{

 method:"DELETE",

 headers:{
 Authorization:`Bearer ${token()}`
 }

 });

 return res.json();

}
const BASE =
"http://localhost:3001/api/saved-views";


export async function getSavedViews(applicationId){

 const token =
 localStorage.getItem("token");


 const res =
 await fetch(
 `${BASE}/${applicationId}`,
 {

 headers:{
 Authorization:
 `Bearer ${token}`
 }

 });


 return res.json();

}



export async function createSavedView(data){

 const token =
 localStorage.getItem("token");


 const res =
 await fetch(BASE,{

 method:"POST",

 headers:{

 "Content-Type":
 "application/json",

 Authorization:
 `Bearer ${token}`

 },

 body:
 JSON.stringify(data)

 });


 return res.json();

}
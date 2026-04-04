import { useState, useEffect } from "react";


export default function useLiveSearch({

 applicationId,

 query

}) {

 const [results, setResults] =
 useState([]);

 const [loading, setLoading] =
 useState(false);


 useEffect(() => {

   if (!query) {

     setResults([]);

     return;

   }


   const controller =
   new AbortController();


   const timeout =
   setTimeout(async () => {

     try {

       setLoading(true);


       const token =
       localStorage.getItem("token");


       const res =
       await fetch(

         `http://localhost:3001/api/search/logs?applicationId=${applicationId}&search=${query}`,

         {

           headers: {

             Authorization:
             `Bearer ${token}`

           },

           signal:
           controller.signal

         }

       );


       const data =
       await res.json();


       setResults(
         data.logs || []
       );


     }

     catch {

     }

     finally {

       setLoading(false);

     }


   }, 300); // debounce


   return () => {

     clearTimeout(timeout);

     controller.abort();

   };


 }, [query, applicationId]);


 return {

   results,

   loading

 };

}
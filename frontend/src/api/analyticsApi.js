// src/api/analyticsApi.js

const BASE =
"http://localhost:3001/api";


export async function fetchLogStats(applicationId)
{

const token =
localStorage.getItem("token");


const res =
await fetch(

`${BASE}/logs/stats?applicationId=${applicationId}`,

{
headers:
{
Authorization:
`Bearer ${token}`
}
}

);


if (!res.ok)
throw new Error("Failed to fetch stats");


return res.json();

}
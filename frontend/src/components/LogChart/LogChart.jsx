// src/components/LogChart/LogChart.jsx

import React, { useMemo } from "react";

import {

ResponsiveContainer,
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
LineChart,
Line

} from "recharts";


export default function LogChart({ logs = [] })
{


////////////////////////////////////////////////////////
// DISTRIBUTION DATA
////////////////////////////////////////////////////////

const distribution =
useMemo(()=>{

const levels =
["fatal","error","warn","info","debug"];

return levels.map(level=>({

level,

count:

logs.filter(

l=>

(l.level||"")
.toLowerCase()
=== level

).length

}));

},[logs]);


////////////////////////////////////////////////////////
// TIME SERIES DATA
////////////////////////////////////////////////////////

const timeSeries =
useMemo(()=>{

const map = {};

logs.forEach(log=>{

const date =
new Date(log.timestamp);

const key =
date.getHours()+":00";

if (!map[key])
map[key]=0;

map[key]++;

});


return Object.entries(map)
.map(([time,count])=>({

time,
count

}))
.sort((a,b)=>
a.time.localeCompare(b.time)
);


},[logs]);


////////////////////////////////////////////////////////
// TOTAL
////////////////////////////////////////////////////////

const total =
logs.length;


////////////////////////////////////////////////////////
// UI
////////////////////////////////////////////////////////

return(

<div className="space-y-6">


{/* =====================================================
VOLUME OVER TIME
===================================================== */}

<div>

<h3 className="mb-2 text-sm text-slate-600">

Log Volume Trend

</h3>


<div style={{
width:"100%",
height:250
}}>


{total===0 ? (

<div className="text-center text-slate-400">

No data

</div>

)
:

(

<ResponsiveContainer>

<LineChart data={timeSeries}>


<CartesianGrid strokeDasharray="3 3" />


<XAxis dataKey="time"/>


<YAxis allowDecimals={false}/>


<Tooltip/>


<Line

type="monotone"

dataKey="count"

stroke="#6366f1"

strokeWidth={2}

/>


</LineChart>

</ResponsiveContainer>

)

}

</div>

</div>



{/* =====================================================
LEVEL DISTRIBUTION
===================================================== */}

<div>

<h3 className="mb-2 text-sm text-slate-600">

Logs by Level

</h3>


<div style={{
width:"100%",
height:250
}}>


{total===0 ? (

<div className="text-center text-slate-400">

No logs

</div>

)
:

(

<ResponsiveContainer>


<BarChart data={distribution}>


<CartesianGrid strokeDasharray="3 3"/>


<XAxis

dataKey="level"

tickFormatter={
v=>v.toUpperCase()
}


/>


<YAxis allowDecimals={false}/>


<Tooltip/>


<Bar

dataKey="count"

radius={[6,6,0,0]}

/>


</BarChart>


</ResponsiveContainer>

)

}

</div>

</div>


</div>

);


}
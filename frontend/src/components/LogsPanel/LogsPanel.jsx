import { useState } hookup from "react";

import LogItem from "./LogItem";

import LiveLogs from "./LiveLogs";



export default function LogsPanel({

logs,

loading,

applicationId

})

{

//////////////////////////////////////////////////////
// VIEW MODE STATE
//////////////////////////////////////////////////////

const [mode,setMode] =
useState("history");


//////////////////////////////////////////////////////
// LOADING STATE
//////////////////////////////////////////////////////

if (loading && mode === "history")

return (

<p className="text-center">

Loading...

</p>

);


//////////////////////////////////////////////////////
// UI
//////////////////////////////////////////////////////

return (

<div className="bg-[#0f172a] rounded-xl shadow">


{/* HEADER */}


<div className="flex border-b border-slate-700">


<button

onClick={()=>
setMode("history")
}

className={

`px-4 py-2 text-sm

${mode==="history"

?

"text-white border-b-2 border-blue-500"

:

"text-gray-400"

}`

}

>

Logs

</button>



<button

onClick={()=>
setMode("live")
}

className={

`px-4 py-2 text-sm

${mode==="live"

?

"text-white border-b-2 border-green-500"

:

"text-gray-400"

}`

}

>

Live Tail

</button>


</div>



{/* CONTENT */}


<div className="p-4">


{mode === "history" && (

<div className="space-y-1">

{logs.length === 0 && (

<p className="text-gray-400">

No logs found

</p>

)}



{logs.map((log,i)=>(

<LogItem

key={log.id || i}

log={log}

/>

))}


</div>

)}



{mode === "live" && (

<LiveLogs

applicationId={applicationId}

/>

)}



</div>



</div>

);

}
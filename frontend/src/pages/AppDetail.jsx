// src/pages/AppDetail.jsx

import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";

import { useLogs } from "@/hooks/useLogs";

import LogsContainer from "@/components/logs/LogsContainer";
import LiveLogs from "@/components/logs/LiveLogs";

import FilterBar from "@/components/FilterBar/FilterBar";
import LiveSearch from "@/components/logs/LiveSearch";
import SavedViews from "@/components/logs/SavedViews";
import AlertsPanel
from "@/components/alerts/AlertsPanel";

import AlertBell
from "@/components/alerts/AlertBell";
export default function AppDetail()
{

//////////////////////////////////////////////////////
// ROUTE PARAM
//////////////////////////////////////////////////////

const { id } = useParams();


//////////////////////////////////////////////////////
// PAGINATION STATE
//////////////////////////////////////////////////////

const [page,setPage] =
useState(1);


//////////////////////////////////////////////////////
// FILTER STATE
//////////////////////////////////////////////////////

const [filters,setFilters] =
useState({

search:undefined,

resourceId:undefined,

level:undefined,

from:undefined,

to:undefined,

caseSensitive:false

});


//////////////////////////////////////////////////////
// FINAL FILTER OBJECT
//////////////////////////////////////////////////////

const finalFilters =
useMemo(()=>({

applicationId:id,

...filters

}),[id,filters]);


//////////////////////////////////////////////////////
// FETCH LOGS
//////////////////////////////////////////////////////

const {

logs = [],

loading,

error

} = useLogs(

finalFilters,

{
page,
limit:50
}

);


//////////////////////////////////////////////////////
// SAFETY CHECK
//////////////////////////////////////////////////////

if (!id)
{
return (

<div className="p-8">

Invalid application ID

</div>

);
}


//////////////////////////////////////////////////////
// RENDER
//////////////////////////////////////////////////////

return(

<div className="p-8 space-y-6">


{/* =====================================================
FILTER BAR
===================================================== */}
<SavedViews

 applicationId={id}

 filters={filters}

 setFilters={setFilters}

/>



{/* =====================================================
ERROR DISPLAY
===================================================== */}

{error && (

<div className="text-red-500">

{error}

</div>

)}


{/* =====================================================
LIVE TAIL VIEWER (NEW)
===================================================== */}

<LiveLogs

applicationId={id}

/>


{/* =====================================================
LOGS CONTAINER
===================================================== */}
<LiveSearch applicationId={id} />
<AlertsPanel applicationId={id}/>
<FilterBar

filters={finalFilters}

setFilters={(newFilters)=>{

setPage(1);

setFilters(newFilters);

}}

/>
<LogsContainer

logs={logs}

loading={loading}

page={page}

setPage={setPage}

/>


</div>

);

}
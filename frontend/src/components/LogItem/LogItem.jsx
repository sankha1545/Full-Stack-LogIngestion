import React, { useState, useMemo } from "react";
import { Copy, Star, Share2 } from "lucide-react";


export default function LogItem({ log, onClick }) {


  /* =====================================================
  SAFETY NORMALIZATION
  ===================================================== */

  const level = (log?.level || "INFO").toLowerCase();

  const message = log?.message || "";

  const timestampRaw = log?.timestamp || null;

  const resourceId = log?.resourceId || "—";

  const meta = log?.meta || log?.metadata || {};


  /* =====================================================
  LOCAL STATE
  ===================================================== */

  const [bookmarked, setBookmarked] = useState(false);


  /* =====================================================
  DERIVED VALUES
  ===================================================== */

  const shortMsg = useMemo(() => {

    if (!message) return "—";

    return message.length > 120

      ? message.slice(0, 117) + "…"

      : message;

  }, [message]);


  const timestamp = useMemo(() => {

    if (!timestampRaw) return "—";

    try {

      return new Date(timestampRaw).toLocaleString();

    } catch {

      return "—";

    }

  }, [timestampRaw]);


  const levelColorMap = {

    error: "bg-red-100 text-red-700",

    warn: "bg-amber-100 text-amber-700",

    info: "bg-sky-100 text-sky-700",

    debug: "bg-slate-100 text-slate-700",

  };


  const levelColor = levelColorMap[level] || levelColorMap.info;


  /* =====================================================
  ACTIONS
  ===================================================== */

  async function handleCopy(text) {

    try {

      await navigator.clipboard.writeText(text);

    } catch {}

  }


  function handleShare() {

    const text = `${timestamp} — ${message}`;

    if (navigator.share) {

      navigator.share({

        title: `Log ${level.toUpperCase()}`,

        text,

      });

    }

    else {

      handleCopy(text);

    }

  }


  /* =====================================================
  RENDER
  ===================================================== */

  return (

    <div

      role="button"

      onClick={() => onClick?.(log)}

      className="group cursor-pointer p-3 border rounded-lg hover:shadow-sm active:translate-y-[1px] transition"

    >


      <div className="flex justify-between gap-3">


        {/* LEFT */}

        <div className="flex-1 min-w-0">


          <div className="flex items-center gap-3">


            <div className={`px-2 py-1 rounded text-xs font-semibold ${levelColor}`}>

              {level.toUpperCase()}

            </div>


            <div className="text-xs text-slate-500">

              {timestamp}

            </div>


            <div className="text-xs text-slate-600">

              {resourceId}

            </div>


          </div>



          <div className="mt-2 text-sm break-words text-slate-700">

            {shortMsg}

          </div>



          {/* META */}

          {meta && Object.keys(meta).length > 0 && (

            <div className="mt-2 text-xs text-slate-500">

              {

                Object.entries(meta)

                  .slice(0, 3)

                  .map(

                    ([k, v]) => `${k}: ${String(v)}`

                  )

                  .join(" • ")

              }

            </div>

          )}


        </div>



        {/* RIGHT ACTIONS */}

        <div className="flex flex-col gap-2">


          <button

            onClick={(e) => {

              e.stopPropagation();

              setBookmarked(prev => !prev);

            }}

            className="p-1 rounded hover:bg-slate-100"

          >

            <Star

              size={16}

              className={

                bookmarked

                  ? "text-yellow-500"

                  : "text-slate-400"

              }

            />

          </button>



          <div className="flex gap-2">


            <button

              onClick={(e) => {

                e.stopPropagation();

                handleCopy(message);

              }}

              className="p-1 rounded hover:bg-slate-100"

            >

              <Copy size={16} className="text-slate-400" />

            </button>



            <button

              onClick={(e) => {

                e.stopPropagation();

                handleShare();

              }}

              className="p-1 rounded hover:bg-slate-100"

            >

              <Share2 size={16} className="text-slate-400" />

            </button>


          </div>


        </div>


      </div>


    </div>

  );

}

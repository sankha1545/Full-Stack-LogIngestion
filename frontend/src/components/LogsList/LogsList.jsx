// src/components/LogsList/LogsList.jsx

import React, {

  useState,
  useEffect,
  useMemo

} from "react";

import {

  AnimatePresence,
  motion

} from "framer-motion";

import {

  ChevronLeft,
  ChevronRight

} from "lucide-react";

import LogItem from "../LogItem/LogItem";

import LogModal from "../Modal/LogModal";


/* =====================================================
CONFIG
===================================================== */

const LOGS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

const DEFAULT_PER_PAGE = 10;


/* =====================================================
COMPONENT
===================================================== */

export default function LogsList({

  logs = [],
  loading = false,

}) {


  /* =====================================================
  STATE
  ===================================================== */

  const [page, setPage] = useState(1);

  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const [selectedLog, setSelectedLog] = useState(null);


  /* =====================================================
  FIX — RESET PAGE WHEN LOGS CHANGE
  ===================================================== */

  useEffect(() => {

    setPage(1);

  }, [logs]);


  /* =====================================================
  FIX — SAFE LOG ARRAY
  ===================================================== */

  const safeLogs = useMemo(() => {

    return Array.isArray(logs)
      ? logs
      : [];

  }, [logs]);


  /* =====================================================
  PAGINATION
  ===================================================== */

  const totalPages = useMemo(() => {

    return Math.max(

      1,
      Math.ceil(

        safeLogs.length / perPage

      )

    );

  }, [safeLogs, perPage]);


  const safePage = useMemo(() => {

    return Math.min(

      Math.max(page, 1),
      totalPages

    );

  }, [page, totalPages]);


  const paginatedLogs = useMemo(() => {

    const start =

      (safePage - 1) * perPage;

    const end =

      start + perPage;

    return safeLogs.slice(

      start,
      end

    );

  }, [

    safeLogs,
    safePage,
    perPage

  ]);


  /* =====================================================
  DEBUG (REMOVE AFTER TEST)
  ===================================================== */

  console.log(

    "LogsList received:",
    safeLogs.length

  );


  /* =====================================================
  LOADING STATE
  ===================================================== */

  if (loading)

    return (

      <div className="p-6 text-center text-slate-500">

        Loading logs...

      </div>

    );


  /* =====================================================
  EMPTY STATE
  ===================================================== */

  if (!loading && safeLogs.length === 0)

    return (

      <div className="p-6 text-center text-slate-500">

        No logs found

      </div>

    );


  /* =====================================================
  RENDER
  ===================================================== */

  return (

    <div className="space-y-4">


      {/* HEADER */}


      <div className="flex items-center justify-between">


        <div className="text-sm text-slate-500">


          Showing

          <span className="mx-1 font-medium">

            {paginatedLogs.length}

          </span>

          of

          <span className="mx-1 font-medium">

            {safeLogs.length}

          </span>

          logs


        </div>


        <div className="flex items-center gap-2 text-sm">


          Per page


          <select

            value={perPage}

            onChange={(e) => {

              setPerPage(

                Number(

                  e.target.value

                )

              );

              setPage(1);

            }}

            className="px-2 py-1 border rounded"

          >


            {LOGS_PER_PAGE_OPTIONS.map(

              (n) => (

                <option

                  key={n}
                  value={n}

                >

                  {n}

                </option>

              )

            )}


          </select>


        </div>


      </div>


      {/* LOG LIST */}


      <AnimatePresence mode="popLayout">


        <motion.div

          key={`page-${safePage}`}

          initial={{ opacity: 0, y: 6 }}

          animate={{ opacity: 1, y: 0 }}

          exit={{ opacity: 0, y: -6 }}

          transition={{ duration: 0.18 }}

          className="space-y-2"

        >


          {paginatedLogs.map(

            (log) => (

              <LogItem

                key={log.id}

                log={log}

                onClick={setSelectedLog}

              />

            )

          )}


        </motion.div>


      </AnimatePresence>


      {/* PAGINATION */}


      <div className="flex items-center justify-between pt-3 border-t">


        <button

          onClick={() =>

            setPage(

              (prev) =>

                Math.max(

                  prev - 1,
                  1

                )

            )

          }

          disabled={safePage === 1}

          className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-40"

        >


          <ChevronLeft size={16} />

          Prev


        </button>


        <div className="text-sm">


          Page

          <span className="mx-1 font-semibold">

            {safePage}

          </span>

          of

          <span className="mx-1 font-semibold">

            {totalPages}

          </span>


        </div>


        <button

          onClick={() =>

            setPage(

              (prev) =>

                Math.min(

                  prev + 1,
                  totalPages

                )

            )

          }

          disabled={safePage === totalPages}

          className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-40"

        >


          Next

          <ChevronRight size={16} />


        </button>


      </div>


      {/* MODAL */}


      <AnimatePresence>


        {selectedLog && (

          <LogModal

            log={selectedLog}

            onClose={() =>

              setSelectedLog(null)

            }

          />

        )}


      </AnimatePresence>


    </div>

  );

}

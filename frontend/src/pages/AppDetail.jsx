import { useParams } from "react-router-dom";
import { useState } from "react";

import { useLogs } from "@/hooks/useLogs";
import LogsContainer from "@/components/logs/LogsContainer";

export default function AppDetail() {

  const { id } = useParams();

  const [page, setPage] = useState(1);

  const {

    logs = [],

    loading,

    error,

  } = useLogs(

    { applicationId: id },

    {

      page,

      limit: 50,

    }

  );


  /* ----------------------------------- */

  if (!id) {

    return (

      <div className="p-8">

        Invalid application ID

      </div>

    );

  }


  if (loading) {

    return (

      <div className="p-8">

        Loading logs...

      </div>

    );

  }


  if (error) {

    return (

      <div className="p-8 text-red-500">

        {error}

      </div>

    );

  }


  /* ----------------------------------- */

  return (

    <div className="p-8">

      <LogsContainer

        logs={logs}

        loading={loading}

        page={page}

        setPage={setPage}

      />

    </div>

  );

}

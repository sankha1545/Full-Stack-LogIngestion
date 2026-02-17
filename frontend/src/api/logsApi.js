const BASE_URL = "http://localhost:3001/api";


/* =====================================================
   TOKEN HELPER
===================================================== */

function getAuthToken() {

  return (

    localStorage.getItem("token") ||

    localStorage.getItem("access_token") ||

    sessionStorage.getItem("token")

  );

}


/* =====================================================
   VALUE NORMALIZER
===================================================== */

function normalizeValue(key, value) {

  if (value === undefined || value === null) return null;

  if (key === "from" || key === "to") return value;

  return String(value);

}


/* =====================================================
   ERROR HANDLER
===================================================== */

async function handleResponse(res) {

  let data = null;

  try {

    data = await res.json();

  } catch {}

  if (res.ok) {

    return data;

  }

  const message =

    data?.error ||

    data?.message ||

    res.statusText ||

    "Failed to fetch logs";


  const error = new Error(message);

  error.status = res.status;

  throw error;

}


/* =====================================================
   BUILD QUERY
===================================================== */

function buildQueryParams(filters = {}) {

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {

    const normalized = normalizeValue(key, value);

    if (

      normalized !== null &&

      normalized !== undefined &&

      normalized !== ""

    ) {

      if (key === "caseSensitive") {

        params.append(

          "caseSensitive",

          value ? "true" : "false"

        );

      }

      else {

        params.append(key, normalized);

      }

    }

  });

  return params.toString();

}


/* =====================================================
   FETCH LOGS
===================================================== */

export async function fetchLogs(filters = {}, signal) {

  const query = buildQueryParams(filters);

  const url =

    query.length

      ? `${BASE_URL}/logs?${query}`

      : `${BASE_URL}/logs`;


  if (import.meta.env.DEV) {

    console.log("LogScope fetchLogs URL:", url);

  }


  try {

    const token = getAuthToken();


    const res = await fetch(url, {

      method: "GET",

      signal,

      credentials: "include",

      headers: {

        "Content-Type": "application/json",

        ...(token && {

          Authorization: `Bearer ${token}`

        }),

      },

    });


    const data = await handleResponse(res);


    /*
    CRITICAL FIX

    Return FULL response

    NOT data.data
    */

    return data;


  }

  catch (err) {

    if (err.name === "AbortError") return;

    if (!err.status) {

      err.message =

        "Network error: Unable to reach LogScope server";

    }

    throw err;

  }

}

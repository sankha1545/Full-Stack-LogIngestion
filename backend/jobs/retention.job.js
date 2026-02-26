/**
 * ============================================================
 * LogScope Log Retention Job
 * ============================================================
 *
 * Deletes logs older than application.retentionDays
 *
 * Runs automatically
 *
 * Industrial-grade safe cleanup
 *
 */

const prisma = require("../utils/prisma");

///////////////////////////////////////////////////////////////
// CONFIG
///////////////////////////////////////////////////////////////

/**
 * Run every hour
 */
const INTERVAL =
  60 * 60 * 1000;

let running = false;

///////////////////////////////////////////////////////////////
// MAIN JOB
///////////////////////////////////////////////////////////////

async function runRetentionJob() {

  if (running) {

    console.log(
      "Retention job already running"
    );

    return;

  }

  running = true;

  try {

    console.log(
      "Retention job started:",
      new Date().toISOString()
    );



    ///////////////////////////////////////////////////////////
    // GET APPLICATIONS
    ///////////////////////////////////////////////////////////

    const apps =
      await prisma.application.findMany({

        where: {

          deleted: false,

        },

        select: {

          id: true,

          retentionDays: true,

        },

      });



    ///////////////////////////////////////////////////////////
    // PROCESS EACH APP
    ///////////////////////////////////////////////////////////

    for (const app of apps) {

      try {

        const cutoff =
          new Date(
            Date.now()
            - app.retentionDays
            * 24
            * 60
            * 60
            * 1000
          );



        ///////////////////////////////////////////////////////
        // DELETE LOGS
        ///////////////////////////////////////////////////////

        const result =
          await prisma.log.deleteMany({

            where: {

              applicationId:
                app.id,

              timestamp: {

                lt: cutoff,

              },

            },

          });



        if (result.count > 0) {

          console.log(

            `Deleted ${result.count} logs from app ${app.id}`

          );

        }

      }

      catch (err) {

        console.error(

          "Retention failed:",

          app.id,

          err.message

        );

      }

    }



    console.log(
      "Retention job finished"
    );

  }

  catch (err) {

    console.error(
      "Retention job error:",
      err
    );

  }

  finally {

    running = false;

  }

}

///////////////////////////////////////////////////////////////
// START JOB
///////////////////////////////////////////////////////////////

function startRetentionJob() {

  console.log(
    "Starting retention job..."
  );


  setInterval(

    runRetentionJob,

    INTERVAL

  );

}

///////////////////////////////////////////////////////////////

module.exports = {

  startRetentionJob,

  runRetentionJob,

};
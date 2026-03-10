const Agenda = require("agenda");

const runScheduler = process.env.RUN_SCHEDULER;

var connectionOpts = {
  db: {
    address:
      "mongodb://anran-uat-tst:anran$123@172.16.30.251:27017/anran-uat?replicaSet=rs0",
    collection: "agendaJobs",
  },
};

if (runScheduler == "0") {
  connectionOpts = {
    db: {
      address:
        "mongodb://anran-prod-user:anran$360@192.168.30.85:27017/anran-prod-db?replicaSet=rs0",
      collection: "agendaJobs",
    },
  };
}

if (runScheduler == "1") {
  connectionOpts = {
    db: {
      address:
        "mongodb://anran-dev:anran$123@172.16.30.251:27017/anran-dev-db?replicaSet=rs0",
      collection: "agendaJobs",
    },
  };
}

const agenda = new Agenda(connectionOpts);

// listen for the ready or error event.
agenda
  .on("ready", () => console.log("Agenda started!"))
  .on("error", () => console.log("Agenda connection error!"));

const jobTypes = process.env.JOB_TYPES ? process.env.JOB_TYPES.split(",") : [];

jobTypes.forEach((type) => {
  require("./jobs/definitions")(agenda);
});

if (jobTypes.length) {
  agenda.start(); // Returns a promise, which should be handled appropriately
}

// logs all registered jobs
// console.log({ jobs: agenda._definitions });

module.exports = { agenda };

const cluster = require("cluster")
var numWorkers = process.env.WEB_CONCURRENCY;

if (cluster.isMaster) {
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork()
    }

    cluster.on('exit', () => {
        cluster.fork()
    })
} else {
    require("./server")
}
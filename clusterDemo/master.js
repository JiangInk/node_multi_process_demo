// console.log('####====START====###');
// var cluster = require('cluster');
// var numCPUs = require('os').cpus().length;
//
// cluster.setupMaster({
//   exec: '/Users/jiangbo/GitLib/icrm-src/test/test_work.js',
//   slient: true
// });
//
// var collection = [44, 42, 42, 43];
// var st = Date.now();
// for (var i = 0; i < Math.min(numCPUs, collection.length); i++) {
//   var wk = cluster.fork();
//   wk.send(collection[i]);
// }
// cluster.on('fork', function (worker) {
//   console.log(`[master] : fork worker ${worker.id}`);
// });
// cluster.on('exit', function (worker, code, signal) {
//   console.log(`[master] : worker ${worker.id} died`);
// });
// var numOfCompelete = 0;
// Object.keys(cluster.workers).forEach(function (id) {
//   cluster.workers[id].on('message', function (msg) {
//     console.log(`[master] receive message from [worker ${id}]: ${msg}`);
//     numOfCompelete++;
//     if (numOfCompelete === collection.length) {
//       console.log(`[master] finish all work and using ${Date.now() - st} ms`);
//       cluster.disconnect();
//     }
//   });
// });

// -----------
module.exports = exuteFibo;
function exuteFibo () {
  return new Promise(function (reslove, reject) {
    var cluster = require('cluster');
    var numCPUs = require('os').cpus().length;
    var result = [];
    cluster.setupMaster({
      exec: 'test_work.js',
      slient: true
    });

    var collection = [44, 42, 42, 43];
    var workerID = [];
    var st = Date.now();
    for (var i = 0; i < Math.min(numCPUs, collection.length); i++) {
      var wk = cluster.fork();
      workerID.push(wk.id);
      wk.send(collection[i]);
    }
    cluster.on('fork', function (worker) {
      if (workerID.indexOf(worker.id) !== -1) {
        console.log(`[master] : fork worker ${worker.id}`);
      }
    });
    cluster.on('exit', function (worker, code, signal) {
      if (workerID.indexOf(worker.id) !== -1) {
        console.log(`[master] : worker ${worker.id} died`);
      }
    });

    var numOfCompelete = 0;
    workerID.forEach(function (id) {
      cluster.workers[id].on('message', function (msg) {
        console.log(`[master] receive message from [worker${id}]: ${msg}`);
        result.push(msg);
        numOfCompelete++;
        if (numOfCompelete === collection.length) {
          console.log(`[master] finish all work and using ${Date.now() - st} ms`);
          // cluster.disconnect();
          workerID.forEach(function (id) {
            if (!cluster.workers[id].suicide) {
              cluster.workers[id].disconnect();
            }
          });

          reslove(result);
        }
      });
    });
  })
}

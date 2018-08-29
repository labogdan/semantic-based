
var viewReg = function () {

  this.top = jQuery(window).scrollTop();
  this.height = jQuery(window).height();
  this.bottom = this.top + this.height;
  var self = this;

   var calculate = function () {
       self.top = jQuery(window).scrollTop();
       self.height = jQuery(window).height();
       self.bottom = self.top + self.height;
       console.log(self.top);
       console.log(self.bottom);
   };
   jQuery(window).on('scroll', function () {
       calculate();
   });
};

var vr = new viewReg();


function helperUtil() {
  var $results = $(".results-obj");

  var show = function () {
    $results.removeClass("hidden");
  }

  return {
    printResults(results) {
      var html = $results.html();
      html += results;

      show();
    }
  }
}



function htmlHistory() {
  this.myState = 0;
}
htmlHistory.prototype.addValue = function(key, state, settings) {
  history.pushState({"modal.history" : this.myState++, "modal":true}, true);
};
htmlHistory.prototype.replaceValue = function(stateObj, val, newUrl) {
  this.myState--;
  delete window.history.state.modal;
};
htmlHistory.prototype.get = function(e) {
  return history.state;
};



function htmlHistoryOld() {
  var add = function(e) {
    var data = e.target.href.substring(e.target.origin.length);
    history.pushState(data, null, data);
  }
}

htmlHistoryOld.prototype.addValue = function(key, state, settings) {
  history.pushState(key, null, key);
}

htmlHistoryOld.prototype.replaceValue = function(stateObj, val, newUrl) {

  history.replaceState(stateObj, null, newUrl);
}

htmlHistoryOld.prototype.get = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  return history.state;
}


var wait = ms => new Promise((r, j)=>setTimeout(r, ms));

function queue(config) {

/*
    asyncQueue shim
    usage:
      queue()
      @param config
        concurrency
        startImmediately

      .add(obj)

      where obj = {
        fn: function to add,
        args: any arguments,
        timeout: timeout before function is run,
        context: the this that you want
      }
*/

  console.warn('initializing async queue');
  console.log(this);

  this.concurrency = config && config.concurrency ? config.concurrency : 1;
  this.startImmediately = config && config.startImmediately ? config.startImmediately : false;
  this.running = 0;
  this.taskQueue = [];
  this.stopRequested = false;
  var self = this;

  var callApply = function (task) {
    task.fn.apply(task.context ? task.context : null,[function () {
      self.running--;
      if (self.taskQueue.length > 0) {
        runTaskApply(self.taskQueue.shift());
      }
    },task.args]);
  };

  var runTaskApply = function (task) {

    console.log("runTaskApply");
    if (self.stopRequested) {
      console.log('stop requested - halting');
      return;
    }
    self.running++;

    if (task.timeout) {
        setTimeout(function () {
          console.log("timeout for: %o", task.timeout);
          console.log(self.taskQueue);
          //self.taskQueue.unshift(task);
          callApply(task);
          console.log(self.taskQueue);
      }, task.timeout);
    } else {
      callApply(task);
    }
  };

  var enqueueTask = function enqueueTask(task) {
    console.log("enqueueTask");
    return self.taskQueue.push(task);
  };

  return {
    add: function add(task) {
      console.warn('adding task: %o', task);
      console.log(self.taskQueue);
      return self.running < self.concurrency && self.startImmediately ? runTaskApply (task) : enqueueTask(task);
    },
    run: function () {
      console.warn('running tasks');
      self.stopRequested = false;
      runTaskApply(self.taskQueue.shift());
    },
    stop: function () {
      console.warn('stopping temporarily');
      self.stopRequested = true;
      console.log(self.stopRequested);
    }
  };
}


$(document).ready(function() {

  var taskRunner = new queue({concurrency:1, startImmediately: false}),
      helper = helperUtil(),
      a = {};

/*
  Task Runner

*/

  var task1 = function task1(done) {
    return setTimeout(function () {
      console.log('function 1');
      done();
    }, 750);
  };
  var task2 = function task2(done, params) {
    return setTimeout(function () {
      console.log('function 2');
      console.log(params[0] + params[1] + params[2]);
      done();
    }, 250);
  };
  var task3 = function task3(done) {
    return setTimeout(function () {
      console.log('function 3');
      done();
    }, 500);
  };

  var task4 = function (done, money, hours) {
    return setTimeout(function () {
      console.log('function 4');
      done();
    }, 300);
  };


/*
          {
						fn: setupDots,
						args: [$(temparray)],
						timeout: asyncQueue.size() > 0 ? 10 : 0,
						context: dis
					}
*/

  taskRunner.add({fn:task1,
                  timeout: 1500,
                  context: window
  });
  taskRunner.add({fn:task2,
                  args: [4,5,6],
                  timeout: 1000,
                  context: window
  });
  taskRunner.add({fn:task3});
  taskRunner.add({fn:task4});
  taskRunner.run();
  setTimeout(function () {
    taskRunner.stop();
  }, 500);
  setTimeout(function () {
    taskRunner.run();
  }, 1000);

/*
  A.history shim

  https://yuilibrary.com/yui/docs/api/classes/HistoryHTML5.html
  https://css-tricks.com/using-the-html5-history-api/
  https://developer.mozilla.org/en-US/docs/Web/API/History_API
*/

  a.history = new htmlHistory();

  $(window).on('popstate', function(e) {
    console.log('popstate: %o', e);
    console.log(window.state);
  });

  $(".state").on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    a.history.addValue("/new.html");
  });

  $(".state1").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    a.history.replaceValue("/new.html", null, "bar2.html");
  });

  $(".state2").on("click", function(e) {
    console.log(a.history.get(e));
  });


/*
  A.AsyncQueue shim
*/



});

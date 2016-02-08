utils = new (function() {
  var xhr = new XMLHttpRequest()

  this.debounce = function(fn) {
    var timer = null;
    
    return function() {
        var self = this, args = arguments;
        
        function doIt() {
          fn.apply(self, args);
          timer = null;
        }
        
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(doIt, 500);
    };
  };


  this.get = function(url, cb) {
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE ) {
         if(xhr.status == 200){
           cb(null, xhr.responseText);
         } else {
           cb({ data: xhr.responseText, code: xhr.status });
         }
      }
    }

    xhr.open("GET", url, true);
    xhr.send();
  };
})();
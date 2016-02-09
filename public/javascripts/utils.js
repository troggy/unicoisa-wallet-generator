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
  
  this.showFile = function() {
    var uploadInput = document.getElementById('uploadInput');
    
    if (uploadInput.value != ''){
        document.getElementById('uploadPrompt').style.display = 'none';
        document.getElementById('selectedFile').style.display = '';
        var filenameSpan = document.getElementById('filename'),
            filenameParts = uploadInput.value.split('\\'),
            filename = filenameParts[filenameParts.length - 1];
        while(filenameSpan.firstChild) {
          filenameSpan.removeChild( filenameSpan.firstChild );
        }
        filenameSpan.appendChild( document.createTextNode(filename) );
      }
  };

  this.selectNewFile = function() {
    document.getElementById('uploadPrompt').style.display = '';
    document.getElementById('selectedFile').style.display = 'none';
    document.getElementById('uploadInput').value = '';
  };
  
})();
var PageManager = new (function(){
  if(!console){
    console = {
      log: function(){},
      error: function(){},
      info: function(){}
    }
  }

  var pages = new Object;

  this.page = function(page){
    pages[page.name] = $.extend(page.meta, page.operations);
  }

  this.pageBound = function(page_name){
    return !!pages[page_name];
  }

  this.operationBound = function(page_name, operation_name){
    return this.pageBound(page_name) && pages[page_name][operation_name];
  }

  this.triggerPage = function(page_name, data){
    if(this.pageBound(page_name) && pages[page_name]['page'] instanceof Function){
      pages[page_name]['page'](data);
    }
  }

  this.triggerOperation = function(page_name, operation_name, data){
    if(this.operationBound(page_name, operation_name)
      && pages[page_name][operation_name] instanceof Function){

      triggerHook(page_name, 'before', data);
      triggerHook(page_name, 'around', data);
      pages[page_name][operation_name](data);
      triggerHook(page_name, 'around', data);
      triggerHook(page_name, 'after', data);
    }
  }

  var triggerHook = function(page_name, hook, data){
    if(PageManager.pageBound(page_name) && pages[page_name][hook] instanceof Function){
      pages[page_name][hook](data);
    }
  }

  $.ajaxSetup({
    dataType: 'json'
  });

  $(document).ajaxComplete(function(event, xhr, ajaxOptions){
    var setCookie = xhr.getResponseHeader('Set-Cookie');
    if (setCookie != '') {
      document.cookie = setCookie;
    }

    if(ajaxOptions.dataType == 'json'){
      try{
        json = eval("(" + xhr.responseText + ")");
      } catch (e) {
        json = new Object;
      }

      if(json.page){
        PageManager.triggerPage(json.page);

        if(json.operation){
          PageManager.triggerOperation(json.page, json.operation, json);
        }
      }
    }
  });
});

var Page = function(name, meta, operations){
  this.name = name;
  this.meta = meta;
  this.operations = operations;
};
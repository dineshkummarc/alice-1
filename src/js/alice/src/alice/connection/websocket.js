Alice.Connection.WebSocket = Class.create(Alice.Connection, {
  initialize: function(application) {
    this.application = application;
    this.connected = false;
    this.aborting = false;
    this.request = null;
    this.reconnect_count = 0;
    this.reconnecting = false;
    this.windowQueue = [];
    this.windowWatcher = false;
  },

  _connect: function() {
    var now = new Date();
    var msgid = this.msgid();
    this.application.log("opening new websocket connection starting at "+msgid);
    this.changeStatus("ok");
    this.connected = true;
    var parameters = Object.toQueryString({msgid: msgid, t: now.getTime() / 1000});
    var url = "ws://" + window.location.host + "/wsstream?" + parameters;
    this.request = new WebSocket(url);
    this.request.onmessage = this.handleUpdate.bind(this);
    this.request.onerror = this.handleException.bind(this);
    this.request.onclose = this.handleComplete.bind(this);
  },

  handleUpdate: function(e) {
    var data = e.data.evalJSON();
    this.processMessages(data);
  },

  sendMessage: function(form) {
    if (!this.connected) return false;

    var params = form;
    if (form.nodeName && form.nodeName == "FORM") {
      params = form.serialize(true);
    }

    this.request.send(Object.toJSON(params));
    return true;
  },

  closeConnection: function() {
    this.aborting = true;
    if (this.request) this.request.close();
    this.aborting = false;
  },

  closeWindow: function(win) {
    this.request.send(Object.toJSON(
      {source: win.id, msg: "/close"}
    ));
  },


});

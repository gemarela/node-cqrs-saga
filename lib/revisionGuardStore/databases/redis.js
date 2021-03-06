'use strict';

var util = require('util'),
    Store = require('../base'),
    _ = require('lodash'),
    debug = require('debug')('saga:revisionGuardStore:redis'),
    uuid = require('node-uuid').v4,
    ConcurrencyError = require('../../errors/concurrencyError'),
    jsondate = require('jsondate'),
    async = require('async'),
    redis = require('redis');

function Redis(options) {
  Store.call(this, options);

  var defaults = {
    host: 'localhost',
    port: 6379,
    prefix: 'readmodel_revision',
    max_attempts: 1
  };

  _.defaults(options, defaults);

  if (options.url) {
    var url = require('url').parse(options.url);
    if (url.protocol === 'redis:') {
      if (url.auth) {
        var userparts = url.auth.split(":");
        options.user = userparts[0];
        if (userparts.length === 2) {
          options.password = userparts[1];
        }
      }
      options.host = url.hostname;
      options.port = url.port;
      if (url.pathname) {
        options.db   = url.pathname.replace("/", "", 1);
      }
    }
  }

  this.options = options;
}

util.inherits(Redis, Store);

_.extend(Redis.prototype, {

  connect: function (callback) {
    var self = this;

    var options = this.options;

    this.client = new redis.createClient(options.port || options.socket, options.host, options);

    this.prefix = options.prefix;

    var calledBack = false;

    if (options.password) {
      this.client.auth(options.password, function(err) {
        if (err && !calledBack && callback) {
          calledBack = true;
          if (callback) callback(err, self);
          return;
        }
        if (err) throw err;
      });
    }

    if (options.db) {
      this.client.select(options.db);
    }

    this.client.on('end', function () {
      self.disconnect();
    });

    this.client.on('error', function (err) {
      console.log(err);

      if (calledBack) return;
      calledBack = true;
      if (callback) callback(null, self);
    });

    this.client.on('connect', function () {
      if (options.db) {
        self.client.send_anyways = true;
        self.client.select(options.db);
        self.client.send_anyways = false;
      }

      self.emit('connect');

      if (calledBack) return;
      calledBack = true;
      if (callback) callback(null, self);
    });
  },

  disconnect: function (callback) {
    if (this.client) {
      this.client.end();
    }
    this.emit('disconnect');
    if (callback) callback(null, this);
  },

  getNewId: function(callback) {
    this.client.incr('nextItemId:' + this.prefix, function(err, id) {
      if (err) {
        return callback(err);
      }
      callback(null, id.toString());
    });
  },

  get: function (id, callback) {
    if (!id || !_.isString(id)) {
      var err = new Error('Please pass a valid id!');
      debug(err);
      return callback(err);
    }

    this.client.get(this.options.prefix + ':' + id, function (err, entry) {
      if (err) {
        return callback(err);
      }

      if (!entry) {
        return callback(null, null);
      }

      try {
        entry = jsondate.parse(entry.toString());
      } catch (error) {
        if (callback) callback(error);
        return;
      }

      callback(null, entry.revision || null);
    });
  },

  set: function (id, revision, oldRevision, callback) {
    if (!id || !_.isString(id)) {
      var err = new Error('Please pass a valid id!');
      debug(err);
      return callback(err);
    }
    if (!revision || !_.isNumber(revision)) {
      var err = new Error('Please pass a valid revision!');
      debug(err);
      return callback(err);
    }

    var key = this.options.prefix + ':' + id;

    var self = this;

    this.client.watch(key, function (err) {
      if (err) {
        return callback(err);
      }

      self.get(id, function (err, rev) {
        if (err) {
          debug(err);
          if (callback) callback(err);
          return;
        }

        if (rev && rev !== oldRevision) {
          self.client.unwatch(function (err) {
            if (err) {
              debug(err);
            }

            err = new ConcurrencyError();
            debug(err);
            if (callback) {
              callback(err);
            }
          });
          return;
        }

        self.client.multi([['set'].concat([key, JSON.stringify({ revision: revision })])]).exec(function (err, replies) {
          if (err) {
            debug(err);
            if (callback) {
              callback(err);
            }
            return;
          }
          if (!replies || replies.length === 0 || _.find(replies, function (r) {
                return r !== 'OK'
              })) {
            var err = new ConcurrencyError();
            debug(err);
            if (callback) {
              callback(err);
            }
            return;
          }
          if (callback) {
            callback(null);
          }
        });
      });
    });
  },

  saveLastEvent: function (evt, callback) {
    var key = this.options.prefix + ':THE_LAST_SEEN_EVENT';

    this.client.set(key, JSON.stringify({ event: evt }), function (err) {
      if (callback) { callback(err); }
    });
  },

  getLastEvent: function (callback) {
    this.client.get(this.options.prefix + ':THE_LAST_SEEN_EVENT', function (err, entry) {
      if (err) {
        return callback(err);
      }

      if (!entry) {
        return callback(null, null);
      }

      try {
        entry = jsondate.parse(entry.toString());
      } catch (error) {
        if (callback) callback(error);
        return;
      }

      callback(null, entry.event || null);
    });
  },

  clear: function (callback) {
    var self = this;
    async.parallel([
      function (callback) {
        self.client.del('nextItemId:' + self.options.prefix, callback);
      },
      function (callback) {
        self.client.keys(self.options.prefix + ':*', function(err, keys) {
          if (err) {
            return callback(err);
          }
          async.each(keys, function (key, callback) {
            self.client.del(key, callback);
          }, callback);
        });
      }
    ], function (err) {
      if (err) {
        debug(err);
      }
      if (callback) callback(err);
    });
  }

});

module.exports = Redis;

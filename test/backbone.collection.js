'use strict';
describe('Backbone.Collection', function () {
  var Collection = Backbone.Collection.extend({
    // Making sure we use an unique localforage namespace by using Date.now
    sync: Backbone.localforage.sync(Date.now()),
    model: Backbone.Model.extend({
      sync: Backbone.localforage.sync()
    })
  });

  var collection, id;

  beforeEach(function (done) {
    collection = new Collection();
    collection.fetch({
      success: function () {
        done();
      }
    });
  });

  it('saves to localForage', function (done) {
    collection.create({hello: 'world!'}, {
      success: function (model) {
        expect(model).toBeDefined();
        id = model.get('id');
        expect(id).toBeDefined();
        expect(model.get('hello')).toEqual('world!');
        done();
      }
    });
  });

  it('fetches from localForage', function (done) {
    collection.fetch({
      success: function () {
        expect(collection.length).toEqual(1);
        var model = collection.get(id);
        expect(model).toBeDefined();
        expect(model.attributes).toEqual({
          id: id,
          hello: 'world!'
        });
        done();
      }
    });
  });

  it('updates to localForage', function (done) {
    collection.get(id).save({hello: 'you!'}, {
      success: function () {
        expect(collection.get(id).get('hello')).toEqual('you!');
        done();
      }
    });
  });

  it('removes from localForage', function (done) {
    collection.get(id).destroy({
      success: function () {
        expect(collection.length).toEqual(0);
        done();
      }
    });
  });
});
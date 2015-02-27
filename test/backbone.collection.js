/*global Backbone, beforeEach:true, describe:true, expect:true, it:true */
describe('Backbone.Collection', function() {
    'use strict';

    var Collection = Backbone.Collection.extend({
        // Making sure we use an unique localforage namespace by using Date.now
        sync: Backbone.localforage.sync(Date.now()),
        model: Backbone.Model.extend({
            sync: Backbone.localforage.sync('ModelNamespace')
        })
    });

    var collection;
    var id;

    beforeEach(function(done) {
        collection = new Collection();
        collection.fetch({
            success: function() {
                done();
            }
        });
    });

    it('saves to localForage', function(done) {
        collection.create({hello: 'world!'}, {
            success: function(model) {
                id = model.get('id');

                expect(model).toBeDefined();
                expect(id).toBeDefined();
                expect(model.get('hello')).toEqual('world!');

                done();
            }
        });
    });

    it('fetches from localForage', function(done) {
        collection.fetch({
            success: function() {
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

    it('updates to localForage', function(done) {
        collection.get(id).save({hello: 'you!'}, {
            success: function() {
                expect(collection.get(id).get('hello')).toEqual('you!');

                done();
            }
        });
    });

    it('removes from localForage', function(done) {
        localforage.getItem(collection.sync.localforageKey, function(err, values) {
            collection.get(id).destroy({
                success: function() {
                    expect(collection.length).toEqual(0);

                    // expect collection references to be reset
                    localforage.getItem(collection.sync.localforageKey, function(err, values2) {
                        expect(values2.length).toEqual(values.length - 1);

                        // test complete
                        done();
                    });
                }
            });
        });
    });

    describe('check that key is available even for unsynced collection', function() {
        var anotherCollection;

        var AnotherCollection = Backbone.Collection.extend({
            // Making sure we use an unique localforage namespace by using Date.now
            sync: Backbone.localforage.sync(Date.now()),
            model: Backbone.Model.extend({
                sync: Backbone.localforage.sync('model')
            })
        });

        it('localforageKey should not be defined when unsynced', function() {
            anotherCollection = new AnotherCollection();
            expect(anotherCollection.sync.localforageKey).toBeUndefined();
        });

        it('localforageKey should be set for collection on model sync prior to collection sync (collection.create)', function(done) {
            // calling create will create a model and call save() on your behalf
            anotherCollection.create({foo: 'bar'}, {
                success: function() {
                    expect(anotherCollection.sync.localforageKey).not.toBeUndefined();
                    done();
                }
            });
        });
    });

});

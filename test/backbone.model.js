/*global Backbone, beforeEach:true, describe:true, expect:true, it:true */
describe('Backbone.Model', function() {
    'use strict';

    var Model = Backbone.Model.extend({
        sync: Backbone.localforage.sync('ModelNamespace')
    });

    describe('Model flow', function() {
        var model;
        var id;

        beforeEach(function(done) {
            model = new Model();
            if (id) {
                model.set('id', id).fetch({
                    success: function() {
                        done();
                    }
                });
            } else {
                done();
            }
        });

        it('saves to localForage', function(done) {
            model.save({hello: 'world!'}, {
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
            model.fetch({
                success: function() {
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
            model.save({hello: 'you!'}, {
                success: function() {
                    expect(model.get('hello')).toEqual('you!');

                    done();
                }
            });
        });

        it('removes from localForage', function(done) {
            model.destroy({
                success: function(model, resp, options) { // jshint unused:false
                    expect(model.attributes).toEqual(resp);
                    var handlers = {
                        success: function() {
                            testComplete();
                        },
                        error: function() {
                            testComplete();
                        }
                    };
                    spyOn(handlers, 'success').and.callThrough();
                    spyOn(handlers, 'error').and.callThrough();

                    var testComplete = function() {
                        expect(handlers.error).toHaveBeenCalled();
                        expect(handlers.success).not.toHaveBeenCalled();
                        done();
                    };

                    model.fetch(handlers);
                }
            });
        });
    });
});

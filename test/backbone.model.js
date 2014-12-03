/*global Backbone, beforeEach:true, describe:true, expect:true, it:true */
describe('Backbone.Model', function () {
  'use strict';

    var Model = Backbone.Model.extend({
      sync: Backbone.localforage.sync('ModelNamespace')
    });

    describe('Model flow', function () {
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
                success: function () {
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
                success: function() {
                    model.fetch({
                      error: function () {
                        done();
                      }
                    });
                }
            });
        });
    });

    describe('test', function () {
        it('should create distinct key', function (done) {
            var model1 = new Model();
            var model2 = new Model();

            var ids = [];
            // trick to faint asynchronicity of the test
            var updateTest = function (value) {
                ids.push(value);

                // mark test as complete
                if (ids.length > 1) {
                    expect(ids[0]).not.toEqual(ids[1]);
                    done();
                }
            };

            model1.fetch({
                error: function () {
                    updateTest(model1.id);
                }
            });

            model2.fetch({
                error: function () {
                    updateTest(model2.id);
                }
            });
        })
    });
});

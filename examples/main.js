(function (Backbone, $, _) {
    'use strict';

    // Set driver (optional, but we use localforage here so developers
    // can more easily inspect it).
    localforage.setDriver('localStorageWrapper');

    // We store offline data inside a collection. This is how we tell
    // a model/collection to store data offline with localForage.
    var ListCollection = Backbone.Collection.extend({
        sync: Backbone.localforage.sync('list'),
        model: Backbone.Model.extend({
            sync: Backbone.localforage.sync('item')
        })
    });

    // A view with a form and the collection contents
    var FormView = Backbone.View.extend({
        template: _.template($('#formtpl').html()),
        events: {
            'submit form': 'handleSaveModel'
        },

        handleSaveModel: function (event) {
            event.preventDefault();
            // It'll write on the localforage offline store
            this.collection.create({content: this.$input.val()});

            // clear form input
            this.$input.val('');
        },

        render: function () {
            // Render the form template on this.$el and append the
            // collection content
            this.$el.html(this.template());

            // cache DOM list container
            this.$input = this.$('[name="content"]');
            return this;
        }
    });

    var ListView = Backbone.View.extend({
      tagName: 'ul',
      className: 'table-view',

      initialize: function () {
          this.listenTo(this.collection, 'add', this.addItemView);
          this.listenTo(this.collection, 'remove change', this.render);
      },

      addItemView: function (model) {
          var itemView = new ItemView({model: model});
          this.$el.append(itemView.render().el);
      }
    });

    var ItemView = Backbone.View.extend({
        template: _.template($('#itemtpl').html()),
        tagName: 'li',
        className: 'table-view-cell',

        events: {
            'click [data-action="delete"]': 'deleteItem'
        },

        render: function () {
            this.$el.html(this.template({
                content: this.model.get('content')
            }));
            return this;
        },

        deleteItem: function (event) {
            event.preventDefault();
            this.model.destroy();
        }
    });

    // Instancing the collection and the view
    var collection = new ListCollection();

    var formView = new FormView({
        el: $('header'),
        collection: collection
    });

    var listView = new ListView({
        collection: collection
    });

    formView.render();
    $('.content').append(listView.render().el);

    collection.fetch();
}(this.Backbone, this.$, this._));

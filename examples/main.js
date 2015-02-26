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
            'click [data-action="add"]': 'addItem',
            'click [data-action="refresh"]': 'refresh'
        },

        addItem: function (event) {
            event.preventDefault();

            var attrs = {
                content: this.$input.val()
            };

            // It'll write on the localforage offline store
            if (this.model) {
                this.model.save(attrs);
                this.updateSaveIcon();
            }
            else {
                this.collection.create(attrs);
            }

            // clear form input
            this.$input.val('');

            // remove reference to edited model
            this.model = null;
        },

        editItem: function (model) {
            this.$input.val(model.get('content'));
            this.updateSaveIcon();

            // keep reference to current model edited
            this.model = model;
        },

        render: function () {
            // Render the form template on this.$el and append the
            // collection content
            this.$el.html(this.template());

            // cache DOM list container
            this.$input = this.$('[name="content"]');
            this.$addButtonIcon = this.$('[data-action="add"] > .icon');
            return this;
        },

        refresh: function (event) {
            event.preventDefault();
            collection.fetch({reset: true});
        },

        updateSaveIcon: function () {
            this.$addButtonIcon.toggleClass('icon-plus').toggleClass('icon-download');
        }
    });

    var ListView = Backbone.View.extend({
      tagName: 'ul',
      className: 'table-view',

      initialize: function () {
          this.listenTo(this.collection, 'add', this.addItemView);
          this.listenTo(this.collection, 'remove', this.removeItem);
          this._itemsView = {};
      },

      addItemView: function (model) {
          var itemView = new ItemView({model: model});
          this.$el.append(itemView.render().el);
          this._itemsView[model.id] = itemView;
      },

      removeItem: function (model) {
          this._itemsView[model.id].remove();
          this._itemsView[model.id] = null;
          delete this._itemsView[model.id];
      },

      render: function () {
          this.collection.map(this.addItemView);
          return this;
      }
    });

    var ItemView = Backbone.View.extend({
        template: _.template($('#itemtpl').html()),
        tagName: 'li',
        className: 'table-view-cell',

        events: {
            'click [data-action="delete"]': 'deleteItem',
            'click [data-action="edit"]': 'editItem'
        },

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
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
        },

        editItem: function (event) {
            event.preventDefault();
            formView.editItem(this.model);
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

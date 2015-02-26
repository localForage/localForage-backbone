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

        initialize: function () {
            // For the sake of the example, this is very bad
            // performance-wise :)
            this.listenTo(this.collection, 'add', this.addItemView);
            this.listenTo(this.collection, 'remove change', this.render);
        },

        addItemView: function (model) {
            var itemView = new ItemView({model: model});
            this.$list.append(itemView.render().el);
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
            this.$list = this.$('.list');
            this.$input = this.$('[name="content"]');
            return this;
        }
    });

    var ItemView = Backbone.View.extend({
        tagName: 'li',
        className: 'list--item',
        template: _.template($('#itemtpl').html()),

        render: function () {
            this.$el.html(this.template({
                content: this.model.get('content')
            }));
            return this;
        }
    });

    // Instancing the collection and the view
    var collection = new ListCollection();
    var formView = new FormView({
        el: $('<div>', {'class': 'content'}).appendTo(document.body),
        collection: collection
    });

    formView.render();
    collection.fetch();
}(this.Backbone, this.$, this._));

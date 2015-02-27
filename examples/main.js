(function(Backbone, $, _) {
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
            'submit form': 'submit',
            'click [data-action="add"]': 'addItem',
            'click [data-action="refresh"]': 'refresh',
            'click [data-action="clear"]': 'clear'
        },

        submit: function(event) {
            event.preventDefault();
            this.addItem(event);
        },

        addItem: function(event) {
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

        editItem: function(model) {
            this.$input.val(model.get('content'));
            this.$input.focus();
            this.updateSaveIcon();

            // keep reference to current model edited
            this.model = model;
        },

        render: function() {
            // Render the form template on this.$el and append the
            // collection content
            this.$el.html(this.template());

            // cache DOM list container
            this.$input = this.$('[name="content"]');
            this.$addButtonIcon = this.$('[data-action="add"] > .icon');
            return this;
        },

        refresh: function(event) {
            event.preventDefault();
            refreshCollection();
        },

        clear: function() {
            clearCollection();
        },

        updateSaveIcon: function() {
            this.$addButtonIcon.toggleClass('icon-plus').toggleClass('icon-download');
        }
    });

    var ListView = Backbone.View.extend({
      tagName: 'ul',
      className: 'table-view',

      initialize: function() {
          this.listenTo(this.collection, 'add', this.addItemView);
          this.listenTo(this.collection, 'remove', this.removeItem);
          this.listenTo(this.collection, 'reset', this.reset);
          this._itemsView = {};
      },

      addItemView: function(model) {
          var itemView = new ItemView({model: model});
          this.$el.append(itemView.render().el);
          this._itemsView[model.id] = itemView;
      },

      removeItem: function(model) {
          this._itemsView[model.id].remove();
          this._itemsView[model.id] = null;
          delete this._itemsView[model.id];
      },

      reset: function(model, options) {
          options.previousModels.map(this.removeItem, this);
      },

      render: function() {
          this.collection.map(this.addItemView, this);
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

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
            // build the model localeForage key only for debug purpose
            // at this point this key might not have been set if no sync
            // operation has been made
            this.model.sync._localeForageKeyFn(this.model);

            this.$el.html(this.template({
                content: this.model.get('content'),
                syncKey: this.model.sync.localforageKey
            }));
            return this;
        },

        deleteItem: function(event) {
            event.preventDefault();
            this.model.destroy();
        },

        editItem: function(event) {
            event.preventDefault();
            formView.editItem(this.model);
        }
    });

    var drivers = [
        'LOCALSTORAGE',
        'WEBSQL',
        'INDEXEDDB'
    ];

    var FooterView = Backbone.View.extend({
        template: _.template($('#footertpl').html()),

        events: {
            'click .tab-item': 'onTabItemChange'
        },

        render: function() {
            this.$el.html(this.template());
            this.showSupport();
            this.showActiveDriver();
        },

        showSupport: function() {
            drivers.map(_.bind(this.updateDriverIcon, this));
        },

        showActiveDriver: function() {
            drivers.map(_.bind(this.updateDriverTabItem, this));
        },

        updateDriverTabItem: function(driverName) {
            var method = localforage.driver() === localforage[driverName] ? $.fn.addClass : $.fn.removeClass;
            var $el = this.$('[data-item=' + driverName + ']');
            method.call($el, 'active');
        },

        updateDriverIcon: function(driverName) {
            var isSupported = localforage.supports(localforage[driverName]);
            var className = isSupported ? 'icon-check' : 'icon-close';
            this.$('[data-item=' + driverName + '] > .icon').addClass(className);
        },

        onTabItemChange: function(event) {
            event.preventDefault();
            var driverName = $(event.currentTarget).data('item');
            localforage.setDriver(localforage[driverName]).then(_.bind(function() {
                this.showActiveDriver();
                refreshCollection();
            }, this));
        }
    });

    // Instancing the collection and the view
    var collection = new ListCollection();

    var refreshCollection = function() {
        collection.reset(); // clear collection before
        collection.fetch();
    };

    var clearCollection = function() {
        collection.reset();
        localforage.clear();
    };

    var formView = new FormView({
        el: $('header'),
        collection: collection
    });

    var listView = new ListView({
        collection: collection
    });

    var footerView = new FooterView({
        el: $('footer')
    });

    footerView.render();

    formView.render();
    $('.content').append(listView.render().el);

    collection.fetch();
}(this.Backbone, this.$, this._));

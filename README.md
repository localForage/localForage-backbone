# localForage Backbone [![Build Status](https://secure.travis-ci.org/mozilla/localForage-backbone.png?branch=master)](http://travis-ci.org/mozilla/localForage-backbone)

Backbone.js driver for the
[localForage offline storage library](https://github.com/mozilla/localForage).

Install with bower:

    bower install localforage-backbone

Run tests with grunt:

    grunt test

Submit issues, pull requests, etc. if something is up! <3

## Usage

This library lets you override the `sync()` method on your collections and
models so they're saved to localForage instead of a REST server. Simply
override your objects' `sync()` method with the namespace for your model:

```javascript
    var MyModel = Backbone.Model.extend({
        sync: Backbone.localforage.sync('MyModel')
    });

    var MyCollection = Backbone.Collection.extend({
        model: MyModel,
        sync: Backbone.localforage.sync('MyCollection')
    });
```

Now whenever you save your collections or models, they'll be saved with
localForage!


## Warning

This library is only about overriding `Backbone.sync`, which means that calling `collection.remove(model)` won't update the offline storage.

The `Backbone.Collection.remove` function is only about removing a model from a collection, to clean up all references and event listeners, but does not involve a `sync` operation.

If you want to destroy a model, you should use this code instead:

```javascript
// retrieve a model by its id and destroy it
collection.get(id).destroy();

// or

// retrieve a model by its index in the collection and destroy it
collection.at(index).destroy();
```



# License

This program is free software; it is distributed under an
[Apache License](http://github.com/mozilla/localForage-backbone/blob/master/LICENSE).

---

Copyright (c) 2014 [Mozilla](https://mozilla.org)
([Contributors](https://github.com/mozilla/localForage-backbone/graphs/contributors)).

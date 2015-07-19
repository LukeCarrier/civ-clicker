(function($) {
    /**
     * Main game object, contains the loop.
     *
     * @constructor
     */
    var Game = function(save) {
        this.save = save;
    };

    /**
     * Number of milliseconds between ticks.
     *
     * @type {Number}
     */
    Game.TICK_INTERVAL = 200;

    /**
     * Gather the named resource.
     *
     * @param  {String} resource The internal name of the resource.
     * @return {Void}
     */
    Game.prototype.gatherResource = function(resource) {
        // TODO: consider randomising the amounts

        this.save.resources[resource]++;

        this.updateProperty("resource-" + resource, this.save.resources[resource]);
    };

    /**
     * Handle a click of an action button.
     *
     * @param  {DOMEvent} e The DOM event.
     * @return {Void}
     */
    Game.prototype.handleActionClick = function(e) {
        var $actionButton = $(e.currentTarget),
            action        = $actionButton.data("civclicker-action");

        switch (action) {
            case "gather":
                var resource = $actionButton.data("civclicker-resource");
                this.gatherResource(resource);
                break;

            default:
                console.log("don't know how to", action);
        }
    }

    /**
     * Schedule the next tick.
     *
     * @return {Void}
     */
    Game.prototype.scheduleTick = function() {
        // TODO: check time delta

        window.setTimeout($.proxy(this.tick, this));
    };

    /**
     * "Tick" -- trigger all in-game events.
     *
     * @return {Void}
     */
    Game.prototype.tick = function() {
        this.scheduleTick();
    };

    /**
     * Update a property value across the UI.
     *
     * @param  {String} property The internal name of the property.
     * @param  {String} value    The new value.
     * @return {Void}
     */
    Game.prototype.updateProperty = function(property, value) {
        $("[data-civclicker-property=" + property + "]").text(value);
    };

    /**
     * Update all properties.
     *
     * @return {Void}
     */
    Game.prototype.updateAllProperties = function() {
        $.each(this.save.resources, $.proxy(function(resource, count) {
            this.updateProperty("resource-" + resource, count);
        }, this));
    };

    /**
     * Saved game state.
     *
     * @constructor
     */
    var Save = function() {
        this.population = 0;
        this.sick       = 0;

        this.resources = {
            "food": 0,
            "stone": 0,
            "water": 0,
            "wood": 0
        };
    };

    /**
     * Automatic save frequency in milliseconds.
     *
     * @type {Number}
     */
    Save.AUTOSAVE_EVERY = 60000;

    /**
     * Cookie name.
     *
     * @type {String}
     */
    Save.COOKIE_NAME = "civclicker-save";

    /**
     * Import an existing save.
     *
     * @param  {String} string JSON string representing save file.
     * @return {Void}
     */
    Save.prototype.import = function(string) {
        var save = JSON.parse(string);

        this.population = save.population;
        this.sick       = save.sick;

        this.resources = {
            "food":  save.resources["food"],
            "stone": save.resources["stone"],
            "water": save.resources["water"],
            "wood":  save.resources["wood"]
        };
    };

    /**
     * Export the save.
     *
     * @return {String} JSON string representing save file.
     */
    Save.prototype.export = function() {
        return JSON.stringify(this);
    };

    /**
     * Load the game from a cookie.
     *
     * @return {Void}
     */
    Save.prototype.fromCookie = function() {
        this.import($.cookie(Save.COOKIE_NAME));
    };

    /**
     * Save the game to a cookie.
     *
     * @return {Void}
     */
    Save.prototype.toCookie = function() {
        $.cookie(Save.COOKIE_NAME, this.export());
    };

    $(function() {
        var save = new Save(),
            game = new Game(save);

        $("[data-toggle='tooltip']").tooltip();

        // Import the existing save, and set up automatic saves
        save.fromCookie();
        setTimeout($.proxy(save.toCookie, save), Save.AUTOSAVE_EVERY);

        $("[data-civclicker-action]").click($.proxy(game.handleActionClick, game));
        game.updateAllProperties();
        game.tick();
    });
})(jQuery);

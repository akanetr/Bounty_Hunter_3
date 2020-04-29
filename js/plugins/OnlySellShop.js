//=============================================================================
// OnlySellShop.js
//=============================================================================
/*:
 * @plugindesc レートを変更できる売却専門のショップを呼び出せます
 * 使い方はヘルプをご覧ください
 * @author mo-to
 *
 *
 * @help
 * イベントからプラグインコマンドで使用して呼び出します
 * 『 OnlySellShopCall n 』nには売却レートを整数で記述してください
 * 記述した値がそのまま％のレートとなります 
 * デフォルトの売却レートはエディタで設定した金額の50％です
 *
 * 例）プラグインコマンド:
 * OnlySellShopCall 50   # 売却レート50％(デフォと同じ)の売却専門ショップを呼び出す
 * OnlySellShopCall 25   # 売却レート25％の売却専門ショップを呼び出す
 * OnlySellShopCall 120  # 売却レート120％(買値よりお得＾＾)の売却専門ショップを呼び出す
 */
//============================================================================= 
 
(function() {
 
    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'OnlySellShopCall') {
            SceneManager.push(Scene_Sell_Shop);
            SceneManager.prepareNextScene(parseInt(args[0]));
        }
    };
    
    
    //-----------------------------------------------------------------------------
    // Window_Sell_ShopCommand
    //
    // The window for sell on the shop screen.

    function Window_Sell_ShopCommand() {
        this.initialize.apply(this, arguments);
    }

    Window_Sell_ShopCommand.prototype = Object.create(Window_HorzCommand.prototype);
    Window_Sell_ShopCommand.prototype.constructor = Window_Sell_ShopCommand;

    Window_Sell_ShopCommand.prototype.initialize = function(width, purchaseOnly) {
        this._windowWidth = width;
        this._purchaseOnly = purchaseOnly;
        Window_HorzCommand.prototype.initialize.call(this, 0, 0);
    };

//変更
    Window_Sell_ShopCommand.prototype.windowWidth = function() {
        return this._windowWidth-304;
    };

    Window_Sell_ShopCommand.prototype.maxCols = function() {
        return 2;
    };

    Window_Sell_ShopCommand.prototype.makeCommandList = function() {
        this.addCommand(TextManager.sell,   'sell');
        this.addCommand(TextManager.cancel, 'cancel');
    };

    //-----------------------------------------------------------------------------
    // Scene_Sell_Shop
    //
    // The scene class of the Sell_shop screen.

    function Scene_Sell_Shop() {
        this.initialize.apply(this, arguments);
    }

    Scene_Sell_Shop.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Sell_Shop.prototype.constructor = Scene_Sell_Shop;

    Scene_Sell_Shop.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_Sell_Shop.prototype.prepare = function(sellrate) {
        this._sellrate = sellrate;
        this._item = null;
    };

    Scene_Sell_Shop.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createGoldWindow();
        this.createCommandWindow();
        this.createDummyWindow();
        this.createNumberWindow();
        this.createStatusWindow();
        this.createCategoryWindow();
        this.createSellWindow();
    };

//変更
    Scene_Sell_Shop.prototype.createGoldWindow = function() {
        this._goldWindow = new Window_Gold(0, this._helpWindow.height);
        this._goldWindow.x = (Graphics.boxWidth - this._goldWindow.width)-304;
        this.addWindow(this._goldWindow);
    };

    Scene_Sell_Shop.prototype.createCommandWindow = function() {
        this._commandWindow = new Window_Sell_ShopCommand(this._goldWindow.x, this._purchaseOnly);
        this._commandWindow.y = this._helpWindow.height;
        this._commandWindow.setHandler('sell',   this.commandSell.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._commandWindow);
    };

//変更
    Scene_Sell_Shop.prototype.createDummyWindow = function() {
        var wy = this._commandWindow.y + this._commandWindow.height;
        var wh = Graphics.boxHeight - wy;
        this._dummyWindow = new Window_Base(0, wy, Graphics.boxWidth-304, wh);
        this.addWindow(this._dummyWindow);
    };

    Scene_Sell_Shop.prototype.createNumberWindow = function() {
        var wy = this._dummyWindow.y;
        var wh = this._dummyWindow.height;
        this._numberWindow = new Window_ShopNumber(0, wy, wh);
        this._numberWindow.hide();
        this._numberWindow.setHandler('ok',     this.onNumberOk.bind(this));
        this._numberWindow.setHandler('cancel', this.onNumberCancel.bind(this));
        this.addWindow(this._numberWindow);
    };

    Scene_Sell_Shop.prototype.createStatusWindow = function() {
        var wx = this._numberWindow.width;
        var wy = this._dummyWindow.y;
        var ww = Graphics.boxWidth - wx;
        var wh = this._dummyWindow.height;
        this._statusWindow = new Window_ShopStatus(wx, wy, ww, wh);
        this._statusWindow.hide();
        this.addWindow(this._statusWindow);
    };

    Scene_Sell_Shop.prototype.createCategoryWindow = function() {
        this._categoryWindow = new Window_ItemCategory();
        this._categoryWindow.setHelpWindow(this._helpWindow);
        this._categoryWindow.y = this._dummyWindow.y;
        this._categoryWindow.hide();
        this._categoryWindow.deactivate();
        this._categoryWindow.setHandler('ok',     this.onCategoryOk.bind(this));
        this._categoryWindow.setHandler('cancel', this.onCategoryCancel.bind(this));
        this.addWindow(this._categoryWindow);
    };

    Scene_Sell_Shop.prototype.createSellWindow = function() {
        var wy = this._categoryWindow.y + this._categoryWindow.height;
        var wh = Graphics.boxHeight - wy;
        this._sellWindow = new Window_ShopSell(0, wy, Graphics.boxWidth, wh);
        this._sellWindow.setHelpWindow(this._helpWindow);
        this._sellWindow.hide();
        this._sellWindow.setHandler('ok',     this.onSellOk.bind(this));
        this._sellWindow.setHandler('cancel', this.onSellCancel.bind(this));
        this._categoryWindow.setItemWindow(this._sellWindow);
        this.addWindow(this._sellWindow);
    };

    Scene_Sell_Shop.prototype.activateSellWindow = function() {
        this._categoryWindow.show();
        this._sellWindow.refresh();
        this._sellWindow.show();
        this._sellWindow.activate();
        this._statusWindow.hide();
    };

    Scene_Sell_Shop.prototype.commandSell = function() {
        this._dummyWindow.hide();
        this._categoryWindow.show();
        this._categoryWindow.activate();
        this._sellWindow.show();
        this._sellWindow.deselect();
        this._sellWindow.refresh();
    };

    Scene_Sell_Shop.prototype.onCategoryOk = function() {
        this.activateSellWindow();
        this._sellWindow.select(0);
    };

    Scene_Sell_Shop.prototype.onCategoryCancel = function() {
        this._commandWindow.activate();
        this._dummyWindow.show();
        this._categoryWindow.hide();
        this._sellWindow.hide();
    };

    Scene_Sell_Shop.prototype.onSellOk = function() {
        this._item = this._sellWindow.item();
        this._categoryWindow.hide();
        this._sellWindow.hide();
        this._numberWindow.setup(this._item, this.maxSell(), this.sellingPrice());
        this._numberWindow.setCurrencyUnit(this.currencyUnit());
        this._numberWindow.show();
        this._numberWindow.activate();
        this._statusWindow.setItem(this._item);
        this._statusWindow.show();
    };

    Scene_Sell_Shop.prototype.onSellCancel = function() {
        this._sellWindow.deselect();
        this._categoryWindow.activate();
        this._statusWindow.setItem(null);
        this._helpWindow.clear();
    };

    Scene_Sell_Shop.prototype.onNumberOk = function() {
        SoundManager.playShop();
        if (this._commandWindow.currentSymbol() === 'sell') {
            this.doSell(this._numberWindow.number());
        }
        this.endNumberInput();
        this._goldWindow.refresh();
        this._statusWindow.refresh();
    };

    Scene_Sell_Shop.prototype.onNumberCancel = function() {
        SoundManager.playCancel();
        this.endNumberInput();
    };

    Scene_Sell_Shop.prototype.doSell = function(number) {
        $gameParty.gainGold(number * this.sellingPrice());
        $gameParty.loseItem(this._item, number);
    };

    Scene_Sell_Shop.prototype.endNumberInput = function() {
        this._numberWindow.hide();
        if (this._commandWindow.currentSymbol() === 'sell') {
            this.activateSellWindow();
        }
    };

    Scene_Sell_Shop.prototype.maxSell = function() {
        return $gameParty.numItems(this._item);
    };

    Scene_Sell_Shop.prototype.money = function() {
        return this._goldWindow.value();
    };

    Scene_Sell_Shop.prototype.currencyUnit = function() {
        return this._goldWindow.currencyUnit();
    };

    Scene_Sell_Shop.prototype.sellingPrice = function() {
        return Math.floor(this._item.price * this._sellrate / 100);
    };
       
})();    
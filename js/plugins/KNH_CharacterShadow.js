//=============================================================================
// KNH_CharacterShadow.js
//=============================================================================

/*:
 * @plugindesc キャラクターに影をつけるプラグイン
 * @author こんにちは
 *
 * @version 1.0.0 2017/10/28 公開
 * 1.0.1 2017/10/29 パーティが0人の時などにエラーが発生する不具合を修正
 *
 * @param 影画像
 * @desc 影画像を指定。img/systemに保存する。
 * @default 
 * @type file
 * @require 1
 * @dir img/system
 *
 * @help キャラクターの下に影をつけます。
 * 影画像が必要です。img/system に保存し、プラグインパラメータで指定してください。
 *
 * ●プレイヤーや隊列メンバーに影を設定する方法
 *
 * データベース → アクター の「メモ」に下のいずれかを記入します。
 * 【】内を記入してください。「\v[1]」等使用できます。
 *
 * 【<KNHShadow>】            アクターに影を表示する
 * 【<KNHShadow:5,-10,150>】  影のX座標を 5 、Y座標を -10 ずらし
 *                            大きさを 1.5 倍にして表示する
 * 
 * ●イベントに影を設定する方法
 *
 * イベントの「メモ」、またはイベントコマンド「注釈」内に上記と同じ方法で
 * 記入します。メモ欄の場合は全てのページで、注釈の場合は
 * そのイベントページでのみ適用されます。
 *
 * ※注意
 * キャラクターが透明化 ON の場合表示されません。
 * キャラクターの不透明度を変更した場合、影も同じ不透明度となります。
 * キャラクター画像をなしに設定しても、影だけ表示することができます。
 *
 * ●影の表示切り替えや位置・大きさの変更
 *
 * 変更したいイベント(またはプレイヤー)の「移動ルートの設定」内の「スクリプト」に
 * 記入します。【】内を記入してください。
 *
 * 【this.setShadow(true)】           影を表示する
 * 【this.setShadow(false)】          影を表示しない
 * 【this.setShadowPosition(-5, 8)】  影の表示位置のX座標を -5、Y座標を 8 ずらす
 * 【this.setShadowPosition(0, 0)】   影の表示位置のずれを無くす
 * 【this.setShadowScale(80)】        影の大きさを 0.8 倍にする
 * 【this.setShadowScale(100)】       影の大きさを通常に戻す
 *
 * ●プラグインコマンド    なし
 *
 * ●利用規約
 *   特に無いです。
 */

(function() {
    'use strict';
    var pluginName = 'KNH_CharacterShadow';
    
    var getNumber = function(text, max, min) {
        text = applyCharacters(text);
        if (isNaN(text)) return NaN;
        return Math.max(Math.min(Number(text), max || Infinity), min || -Infinity);
    };
    
    var getArrayString = function(text) {
        var values = applyCharacters(text).split(',');
        for (var i = 0; i < values.length; i++) {
            values[i] = values[i].trim();
            if (!isNaN(values[i])) values[i] = Number(values[i]);
        }
        return values;
    };
    
    var applyCharacters = function(text) {
        if (text === null) text = '';
        text = '' + text;
        text = text.replace(/\\/g, '\x1b');
        text = text.replace(/\x1b\x1b/g, '\\');
        text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
            return $gameVariables.value(parseInt(arguments[1], 10));
        }.bind(this));
        text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
            return $gameVariables.value(parseInt(arguments[1], 10));
        }.bind(this));
        text = text.replace(/\x1bN\[(\d+)\]/gi, function() {
            var actor = parseInt(arguments[1], 10) >= 1 ? $gameActors.actor(parseInt(arguments[1], 10)) : null;
            return actor ? actor.name() : '';
        }.bind(this));
        text = text.replace(/\x1bP\[(\d+)\]/gi, function() {
            var actor = parseInt(arguments[1], 10) >= 1 ? $gameParty.members()[parseInt(arguments[1], 10) - 1] : null;
            return actor ? actor.name() : '';
        }.bind(this));
        if ($dataSystem) text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
        return text;
    };
    
    var getMeta = function(text, str) {
        var re = /<([^<>:]+)(:?)([^>]*)>/g;
        var meta = {};
        for (;;) {
            var match = re.exec(text);
            if (match) {
                if (match[2] === ':') {
                    meta[match[1]] = match[3];
                } else {
                    meta[match[1]] = true;
                }
            } else {
                break;
            }
        }
        return meta['' + str];
    }
    
     var getShadowInfo = function(text) {
        if (text.contains('<KNHShadow>')) {
            return [true];
        } else if (getMeta(text, 'KNHShadow')) {
            return [true].concat(getArrayString(getMeta(text, 'KNHShadow')));
        } else {
            return false;
        }
    };
    
    //-----------------------------------------------------------------------------
    // プラグインパラメータの取得
    //-----------------------------------------------------------------------------
    
    var KNH_shadowImage = PluginManager.parameters(pluginName)['影画像'];
    
    //-----------------------------------------------------------------------------
    //  Game_CharacterBase
    //-----------------------------------------------------------------------------
    
    var _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
    Game_CharacterBase.prototype.initMembers = function() {
        _Game_CharacterBase_initMembers.apply(this, arguments);
        this._shadow = false;
        this._shadowAddX = 0;
        this._shadowAddY = 0;
        this._shadowScale = 100;
    };
    
    Game_CharacterBase.prototype.setShadow = function(shadow) {
        this._shadow = !!shadow;
    };
    
    Game_CharacterBase.prototype.setShadowPosition = function(addX, addY) {
        this._shadowAddX = addX || 0;
        this._shadowAddY = addY || 0;
    };
    
    Game_CharacterBase.prototype.setShadowScale = function(scale) {
        this._shadowScale = scale || 100;
    };
    
    Game_CharacterBase.prototype.setShadowInfo = function(info) {
        if (!info) info = [false];
        this.setShadow(!!info[0] || false);
        this.setShadowPosition(info[1] || 0, info[2] || 0);
        this.setShadowScale(info[3] || 100);
    };

    //-----------------------------------------------------------------------------
    // Game_Event
    //-----------------------------------------------------------------------------

    var _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
    Game_Event.prototype.setupPageSettings = function() {
        _Game_Event_setupPageSettings.call(this);
        this.setupShadow();
    };

    Game_Event.prototype.setupShadow = function() {
        var info = [false], page = this.page(), shadow = false;
        if (page) {
            for (var i = 0; i < page.list.length; i++) {
                if (page.list[i].code == 108 && getShadowInfo(page.list[i].parameters[0])) {
                    info = getShadowInfo(page.list[i].parameters[0]);
                    shadow = true;
                }
            }
        }
        if (!shadow) info = getShadowInfo(this.event().note);
        this.setShadowInfo(info);
    };
    
    //-----------------------------------------------------------------------------
    // Game_Player
    //-----------------------------------------------------------------------------
    
    var _Game_Player_refresh = Game_Player.prototype.refresh;
    Game_Player.prototype.refresh = function() {
        _Game_Player_refresh.apply(this, arguments);
        if ($gameParty.leader()) this.setShadowInfo(getShadowInfo($gameParty.leader().actor().note));
    };
    
    //-----------------------------------------------------------------------------
    // Game_Follower
    //-----------------------------------------------------------------------------
    
    var _Game_Follower_refresh = Game_Follower.prototype.refresh;
    Game_Follower.prototype.refresh = function() {
        _Game_Follower_refresh.apply(this, arguments);
        if (this.actor()) this.setShadowInfo(getShadowInfo(this.actor().actor().note));
    };
    
    //-----------------------------------------------------------------------------
    // Sprite_Character
    //-----------------------------------------------------------------------------
    
    var _Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        _Sprite_Character_update.call(this);
        this.updateShadow();
    };
    
    Sprite_Character.prototype.updateShadow = function() {
        if (this._character._shadow) {
            if (!this._shadowSprite) {
                this._shadowSprite = new Sprite_CharacterShadow(this._character);
                this.parent.addChild(this._shadowSprite);
            }
        } else if (this._shadowSprite) {
            this.parent.removeChild(this._shadowSprite);
            this._shadowSprite = null;
        }
    };

    //-----------------------------------------------------------------------------
    // Sprite_CharacterShadow
    //-----------------------------------------------------------------------------
    
    function Sprite_CharacterShadow() {
        this.initialize.apply(this, arguments);
    }

    Sprite_CharacterShadow.prototype = Object.create(Sprite_Base.prototype);
    Sprite_CharacterShadow.prototype.constructor = Sprite_CharacterShadow;

    Sprite_CharacterShadow.prototype.initialize = function(character) {
        Sprite_Base.prototype.initialize.call(this);
        this._character = character;
        this.bitmap = ImageManager.loadSystem(KNH_shadowImage);
        this.anchor.x = this.anchor.y = 0.5;
    };
    
    Sprite_CharacterShadow.prototype.update = function() {
        var ch = this._character;
        this.x = ch.screenX() + ch._shadowAddX;
        this.y = ch.screenY() + ch.jumpHeight() - 2 + ch._shadowAddY;
        this.z = ch.screenZ() - 1;
        this.scale.x = this.scale.y = ch._shadowScale / 100;
        this.opacity = (ch._transparent || ch._opacity === 0) ? 0 : ch._opacity;
    };
    
})();
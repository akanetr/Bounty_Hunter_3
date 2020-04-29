//===========================================================================
// MpiSwitchWeatherLayer.js
//===========================================================================

/*:
 * @plugindesc 天候をピクチャより前に表示するプラグインコマンドを提供します。
 * @author 奏ねこま（おとぶき ねこま）
 *
 * @help
 * [ プラグインコマンド ] ...
 *  switch_weather_layer 0  : 天候をピクチャより後ろに表示します。
 *  switch_weather_layer 1  : 天候をピクチャより前に表示します。
 *
 * [ 利用規約 ] ................................................................
 *  ・本プラグインの利用は、RPGツクールMV/RPGMakerMVの正規ユーザーに限られます。
 *  ・商用、非商用、有償、無償、一般向け、成人向けを問わず、利用可能です。
 *  ・利用の際、連絡や報告は必要ありません。また、製作者名の記載等も不要です。
 *  ・プラグインを導入した作品に同梱する形以外での再配布、転載はご遠慮ください。
 *  ・不具合対応以外のサポートやリクエストは、基本的に受け付けておりません。
 *  ・本プラグインにより生じたいかなる問題についても、一切の責任を負いかねます。
 * [ 改訂履歴 ] ................................................................
 *   Version 1.00  2017/02/19  First edition.
 * -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
 *  Web Site: http://makonet.sakura.ne.jp/rpg_tkool/
 *  Twitter : https://twitter.com/koma_neko
 *  Copylight (c) 2017 Nekoma Otobuki
 */

var Imported = Imported || {};
Imported.MpiSwitchWeatherLayer = true;

var Makonet = Makonet || {};
Makonet.SWL = {};

(function(){
    'use strict';

    var MPD        = Makonet.SWL;
    MPD.product    = 'MpiSwitchWeatherLayer';
    MPD.parameters = PluginManager.parameters(MPD.product);
    MPD.modules    = {};
    
    var _ = MPD.product;
    
    //==============================================================================
    // Game_System
    //==============================================================================

    Object.defineProperty(Game_System.prototype, _, {
        get: function(){ return this[`$${_}`] = this[`$${_}`] || { on_picture: false } },
        set: function(value){   this[`$${_}`] = value },
        configurable: true
    });

    //==============================================================================
    // Game_Interpreter
    //==============================================================================

    (function(o,p) {
        var f=o[p];o[p]=function(command,args){
            f.apply(this,arguments);
            if (command.toLowerCase() === 'switch_weather_layer') {
                $gameSystem[_].on_picture = (+args[0] === 1);
                var spriteset = SceneManager._scene._spriteset;
                if ($gameSystem[_].on_picture) {
                    spriteset.setChildIndex(spriteset._weather, spriteset.getChildIndex(spriteset._pictureContainer) + 1);
                } else {
                    spriteset.setChildIndex(spriteset._weather, spriteset.getChildIndex(spriteset._baseSprite) + 1);
                }
            }
        };
    }(Game_Interpreter.prototype,'pluginCommand'));

    //==============================================================================
    // Spriteset_Map
    //==============================================================================

    (function(o,p) {
        var f=o[p];o[p]=function(){
            f.apply(this,arguments);
            if ($gameSystem[_].on_picture) {
                this.setChildIndex(this._weather, this.getChildIndex(this._pictureContainer) + 1);
            } else {
                this.setChildIndex(this._weather, this.getChildIndex(this._baseSprite) + 1);
            }
        };
    }(Spriteset_Map.prototype,'initialize'));
}());

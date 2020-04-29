//===================================================================
//ItemNumberSign.js
//アイテムの個数の前後に付く記号を変えるプラグイン
//===================================================================
//Copyright (c) 2017 蔦森くいな
//Released under the MIT license.
//http://opensource.org/licenses/mit-license.php
//-------------------------------------------------------------------
//blog   : http://paradre.com/
//Twitter: https://twitter.com/Kuina_T
//===================================================================
//＜更新情報＞
//　ver1.0.0 2017/07/09 初版
//===================================================================

/*:
 * @plugindesc アイテムの個数の前後に付く記号を変更します。
 * @author 蔦森くいな
 *
 * @help プラグイン管理画面からパラメータ「BeforeSign」に
 * 「:」や「×」「所持数」など自由に文字列を設定して下さい。
 * その文字列がアイテムの個数の前に付きます。
 * 
 * また、プラグイン管理画面からパラメータ「AfterSign」に
 * 設定した文字列はアイテムの個数の後に付きます。
 * 
 * アイテム名の表示幅は自動的に調整されますので、
 * ２文字以上の文字列を設定する事もできます。
 * 
 * 
 * 
 * @param BeforeSign
 * @desc ここに入力した文字列がアイテムの個数の前に付きます
 * @default :
 * 
 * @param AfterSign
 * @desc ここに入力した文字列がアイテムの個数の後に付きます
 * 
 *
 * 利用規約：
 * このプラグインは商用・非商用を問わず無料でご利用いただけます。
 * どのようなゲームに使っても、どのように加工していただいても構いません。
 * MIT Licenseにつき著作権表示とライセンスURLは残しておいて下さい。
 */

(function() {
    'use strict';
    
    var pd_INS_beforeSign = PluginManager.parameters("ItemNumberSign")["BeforeSign"];
    var pd_INS_afterSign = PluginManager.parameters("ItemNumberSign")["AfterSign"];
    
    
    Window_ItemList.prototype.numberWidth = function() {
        
        return this.textWidth(pd_INS_beforeSign) + this.textWidth('00') + this.textWidth(pd_INS_afterSign);
        
    };
    
    Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
        if (this.needsNumber()) {
            this.drawText(pd_INS_beforeSign, x, y, width - this.textWidth('00') - this.textWidth(pd_INS_afterSign), 'right');
            this.drawText($gameParty.numItems(item) + pd_INS_afterSign, x, y, width, 'right');
        }
    };
    
})();
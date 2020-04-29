/*---------------------------------------------------------------------------*
 * 2017/07/14 kido0617
 * https://kido.space/
 *---------------------------------------------------------------------------*/

/*:ja
 * @plugindesc Windowマネージャープラグイン
 * @author kido0617
 * @help
 *   ウィンドウを出すプラグインです
 *   使用方法: 
 *    WindowManager.show(0, 10, 10,180, 80);  //show(ウィンドウ番号, x, y, 幅, 高さ)
 *    
 *    文字出すとき: WindowManager.drawText(0, "あいうえお");  //drawText(ウィンドウ番号, 表示する文字
 *    画像出すとき: WindowManager.drawPicture(0, "cat");    //drawPicture(ウィンドウ番号, ピクチャ名)
 *    消すとき   : WindowManager.hide(0);                  //hide(ウィンドウ番号)
 *    全部消すとき: WindowManager.hideAll();
 */

(function(){
  window.WindowManager = {};
  WindowManager.windows = [];

  WindowManager.show = function(n, x, y, width, height){
    var w = new Window_Base(x, y, width, height);
    w.openness = 0;
    w.open();
    if(this.windows[n])this.hide(n);
    this.windows[n] = w;
    SceneManager._scene.addWindow(w);
  };
  WindowManager.drawText = function(n, text){
    if(!this.windows[n])return;
    this.windows[n].contents.clear();
    this.windows[n].drawTextAutoWrap(text, 0, 0, this.windows[n].contentsWidth());
  };
  WindowManager.drawPicture = function(n, pic){
    if(!this.windows[n])return;
    var bmp = ImageManager.loadPicture(pic);
    this.windows[n].contents.clear();
    bmp.addLoadListener(function(){
      this.windows[n].contents.blt(bmp, 0, 0, bmp.width, bmp.height, 0, 0);
    }.bind(this));
  }
  WindowManager.hide = function(n){
    if(!this.windows[n]) return;
    this.windows[n].close();
    this.windows[n] = null;
  };
  WindowManager.hideAll = function(){
    for(var i = 0; i < this.windows.length; i++){
      this.hide(i);
    }
  };
  WindowManager.destroy = function(){
    this.windows = [];
  };

  var _terminate = Scene_Base.prototype.terminate;
  Scene_Base.prototype.terminate = function(){
    _terminate.call(this);
    WindowManager.destroy();
  };


  Window_Base.prototype.drawTextAutoWrap = function(text, x, y, width){
    var textState = { index: 0, x: x, y: y, left: x };
    textState.text = this.convertEscapeCharacters(text);
    textState.height = this.calcTextHeight(textState, false);
    this.resetFontSettings();
    while (textState.index < textState.text.length) {
      this.processCharacter(textState);
      if(textState.x + this.calcCharacterWidth(textState.text[textState.index]) >= width){
        textState.text = textState.text.slice(0, textState.index) + '\n' + 
          textState.text.slice(textState.index, textState.text.length);
      }
    }
  };

  Window_Base.prototype.calcCharacterWidth = function(c){
    switch (c) {
    case '\n':
        return 0;
    case '\f':
        return 0;
    case '\x1b':
        return 0;
    default:
        return this.textWidth(c);
    }
  };
  

})();
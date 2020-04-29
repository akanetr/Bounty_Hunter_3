//=============================================================================
// マップイベントの呼び出し/Call Map Event
// PT_CallMapEvent.js
//=============================================================================
// Copyright (c) 2016 Pantheon
// http://parthenontemple.tumblr.com/
//=============================================================================

//=============================================================================
/*:
 * @plugindesc v1.01 マップ内にある指定のイベントを呼び出します。
 * @author Pantheon
 *
 * @help プラグインコマンド:
 *   CallMapEvent [eventId] [pageIndex]	# 指定のマップイベントを呼び出す
 *   CallMapEvent 2 1			# e.g.[1] イベントID２番の１ページ目を呼び出す
 *   CallMapEvent this 1			# e.g.[2] このイベントの１ページ目を呼び出す
 *   CallMapEvent 2 current		# e.g.[3] イベントID２番の現在のページを呼び出す
 *   CallMapEvent \v[1] \v[2]		# e.g.[4] イベントID【変数１】番の【変数２】ページ目を呼び出す
 *
 * 更新履歴:
 *   v1.01 2017/01/25	ヘルプが読めない不具合を修正
 *   v1.00 2016/04/11	公開
 *   		ソースを整理
 *   v0.20 2016/04/09	this/currentや変数によるイベントの呼び出し機能を追加
 *   v0.10 2016/04/08	作成
 */
//=============================================================================


var Imported = Imported || {};
var	Parthenon = Parthenon || {};

Imported.PT_CallMapEvent = true;
Parthenon.CallMapEvent = Parthenon.CallMapEvent || {};


//=============================================================================
// Game_Event.
//=============================================================================

//-----------------------------------------------------------------------------
// イベントページの取得/Get Event Page.
//-----------------------------------------------------------------------------
Parthenon.CallMapEvent.Game_Event_page = Game_Event.prototype.page;
Game_Event.prototype.page = function( i_pageIndex )
{
	if( i_pageIndex == null )
		return Parthenon.CallMapEvent.Game_Event_page.call( this );

	return this.event().pages[i_pageIndex];
};


//=============================================================================
// Game_Interpreter.
//=============================================================================

//-----------------------------------------------------------------------------
// New: マップイベントの呼び出し/Call Map Event.
//-----------------------------------------------------------------------------
Game_Interpreter.prototype.callMapEvent = function( i_eventId, i_pageIndex )
{
	var functionName = 'callMapEvent';

	var checkUseVar = /\\v\[(\d+)\]/i;
	var getVar = function() { return $gameVariables.value( parseInt( arguments[1] ) ); };

	var eventId = i_eventId;

	if( ( eventId !== 'this' ) && ( eventId !== 'このイベント' ) )
	{
		eventId = i_eventId.replace( checkUseVar, getVar.bind( this ) );

		if( eventId <= 0 )
			throw new Error(( 'eventId is invalid:' + eventId + '<br>Plugin:' + functionName ) );
	}

	var pageIndex = i_pageIndex;

	if( ( pageIndex !== 'current' ) && ( pageIndex !== '現在のページ' ) )
	{
		pageIndex = pageIndex.replace( checkUseVar, getVar.bind( this ) ) - 1;

		if( pageIndex < 0 )
			throw new Error( ( 'pageIndex is invalid:' + ( pageIndex + 1 ) + '<br>Plugin:' + functionName ) );
	}

	var event = $gameMap.event( ( ( ( eventId === 'this' ) || ( eventId === 'このイベント' ) ) ? this._eventId : eventId ) );

	if( event == null )
		throw new Error( ( 'Event not found<br>eventId:' + eventId + '<br>Plugin:' + functionName ) );

	var page = ( ( pageIndex === 'current' ) || ( pageIndex === '現在のページ' ) ) ? event.page() : event.page( pageIndex );

	if( page == null )
	{
		throw new Error(
			(
				'Event page not found<br>eventId:'
				+ eventId
				+ '<br>pageIndex:'
				+ ( pageIndex + 1 )
				+ '<br>Plugin:'
				+ functionName
			)
		);
	}

	this.setupChild( page.list, ( this.isOnCurrentMap() ? eventId : 0 ) );

	return true;
};

//-----------------------------------------------------------------------------
// プラグインコマンド/Plugin Command.
//-----------------------------------------------------------------------------
Parthenon.CallMapEvent.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function( command, args )
{
	Parthenon.CallMapEvent.Game_Interpreter_pluginCommand.call( this, command, args );

	if( ( command === 'CallMapEvent' ) || ( command === 'マップイベントの呼び出し' ) )
	{
		this.callMapEvent( args[0], args[1] );
	}
};


//=============================================================================
// End of File.
//=============================================================================

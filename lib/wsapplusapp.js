/**********************************************************
2018.3.7 haozhou 标识：App_0001
	1. 新增QuitApp退出App接口。
**********************************************************/

var util = require("util");
var wait = require('wait.for');
var fs = require('fs');
var select = require('xpath.js');
var DOMParser = require('xmldom').DOMParser;

//APP控制
function wsapplusapp(){
		
	//add by haozhou begin
	//加载配置文件
	var varContent = fs.readFileSync(getFilePath('EAI/cfg/AppStore.xml'), 'utf-8');
	var xmlDoc = new DOMParser({locator:null,checkLater:true}).parseFromString(varContent);
	varContent = undefined;
	//add by haozhou end
	
	var m_quitReqId = undefined;	//App_0001
	var m_thisObj = this;
		
	//异步执行APP
	function onRecvStateMsg(varData){
		//setTimeout(function(){
			//console.log('wsapplusapp onRecvStateMsg varData: ' + JSON.stringify(varData));
			if(varData.message == 'AsyncExeAppComplete'){
				m_thisObj.fireCtrlEvent('AsyncExeAppComplete', varData.data.appId, varData.data.appInterface, varData.data.appReqid, varData.data.appReturnCode, varData.data.appResult);
			}	
			else if(varData.message == 'QuitAppComplete'){		//add by App_0001 begin
				if(varData.data.quitReqid == m_quitReqId){
					//console.log('[' + m_thisObj._workingID + ']wsapplusapp : EndEvent serviceId:' + msgData.data.serviceId + ',servcieName:' + msgData.data.serviceName + ',servcieEventName:' + msgData.data.serviceEventId + ',quitReqid:' + msgData.data.quitReqid + ',data:***');
					m_thisObj.fireCtrlEvent('QuitAppComplete', varData.data.appId, varData.data.appInterface, varData.data.appReqid, varData.data.appReturnCode, varData.data.appResult);
				}
			}		//add by App_0001 end
		//}.bind(this), 0);
		
	};
	process.on('message', onRecvStateMsg);
	
	this.ExcuteAppAsync = function(varAppId, varInterfaceName, varParam){
		
		var reqId = global.WsapPlatform.GenReqId();
		var runAppAsync = {
			'stateId':stateId,
			'message':'runAppAsync',
			'data':{
				'appReqid':reqId,
				'appId':varAppId,
				'appInterface':varInterfaceName,
				'appParam':varParam
			}
		};
		console.log('wsapplusapp : ExcuteAppAsync runAppAsync:' + JSON.stringify(runAppAsync));
		
		//setTimeout(function(){
			process.emit('message', runAppAsync);
		//}, 0);
		return reqId;
	};

	//获取App脚本
	this.GetAppAction = function(lIndex){
	};

	//获取App的数目
	this.GetAppCount = function(){
		var pTransNodeList = select(xmlDoc, '/appstore/apps/app');
		return pTransNodeList.length;
	};

	//获取App的路径
	this.GetAppDir = function(lIndex){
		var pTransNodeList = select(xmlDoc, '/appstore/apps/app');
		if(lIndex > pTransNodeList.length - 1)
			return undefined;
		var pNode = pTransNodeList[lIndex];
		return pNode.getAttribute('dir');
	};

	//获取App的ID
	this.GetAppId = function(lIndex){
		var pTransNodeList = select(xmlDoc, '/appstore/apps/app');
		if(lIndex > pTransNodeList.length - 1)
			return undefined;
		var pNode = pTransNodeList[lIndex];
		return pNode.getAttribute('id');
	};

	//获取App的信息
	this.GetAppInfo = function(varAppId, varName){
		 
	};

	//获取App的状态迁移文件
	this.GetAppStateChart = function(lIndex){
	};

	//新建App
	this.InstallApp = function(varAppId, varAppDir, varAppAction, varStateChart, varCommAction){
	};

	//删除指定App
	this.RemoveApp = function(varAppId){
	};

	//以指定出口退出指定App
	this.QuitApp = function(varAppName, varExitName){
		//add by App_0001 begin
		console.debug('QuitApp varAppName = ' + varAppName + ', varExitName = ' + varExitName);
		varAppName = varAppName.trimLeft();
		varAppName = varAppName.trimRight();
		if(varAppName == ""){
			console.error('wsapplusapp QuitApp Param:[varAppName] is Empty');
			return false;
		}
		
	/*	if(!m_serviceInfoMap.has(varServiceId)){
			console.log('[' + m_thisObj._workingID + ']not Find app:' + varAppName);
			return -1;		//未找到返回-1
		}
	*/			
		varExitName = varExitName.trimLeft();
		varExitName = varExitName.trimRight();
		if(varExitName == ""){
			console.error('wsapplusapp QuitApp Param:[ExitName] is Empty');
			return false;
		}
		
		var reqId = global.WsapPlatform.GenReqId();
		var objQuitApp = {
			'stateId':stateId,
			'message':'QuitApp',
			'data':{
				'quitReqid':reqId,
				'appId':varAppName,
				'appInterface':undefined,
				'exitname':varExitName
			}
		};
		
		m_quitReqId = reqId;
		
		console.debug('objQuitApp = ' + objQuitApp.toString());
		setTimeout(function(){
			if(process.send){
				process.send(objQuitApp);
			}
			else{
				process.emit('message', objQuitApp);
			}
		}, 0);
		//add by App_0001 end
	};
	
	this.fireCtrlEvent = function(){
		if(global.eventManager){
			global.eventManager.addEventByInst(m_thisObj, arguments[0], Array.prototype.slice.call(arguments, 1));
		}	
	}
	
	this.on = function(){
		if(global.eventManager){
			global.eventManager.addListener(m_thisObj, arguments[0], arguments[1]);
		}
	}
	
	this.cleanUp = function(){
		process.removeListener('message', onRecvStateMsg);
		m_thisObj = undefined;
		xmlDoc = undefined;
	}
};

wsapplusapp.prototype.proxy = function(proxyMethods, proxyAttributes){
	proxyMethods.push('ExcuteAppAsync');
	proxyMethods.push('GetAppAction');
	proxyMethods.push('GetAppCount');
	proxyMethods.push('GetAppDir');
	proxyMethods.push('GetAppId');
	proxyMethods.push('GetAppInfo');
	proxyMethods.push('GetAppStateChart');
	proxyMethods.push('InstallApp');
	proxyMethods.push('RemoveApp');
	proxyMethods.push('QuitApp');
	proxyMethods.push('cleanUp');
	
	return true;
}


wsapplusapp.prototype.proxyevent = function(proxObj) {
	proxObj.push('AsyncExeAppComplete');

	return true;
};
/*
function fiberEmit(obj, args){
	obj.emit.apply(obj, args);
}

wsapplusapp.prototype.fireCtrlEvent = function(){
	wait.launchFiber(fiberEmit, this, arguments);
}
*/
module.exports = wsapplusapp;
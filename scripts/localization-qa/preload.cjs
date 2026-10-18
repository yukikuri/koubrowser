const {contextBridge}=require('electron');
const language=process.argv.find(a=>a.startsWith('--qa-language='))?.split('=')[1]||'ja';
const state={questSchemaPendingMeta:null,questSchemaMeta:null,questSchemaError:null,questSchemaCheckStatus:'idle',questSchemaLastCheckedAt:null};
contextBridge.exposeInMainWorld('optionApi',{
 getCurrentSetting:async()=>({setting:{language,questSchemaCheckIntervalHours:6,questSchemaCheckNotifyOnly:false,captureSavePath:null,proxyMode:'system',proxyPacScript:null,proxyFixedServers:null,extensions:[],taihaSingekiBlockEnable:true,taihaSingekiBlockSkipSafeCell:true},viewInfo:{defaultCaptureSavePath:'C:\\KouBrowser\\captures',...state}}),
 saveSetting:async()=>{},readyToShow:async()=>{},close:()=>{},minimize:()=>{},onQuestSchemaStateChanged:()=>()=>{},getQuestSchemaState:async()=>state,checkQuestSchema:async()=>state,applyQuestSchema:async()=>state,selectCaptureSavePath:async()=>null,selectExtensionPath:async()=>null
});

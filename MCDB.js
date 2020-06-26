var Plugin_Name = 'MCDBedrock';//插件名称
//版本号遵循Semantic Versioning 2.0.0协议
var Plugin_Version = 'V2.1.0';//插件版本号
var Plugin_Author = 'XianYu_Hil';//插件作者
var op = `HWorld123`;//最高权限拥有者

var have = fileReadAllText('Logininterval.json');
if (have == null) {
	var lg = { "lgt": { "sz": [{ "id": "player", "logout": 0 }] } }
	var jz = JSON.stringify(lg);
	fileWriteAllText('Logininterval.json', jz);
	log('首次加载Login interval插件 数据json文件已保存于BDS根目录/Logininterval.json')
}

//玩家输入监听
setAfterActListener('onInputText',function(e){
	var pl = JSON.parse(e);
	var input = pl.msg;
	var name = pl.playername;
	var world = pl.dimension;
	var x = pl.XYZ.x;
	var y = pl.XYZ.y;
	var z = pl.XYZ.z;
	var uuid = pl.uuid;
	var botname;
	var taskname;
	
	if(input.startsWith(`@`)){
		//@MCDB      显示简介
		if(input=='@MCDB'){
			runcmd('say §2========================');
			runcmd(`say §c§l ${Plugin_Name} - ${Plugin_Version}`);
			runcmd(`say §o作者：${Plugin_Author}`);
			runcmd('say 简介：一款简单的基于DBSJSRunner的BDS服务端辅助插件')
			runcmd('say §2====================');
			runcmd('say @MCDB help     显示MCDB帮助');
			runcmd('say @MCDB install      第一次使用MCDB请务必执行一次!');
			runcmd('say §2========================');
			
		}
		//@MCDB help      显示帮助
		else if(input=='@MCDB help'){
			runcmd('say §2====================');
			runcmd('say @here      报点');
			runcmd('say @task <add/remove>      添加/移除任务列表');
			runcmd('say @sh <命令>      向控制台注入指令');
			runcmd('say @=<表达式>      计算表达式');
			runcmd('say @bot <spawn/kill/tp> <名称>  生成/移除/传送到指定假人');
			runcmd('say @bot list      列出所有假人');
			runcmd('say @item <draw/kill>      拾取/清除所有掉落物');
			runcmd('say @speed <speed/normal/倍数>    将随机刻调整为指定倍数');
			runcmd('say @moblist      列出所有实体');
			runcmd('say @ki <true/false>      开启/关闭死亡不掉落');
			runcmd('say @mg <true/false>      开启/关闭生物破坏');
			runcmd('say @tick <block/circle/remove/list>    添加方形/圆形/移除/列出常加载区块');
			runcmd('say @sta <name>    将侧边栏显示切换成指定计分板');
			runcmd(`say @day    查询当前游戏天数`);
			//runcmd('say @qb      快速备份(自动重启服务器)');
			runcmd('say §2========================');
		}
		//@MCDB install      安装插件相关组件
		else if(input=='@MCDB install'){
			runcmd('scoreboard objectives add Dig dummy §l§7挖掘榜');
			runcmd('scoreboard objectives add Killed dummy §l§7击杀榜');
			runcmd('scoreboard objectives add Dead dummy §l§7死亡榜');
			runcmd('scoreboard objectives add Tasks dummy §l§e服务器摸鱼指南');
			runcmd('say 已初始化MCDB插件及其相关组件');
		}
		//@here      报点
		else if(input=='@here'){
			runcmd('playsound random.levelup @a');
			runcmd(`say §r§l§f${name}§r§o§9在§r§l§f${world}[${x},${y},${z}]§r§o§9向大家打招呼`);
		}
		//@task      操作任务列表
		else if(input.startsWith('@task ')){
			if(input.startsWith('@task add ')){
				taskname=input.substr(10);
				runcmd(`scoreboard players set ${taskname} Tasks 1`);
			}
			else if(input.startsWith('@task remove ')){
				taskname=input.substr(13);
				runcmd(`scoreboard players reset ${taskname} Tasks`);
			}
		}
		//@sh <命令>      向服务器控制台注入指令
		else if(input.startsWith('@sh ')){
			var command = input.substr(4);
			runcmd(command);
			//runcmd(`say §r§l§f${name}§r§o§9向控制台注入了§r§l§f/${command}§r§o§9指令`);
		}
		//@=<表达式>      计算表达式
		else if(input.startsWith('@=')){
			var expression = input.substr(2);
			var result = eval(expression);
			runcmd(`say §r§l§7${expression}= §r§l§f${result}`);
		}
		//@bot      假人
		else if(input.startsWith('@bot ')){
			if(input.startsWith('@bot spawn ')){
				botname = input.substr(11);
				runcmd(`execute @a[name=${name}] ~~~ summon minecraft:player bot_${botname}`);
				runcmd(`tag @e[name=bot_${botname}] add BOT`);
				runcmd(`execute @a[name=${name}] ~~~ tickingarea add ~~~~~~ loader_${botname}`);
				runcmd(`say bot_${botname}加入了游戏`);
			}
			else if(input.startsWith('@bot kill ')){
				botname = input.substr(10);
				runcmd(`kill @e[name=bot_${botname}]`);
				runcmd(`tickingarea remove loader_${botname}`);
				runcmd(`say bot_${botname}退出了游戏`);
			}
			else if(input.startsWith('@bot tp ')){
				botname = input.substr(8);
				runcmd(`execute @a[name=${name}] ~~~ tp @e[name=bot_${botname}]`);
				//runcmd(`say §r§o§9将§r§l§f${name}§r§o§9传送到§r§l§fbot_${botname}`);
			}
			else if(input=='@bot list'){
				runcmd('say §r§o§9服务器内存在§r§l§f @e[tag=BOT] §r§o§9假人');
			}
		}
		//@item      掉落物相关
		else if(input.startsWith('@item ')){
			if(input=='@item draw'){
				runcmd(`tp @e[type=item] @a[name=${name}]`);
				//runcmd(`say §r§l§f${name}§r§o§9拾取了所有掉落物`);
			}
			else if(input=='@item kill'){
				runcmd('kill @e[type=item]');
				//runcmd(`say §r§l§f${name}§r§o§9清除了所有掉落物`);
			}
			
		}
		//@speedmgr      随机刻相关
		else if(input.startsWith('@speed ')){
			var speed=input.substr(7);
			if(speed=='fast'){
				runcmd('gamerule randomtickspeed 1024');
				runcmd(`say §r§l§f${name}§r§o§9将游戏内随机刻加快了1024倍`);
			}
			else if(speed=='normal'){
				runcmd('gamerule randomtickspeed 1');
				runcmd(`say §r§l§f${name}§r§o§9将游戏内随机刻恢复正常`);
			}
			else{
				runcmd('gamerule randomtickspeed '+speed);
				runcmd(`say §r§l§f${name}§r§o§9将游戏内随机刻加快了${speed}倍`);
			}
			
		}
		//@moblist      列出实体
		else if(input=='@moblist'){
			runcmd('say §r§o§9发现有实体§r§l§f @e');
		}
		//@ki      死亡掉落调整
		else if(input.startsWith('@ki ')){
			if(input=='@ki true'){
				runcmd('gamerule keepinventory true');
				runcmd(`say §r§l§f${name}§r§o§9开启了死亡不掉落`);
			}
			else if(input=='@ki false'){
				runcmd('gamerule keepinventory false');
				runcmd(`say §r§l§f${name}§r§o§9关闭了死亡不掉落`);
			}
		}
		//@mg      生物破坏
		else if (input.startsWith('@mg ')) {
			if (input == '@mg true') {
				runcmd('gamerule mobGriefing true');
				runcmd(`say §r§l§f${name}§r§o§9开启了生物破坏`);
			}
			else if (input == '@mg false') {
				runcmd('gamerule mobGriefing false');
				runcmd(`say §r§l§f${name}§r§o§9关闭了生物破坏`);
			}
		}
		//@tick      常加载区块管理
		else if(input.startsWith('@tick ')){
			if(input=='@tick block'){
				runcmd(`execute @a[name=${name}] ~~~ tickingarea add ~~~~~~`);
				runcmd(`say §r§l§f${name}§r§o§9将§r§l§f[${x},${y},${z}]§r§o§9所在区块设为常加载区块`);
			}
			else if(input=='@tick circle'){
				runcmd(`execute @a[name=${name}] ~~~ tickingarea add circle ~~~ 4`);
				runcmd(`say §r§l§f${name}§r§o§9将以§r§l§f[${x},${y},${z}]§r§o§9为圆心，半径为4的圆所在区块设为常加载区块`);
			}
			else if(input=='@tick remove'){
				runcmd(`execute @a[name=${name}] ~~~ tickingarea remove ~~~`);
				runcmd(`say §r§l§f${name}§r§o§9移除了§r§l§f[${x},${y},${z}]§r§o§9所在的常加载区块`);
			}
			else if(input=='@tick list'){
				runcmdAs(uuid,'/tickingarea list');
			}
		}
		//@ban      快速封号
		else if (input.startsWith(`@ban `)) {
			var baner = input.substr(5);
			if (name == op) {
				runcmd(`kick ${baner}`);
				runcmd(`whitelist remove ${baner}`);
			}
			else {
				runcmd(`say 你无权使用该命令,警告一次`);
				setTimeout(`kick ${name}`, 5000);
				log(`${name}试图跨权使用@ban ${baner}`);
			}
		}
		//@sta      切换侧边栏显示
		else if (input.startsWith(`@sta `)) {
			var ScoreboardName = input.substr(5);
			runcmd(`scoreboard objectives setdisplay sidebar ${ScoreboardName}`);
		}
			
		else if (input = `@day`) {
			runcmd(`time query day`);
		}
		/*
		//@qb      快速备份
		else if(input=='@qb'){
			//var objShell=new ActiveXObject("WScript.Shell");
			//var iReturnCode=objShell.Run("C:\\MinecraftServer\\MCModDllExe\\quickbackup.bat",0,false);
			var child_process=require("child_process");
			child_process.execFile('C:\MinecraftServer\MCModDllExe\quickbackup.bat');
			runcmd('stop');
		}
		*/
		else{
			runcmd('say 未知的指令,请输入@MCDB获取帮助');
		}
	}
	//return true;
});

//击杀榜/死亡榜/死亡报点 相关
setAfterActListener('onMobDie', function (e) {
	var pl = JSON.parse(e);
	var jsname = pl.srcname;//击杀者名字
	var bsname = pl.mobname;//被杀者名字
	var world = pl.dimension;
	//击杀榜
	if(jsname!=''){
		runcmd(`scoreboard players add @a[name=${jsname}] Killed 1`);
	}
	if(pl.mobtype=="entity.player.name"){
	var x = pl.XYZ.x;
	var y = pl.XYZ.y;
	var z = pl.XYZ.z;		
		//死亡榜
		runcmd(`scoreboard players add @a[tag=!BOT,name=${bsname}] Dead 1`);
		//死亡报点
		runcmd(`say §r§l§f${bsname}§r§o§4死于 §r§l§f${world}[${x},${y},${z}]`);
	}
});

//挖掘榜计算
setAfterActListener('onDestroyBlock', function (e) {
	var pl = JSON.parse(e);
	var name = pl.playername;
	if(name!=''){
	runcmd(`scoreboard players add ${name} Dig 1`);		
	}
});

//屏蔽相关输出
setBeforeActListener('onServerCmdOutput', function (e) {
	let pl = JSON.parse(e);
	var output = pl.output
	var result1 = output.search("Killed");
	var result2 = output.search("Dead");
	var result3 = output.search("Dig");
	if (result1 == -1 && result2 == -1 && result3 == -1 ) {
		return true
	} else {
		return false
	}
});

//天数查询
setAfterActListener('onServerCmdOutput', function (e) {
	let pl = JSON.parse(e);
	var output = pl.output
	if (output.startsWith(`Day is `)) {
		var days = output.substr(7);
		runcmd(`say 现在是第${days}天.`);
	}
});

//反作弊
setBeforeActListener('onInputCommand', function (e) {
	var pl = JSON.parse(e);
	var cmd = pl.cmd;
	var name = pl.playername;

	if (!cmd.startsWith('/?') && !cmd.startsWith('/help') && !cmd.startsWith('/list') && !cmd.startsWith('/me') && !cmd.startsWith('/mixer') && !cmd.startsWith('/msg') && !cmd.startsWith('/tell') && !cmd.startsWith('/w') && !cmd.startsWith('/tickingarea') && !cmd.startsWith('/tp ')) {
		runcmd(`say ${name} 试图违规使用 ${cmd} 指令，已被阻止`);
		log(`${name} 试图违规使用 ${cmd} 指令`);
		setTimeout(`kick ${name}`, 5000);
		return false;
	} else {
		return true;
	}
});

//玩家登录监听
setAfterActListener('onLoadName', function (e) {
	var je = JSON.parse(e);
	var lg = fileReadAllText('Logininterval.json');
	var lgj = JSON.parse(lg);
	var i;
	var ii = lgj.lgt.sz.length - 1;
	var havaplayer = false;
	for (i in lgj.lgt.sz) {
		if (i <= ii && lgj.lgt.sz[i].id == je.playername) {
			var pl = '"' + je.playername + '"';
			var d = new Date();
			var logint = d.getTime();
			var logout = lgj.lgt.sz[i].logout
			var interval = logint - logout
			let days = Math.floor(interval / (24 * 3600 * 1000));
			let leavel = interval % (24 * 3600 * 1000);
			let hours = Math.floor(leavel / (3600 * 1000));
			let leavel2 = leavel % (3600 * 1000);
			let minutes = Math.floor(leavel2 / (60 * 1000));
			log(`时隔${days}天${hours}时${minutes}分 玩家${je.playername}再次进入了服务器`)
			setTimeout(function () {
				var lgc = `,现在距离你上次登出服务器${days}天${hours}时${minutes}分`;
				runcmd(`say ${je.playername}${lgc}`)
			}, 16000);
			havaplayer = true;
		} else if (i == ii && lgj.lgt.sz[i].id != je.playername && havaplayer == false) {
			var xr = '},{"id":' + '"' + je.playername + '"' + ',"logout":0}]}}'
			var xrz = lg.replace("}]}}", xr);
			fileWriteAllText('Logininterval.json', xrz);
			log(`玩家${je.playername}首次进入服务器`)
			setTimeout(function () {
				runcmd(`say ${je.playername},你是首次进入本服务器，祝你游戏愉快`)
			}, 16000);
		}
	}
});
setAfterActListener('onPlayerLeft', function (e) {
	var je = JSON.parse(e);
	var lg = fileReadAllText('Logininterval.json');
	var lgj = JSON.parse(lg);
	var i;
	var ii = lgj.lgt.sz.length - 1;
	for (i in lgj.lgt.sz) {
		if (i <= ii && lgj.lgt.sz[i].id == je.playername) {
			var d = new Date();
			var logout = d.getTime();
			lgj.lgt.sz[i].logout = logout
			var jz = JSON.stringify(lgj);
			fileWriteAllText('Logininterval.json', jz);
		}
	}
});

log('***MCDBedrock已装载完成      用法:@MCDE');
/*
log('***here已装载完成      用法:@here');
log('***serverhelper已装载完成      用法:@sh <指令>');
log('***eval已装载完成      用法:@=<表达式>');
log('***bot已装载完成      用法:@bot <spawn/kill/tp/list> <bot名称>');
log('***itemmgr已装载完成      用法:@item <draw/kill>');
log('***speedmgr已装载完成      用法:@speed <fast/normal/数字>');
log('***moblist已装载完成      用法:@moblist');
log('***kimgr已装载完成      用法:@ki <true/false>');
log('***tickmgr已装载完成      用法:@tick <block/circle/remove/list>');
log('***tasksmgr已装载完成      用法:@task <add/remove>');
log('***quickbackup已装载完成      用法:@qb');
*/
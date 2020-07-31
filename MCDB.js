const Plugin_Name = 'MCDaemonB';//插件名称
//版本号遵循Semantic Versioning 2.0.0协议
const Plugin_Version = 'V2.4.2';//插件版本号
const Plugin_Author = 'XianYu_Hil';//插件作者
const op = `HWorld123`;//最高权限拥有者

//@back
var Dead_x;
var Dead_y;
var Dead_z;
var Dead_world;
var isDead = false;

//@kill
var isSuicide = false;


var have = fileReadAllText('Logininterval.json');
if (have == null) {
	var lg = { "lgt": { "sz": [{ "id": "player", "logout": 0 }] } }
	var jz = JSON.stringify(lg);
	fileWriteAllText('Logininterval.json', jz);
	log('首次加载Login interval插件 数据json文件已保存于BDS根目录/Logininterval.json')
}

//日志输出MCDB.log
function outputLOG(playername , text) {
	var time = new Date();
	var year = time.getFullYear();
	var month = time.getMonth() + 1;
	var day = time.getDate();
	var hours = time.getHours();
	var minutes = time.getMinutes();
	var seconds = time.getSeconds();
	var logtext = `[MCDB][${year}-${month}-${day}][${hours}:${minutes}:${seconds}]${playername}：${text}`
	
	return logtext;
}

//js格式反馈
function callback(playername , backtext) {
	var result = `tellraw ${playername} {"rawtext":[{"text":"${backtext}"}]}`;

	return result;
}

//玩家输入监听
setAfterActListener('onInputText', function (e) {
	var pl = JSON.parse(e);
	var input = pl.msg;
	var name = pl.playername;
	var world = pl.dimension;
	var x = parseInt(pl.XYZ.x);
	var y = parseInt(pl.XYZ.y);
	var z = parseInt(pl.XYZ.z);
	var uuid = pl.uuid;
	var botname;
	var taskname;

	if (input.startsWith(`@`)) {
		//MCDB使用日志
		log(outputLOG(name, input));
		fileWriteLine(`MCDaemonB.log`, outputLOG(name, input));

		//@MCDB      显示简介
		if (input == '@MCDB') {
			runcmd(callback(name, '§2========================'));
			runcmd(callback(name, `§c§l ${Plugin_Name} - ${Plugin_Version}`));
			runcmd(callback(name, `§o作者：${Plugin_Author}`));
			runcmd(callback(name, '模块状态：§a正常'));
			runcmd(callback(name, '§2===================='));
			runcmd(callback(name, '@MCDB help     显示MCDB帮助'));
			runcmd(callback(name, '@MCDB install      第一次使用MCDB请务必执行一次!'));
			runcmd(callback(name, '§2========================'));

		}
		//@MCDB help      显示帮助
		else if (input == '@MCDB help') {
			runcmd(callback(name, '§2===================='));
			runcmd(callback(name, '@here      报点'));
			runcmd(callback(name, '@task <add/remove>      添加/移除任务列表'));
			runcmd(callback(name, '@sh <命令>      向控制台注入指令'));
			runcmd(callback(name, '@=<表达式>      计算表达式'));
			runcmd(callback(name, '@bot <spawn/kill/tp> <名称>  生成/移除/传送到指定假人'));
			runcmd(callback(name, '@bot list      列出所有假人'));
			runcmd(callback(name, '@item <draw/kill>      拾取/清除所有掉落物'));
			runcmd(callback(name, '@speed <speed/normal/倍数>    将随机刻调整为指定倍数'));
			runcmd(callback(name, '@moblist      列出所有实体'));
			runcmd(callback(name, '@ki <true/false>      开启/关闭死亡不掉落'));
			runcmd(callback(name, '@mg <true/false>      开启/关闭生物破坏'));
			runcmd(callback(name, '@tick <block/circle/remove/list>    添加方形/圆形/移除/列出常加载区块'));
			runcmd(callback(name, '@sta <name>    将侧边栏显示切换成指定计分板'));
			runcmd(callback(name, `@day    查询当前游戏天数`));
			runcmd(callback(name, `@back    回到死亡地点(不支持跨世界)`));
			runcmd(callback(name, `@kill    快速自杀`));
			//runcmd('say @qb      快速备份(自动重启服务器)');
			runcmd(callback(name, '§2========================'));
		}
		//@MCDB install      安装插件相关组件
		else if (input == '@MCDB install') {
			runcmd('scoreboard objectives add Dig dummy §l§7挖掘榜');
			runcmd('scoreboard objectives add Killed dummy §l§7击杀榜');
			runcmd('scoreboard objectives add Dead dummy §l§7死亡榜');
			runcmd('scoreboard objectives add Placed dummy §l§7放置榜');
			runcmd('scoreboard objectives add Attack dummy §l§7伤害榜');
			runcmd('scoreboard objectives add Hurt dummy §l§7承伤榜');
			runcmd('scoreboard objectives add Tasks dummy §l§e服务器摸鱼指南');
			runcmd(callback(name, '已初始化MCDB插件及其相关组件'));
		}
		//@here      报点
		else if (input == '@here') {
			runcmd('playsound random.levelup @a');
			runcmd(callback(`@a`, `§e§l${name}§r在§e§l${world}[${x},${y},${z}]§r向大家打招呼！`));
		}
		//@task      操作任务列表
		else if (input.startsWith('@task ')) {
			if (input.startsWith('@task add ')) {
				taskname = input.substr(10);
				runcmd(`scoreboard players set ${taskname} Tasks 1`);
				runcmd(callback(`@a`, `已向待办事项板添加§l${taskname}§r`));
			}
			else if (input.startsWith('@task remove ')) {
				taskname = input.substr(13);
				runcmd(`scoreboard players reset ${taskname} Tasks`);
				runcmd(callback(`@a`, `已将§l${taskname}§r从待办事项板上移除`));
			}
		}
		//@sh <命令>      向服务器控制台注入指令
		else if (input.startsWith('@sh ')) {
			var command = input.substr(4);
			runcmd(command);
			runcmd(callback(`@a`, `已向控制台注入了 §l§f${command}`));
		}
		//@=<表达式>      计算表达式
		else if (input.startsWith('@=')) {
			var expression = input.substr(2);
			var result = eval(expression);
			runcmd(callback(`@a`, `§r§l§7${expression} = §r§l§f${result}`));
		}
		//@bot      假人
		else if (input.startsWith('@bot ')) {
			if (input.startsWith('@bot spawn ')) {
				botname = input.substr(11);
				runcmd(`execute @a[name=${name}] ~~~ summon minecraft:player bot_${botname}`);
				runcmd(`tag @e[name=bot_${botname}] add BOT`);
				runcmd(`execute @a[name=${name}] ~~~ tickingarea add ~~~~~~ loader_${botname}`);
				runcmd(callback(`@a`, `bot_${botname}加入了游戏`));
			}
			else if (input.startsWith('@bot kill ')) {
				botname = input.substr(10);
				runcmd(`kill @e[name=bot_${botname}]`);
				runcmd(`tickingarea remove loader_${botname}`);
				runcmd(callback(`@a`, `bot_${botname}退出了游戏`));
			}
			else if (input.startsWith('@bot tp ')) {
				botname = input.substr(8);
				runcmd(`execute @a[name=${name}] ~~~ tp @e[name=bot_${botname}]`);
				//runcmd(`say §r§o§9将§r§l§f${name}§r§o§9传送到§r§l§fbot_${botname}`);
			}
			else if (input == '@bot list') {
				runcmd('say 服务器内存在§l @e[tag=BOT] §r假人');
			}
		}
		//@item      掉落物相关
		else if (input.startsWith('@item ')) {
			if (input == '@item draw') {
				runcmd(`tp @e[type=item] @a[name=${name}]`);
				runcmd(callback(`@a`, `${name}拾取了所有掉落物`));
			}
			else if (input == '@item kill') {
				runcmd('kill @e[type=item]');
				runcmd(callback(`@a`, `已清除所有掉落物`));
			}
		}
		//@speedmgr      随机刻相关
		else if (input.startsWith('@speed ')) {
			var speed = input.substr(7);
			if (speed == 'fast') {
				runcmd('gamerule randomtickspeed 1024');
				runcmd(callback(`@a`, `已将游戏内随机刻加快1024倍`));
			}
			else if (speed == 'normal') {
				runcmd('gamerule randomtickspeed 1');
				runcmd(callback(`@a`, `已将游戏内随机刻恢复正常`));
			}
			else {
				runcmd('gamerule randomtickspeed ' + speed);
				runcmd(callback(`@a`, `已将游戏内随机刻加快${speed}倍`));
			}

		}
		//@moblist      列出实体
		else if (input == '@moblist') {
			runcmd('say §r§o§9发现有实体§r§l§f @e');
		}
		//@ki      死亡掉落调整
		else if (input.startsWith('@ki ')) {
			if (input == '@ki true') {
				runcmd('gamerule keepinventory true');
				runcmd(callback(`@a`, `死亡不掉落已开启`));
			}
			else if (input == '@ki false') {
				runcmd('gamerule keepinventory false');
				runcmd(callback(`@a`, `死亡不掉落已关闭`));
			}
		}
		//@mg      生物破坏
		else if (input.startsWith('@mg ')) {
			if (input == '@mg true') {
				runcmd('gamerule mobGriefing true');
				runcmd(callback(`@a`, `生物破坏已开启`));
			}
			else if (input == '@mg false') {
				runcmd('gamerule mobGriefing false');
				runcmd(callback(`@a`, `生物破坏已关闭`));
			}
		}
		//@tick      常加载区块管理
		else if (input.startsWith('@tick ')) {
			if (input == '@tick block') {
				runcmd(`execute @a[name=${name}] ~~~ tickingarea add ~~~~~~`);
				runcmd(callback(`@a`, `将§e§l[${x},${y},${z}]§r所在区块设为常加载区块`));
			}
			else if (input == '@tick circle') {
				runcmd(`execute @a[name=${name}] ~~~ tickingarea add circle ~~~ 4`);
				runcmd(callback(`@a`, `将以§e§l[${x},${y},${z}]§r为圆心，半径为4的圆所覆盖的区块设为常加载区块`));
			}
			else if (input == '@tick remove') {
				runcmd(`execute @a[name=${name}] ~~~ tickingarea remove ~~~`);
				runcmd(callback(`@a`, `移除了§e§l[${x},${y},${z}]§r所在的常加载区块`));
			}
			else if (input == '@tick list') {
				runcmdAs(uuid, '/tickingarea list');
			}
		}
		//@ban      快速封号
		else if (input.startsWith(`@ban `)) {
			var baner = input.substr(5);
			if (name == op) {
				runcmd(`kick ${baner} 您已被服务器封禁，无法再次进入游戏.`);
				runcmd(`whitelist remove ${baner}`);
				runcmd(callback(`@a`, `已封禁§l${baner}`));
			}
			else {
				runcmd(callback(name, `你无权使用该命令,警告一次`));
				setTimeout(function () { runcmd(`kick ${name} 试图越权使用@ban指令，自动踢出`) }, 5000);
				log(`${name}试图跨权使用@ban ${baner}`);
			}
		}
		//@sta      切换侧边栏显示
		else if (input.startsWith(`@sta `)) {
			var ScoreboardName = input.substr(5);
			var showName;
			runcmd(`scoreboard objectives setdisplay sidebar ${ScoreboardName}`);
			if (ScoreboardName == `Dig`) { showName = `挖掘榜`; }
			else if (ScoreboardName == `Placed`) { showName = `放置榜`; }
			else if (ScoreboardName == `Attack`) { showName = `伤害榜`; }
			else if (ScoreboardName == `Hurt`) { showName = `承伤榜`; }
			else if (ScoreboardName == `Killed`) { showName = `击杀榜`; }
			else if (ScoreboardName == `Tasks`) { showName = `待办事项榜`; }
			else if (ScoreboardName == `Dead`) { showName = `死亡榜` }
			else { showName = ScoreboardName };
			runcmd(callback(`@a`, `已将侧边栏显示更改为${showName}`));
		}
		//@day		显示游戏天数
		else if (input == `@day`) {
			runcmd(`time query day`);
		}
		//@back		返回死亡坐标
		else if (input == `@back`) {
			if (isDead == true) {
				if (Dead_world == world) {
					runcmd(`execute @a[name=${name}] ~~~ tp ${Dead_x} ${Dead_y} ${Dead_z}`);
				}
				else {
					runcmd(callback(`@a`,`死亡世界为${Dead_world}，当前世界为${world}，无法跨世界传送!`));
				};
			}
			else {
				runcmd(callback(`@a`, `暂无死亡记录，无法返回`));
			};
		}
		//@kill		自杀
		else if (input==`@kill`) {
			isSuicide = true;
			runcmd(`kill ${name}`);

			//死亡提示
			var SuicideNum = Math.floor(Math.random() * 10);
			switch (SuicideNum) {
				case 0:
					runcmd(callback(`@a`, `§l${name}§r进入了通向二次元的路口`));
					break;
				case 1:
					runcmd(callback(`@a`, `§l${name}§r错杀亲马，悲痛欲绝`));
					break;
				case 2:
					runcmd(callback(`@a`, `§l${name}§r和张东升一起去爬山`));
					break;
				case 3:
					runcmd(callback(`@a`, `不要停下来啊，§l${name}§r！`));
					break;
				case 4:
					runcmd(callback(`@a`, `§l${name}§r删除了MCDB的源代码`));
					break;
				case 5:
					runcmd(callback(`@a`, `§l${name}§r进入了和宝的蜜穴惨被榨干`));
					break;
				case 6:
					runcmd(callback(`@a`, `§l${name}§r被确诊为肝坏死`));
					break;
				case 7:
					runcmd(callback(`@a`, `§l${name}§r划水过度而被原地处死`));
					break;
				case 8:
					runcmd(callback(`@a`, `§l${name}§r因长期摸鱼感染了新冠肺炎`));
					break;
				case 9:
					runcmd(callback(`@a`, `§l${name}§r贴了贴和宝`));
					break;
				default:
					runcmd(callback(`@a`, `§l${name}§r因长期摸鱼感染了新冠肺炎`));
					break;
			}
		}
		//@rs <脚本内容>	执行一段脚本
		else if (input.startsWith(`@rs `)) {
			var ScriptText = input.substr(4);
			var result = runScript(ScriptText);
			runcmd(callback(name, result));
		}
		else if (input.startsWith(`@qb `)) {
			if (input == `@qb make`) {
				runcmd(callback(`@a`, `服务器将在§l10秒§r后重启，进行备份`));
				fileWriteLine(`qb_make.txt`, `start`);

			}
			else if (input == `@qb time`) {
				runcmd(callback(`@a`, `备份查询在做了在做了.jpg`));
			}
			else if (input == `@qb resume`) {
				runcmd(callback(`@a`, `备份恢复在做了在做了.jpg`));
			}
		}
		else {
			runcmd(callback(name,'未知的指令,请输入@MCDB获取帮助'));
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
	if (pl.srctype == "entity.player.name") {
		runcmd(`scoreboard players add @a[name=${jsname}] Killed 1`);
	}
	if (pl.mobtype == "entity.player.name") {
		var x = parseInt(pl.XYZ.x);
		var y = parseInt(pl.XYZ.y);
		var z = parseInt(pl.XYZ.z);
		//死亡榜
		if (isSuicide == false) {
			runcmd(`scoreboard players add @a[tag=!BOT,name=${bsname}] Dead 1`);
		}
		else {
			isSuicide = false;
		}
		//死亡报点
		runcmd(callback(`@a`, `§r§l§f${bsname}§r§o§4 死于 §r§l§f${world}[${x},${y},${z}]`));
		//记录死亡点
		Dead_x = x; Dead_y = y; Dead_z = z; Dead_world = world; isDead = true;
	}
});

//挖掘榜计算
setAfterActListener('onDestroyBlock', function (e) {
	var pl = JSON.parse(e);
	var name = pl.playername;
	if (name != '') {
		runcmd(`scoreboard players add ${name} Dig 1`);
	}
});

//放置榜计算
setAfterActListener('onPlacedBlock', function (e) {
	var pl = JSON.parse(e);
	var name = pl.playername;
	if (name != '') {
		runcmd(`scoreboard players add ${name} Placed 1`);
	}
});

//伤害榜/承伤榜计算
setAfterActListener('onMobHurt', function (e) {
	var pl = JSON.parse(e);
	var hurt = pl.dmcount;//伤害数值
	var bdname = pl.mobname;//被打者名字
	var gjname = pl.srcname;//攻击者名字

	//伤害榜
	if (pl.srctype == "entity.player.name") {
		runcmd(`scoreboard players add @a[name=${gjname}] Attack ${hurt}`);
	}
	//承伤榜
	if (pl.mobtype == "entity.player.name") {
		runcmd(`scoreboard players add @a[tag=!BOT,name=${bdname}] Hurt ${hurt}`);
	}
});

//屏蔽相关输出
setBeforeActListener('onServerCmdOutput', function (e) {
	let pl = JSON.parse(e);
	var output = pl.output
	var result1 = output.search("Killed");
	var result2 = output.search("Dead");
	var result3 = output.search("Dig");
	var result4 = output.search("Placed");
	var result5 = output.search("Attack");
	var result6 = output.search("Hurt");

	var result7 = output.search("Running AutoCompaction...");
	if (result1 == -1 && result2 == -1 && result3 == -1 && result4 == -1 && result5 == -1 && result6 == -1 && result7 == -1) {
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
		runcmd(callback(`@a`,`现在的天数为${days}`));
	}
});

//反作弊
setBeforeActListener('onInputCommand', function (e) {
	var pl = JSON.parse(e);
	var cmd = pl.cmd;
	var name = pl.playername;

	if (!cmd.startsWith('/?') && !cmd.startsWith('/help') && !cmd.startsWith('/list') && !cmd.startsWith('/me') && !cmd.startsWith('/mixer') && !cmd.startsWith('/msg') && !cmd.startsWith('/tell') && !cmd.startsWith('/w') && !cmd.startsWith('/tickingarea') && !cmd.startsWith('/tp ')) {
		runcmd(callback(`@a`,`${name} 试图违规使用 ${cmd} 指令，已被阻止`));
		log(`${name} 试图违规使用 ${cmd} 指令`);
		setTimeout(function () { runcmd(`kick ${name} 试图违规使用指令${cmd}，自动踢出`) }, 5000);
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
				var lgc = `,现在距离你上次登出服务器过去了${days}天${hours}时${minutes}分`;
				runcmd(`say 欢迎回到HIC！ ${je.playername}${lgc}`)
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

log(`******* ${Plugin_Name} - ${Plugin_Version} 已装载完成      用法:@MCDE *******`)
fileWriteLine(`MCDaemonB.log`, outputLOG(Plugin_Name, `running`));
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
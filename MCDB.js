//#region 全局变量声明
const Plugin_Name = 'MCDaemonB';//插件名称
const Plugin_Version = 'V2.11.0';//插件版本号 遵循Semantic Versioning 2.0.0协议
const Plugin_Author = 'XianYu_Hil';//插件作者
const op = `XianYuHil`;//最高权限拥有者

//@back
var playerData = {};

//UnCheat
var isUnCheat = true;

//@cmdToGame
var gameDay;
var tickStatus;
var kiStatus;
var mgStatus;
var entityCounter;
var itemCounter;
//#endregion

//#region 更新日志
const updatelog =`1、移除进服面板\n2、将@show 更改回 @sta\n3、将bot加载范围修改为4半径的圆所覆盖的区块（更符合真实玩家）\n4、@tick、@ki、@mg 支持通过status查询随机刻/死亡不掉落/生物破坏的状态\n5、加入@count <entity/item>\n6、加入@MCDB updatalog 获取更新日志\n7、@MCDB指令支持大小写\n8、优化死亡点记录实现方法\n9、优化自杀状态存储形式\n10、规范化变量名、方法名`
//#endregion

//#region 函数
//获取玩家UUID
function UUID(player) {
	var list = getOnLinePlayers();
	var listObj = JSON.parse(list);
	for (var i = 0; i < listObj.length; i++) {
		if (listObj[i]["playername"] == player) {
			return listObj[i].uuid;
		}
	}
}
//上线记录
/*var have = fileReadAllText('Logininterval.json');
if (have == null) {
	var lg = { "lgt": { "sz": [{ "id": "player", "logout": 0 }] } }
	var jz = JSON.stringify(lg);
	fileWriteAllText('Logininterval.json', jz);
	log('首次加载Login interval插件 数据json文件已保存于BDS根目录/Logininterval.json')
}*/
//日志输出MCDB.log
function outputLOG(playername, text) {
	let time = new Date();
	let year = time.getFullYear();
	let month = time.getMonth() + 1;
	let day = time.getDate();
	let hours = time.getHours();
	let minutes = time.getMinutes();
	let seconds = time.getSeconds();
	let logText = `[MCDB][${year}-${month}-${day}][${hours}:${minutes}:${seconds}]${playername}：${text}`

	return logText;
}
//时间差计算
function getDiffDate(targetDate) {
	let date1 = new Date(targetDate);
	let date2 = new Date();
	date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
	date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
	const diff = date2.getTime() - date1.getTime();
	const diffDate = diff / (24 * 60 * 60 * 1000);
	return diffDate;
};
//js格式反馈
function normFeedback(playername, backtext) {
	let result = `tellraw ${playername} {"rawtext":[{"text":"${backtext}"}]}`;
	runcmd(result);
}
//获取死亡点数据
function back(name) {
	let je = JSON.parse(selectPlayer(UUID(name)));
	playerData[name]["deathPos"]["x"] = parseInt(je.XYZ.x);
	playerData[name]["deathPos"]["y"] = parseInt(je.XYZ.y);
	playerData[name]["deathPos"]["z"] = parseInt(je.XYZ.z);
	playerData[name]["deathPos"]["d"] = je.dimensionid;
	playerData[name]["deathPos"]["enable"] = 1;
}
//BOT死亡处理
function removeBOT(botname) {
	var name = botname.substr(4);
	runcmd(`tickingarea remove loader_${name}`);
	normFeedback(`@a`, `§ebot_${name} 退出了游戏`);
}
//#endregion

//@核心模块Core
setAfterActListener('onInputText', function (e) {
	var pl = JSON.parse(e);
	var input = pl.msg;
	var name = pl.playername;
	var world = pl.dimension;
	var x = parseInt(pl.XYZ.x);
	var y = parseInt(pl.XYZ.y);
	var z = parseInt(pl.XYZ.z);
	var uuid = UUID(name);

	if (input.startsWith(`@`)) {
		//MCDB使用日志
		log(outputLOG(name, input));
		fileWriteLine(`MCDaemonB.log`, outputLOG(name, input));

		//@MCDB      显示简介
		if (input == '@MCDB' || input == '@mcdb') {
			normFeedback(name, '§2========================');
			normFeedback(name, `§c§l ${Plugin_Name} - ${Plugin_Version}`);
			normFeedback(name, `§o作者：${Plugin_Author}`);
			normFeedback(name, '模块状态：§a正常');
			normFeedback(name, '§2====================');
			normFeedback(name, '@MCDB help     获取MCDB帮助');
			normFeedback(name, `@MCDB updatelog      获取${Plugin_Version}的更新日志`);
			normFeedback(name, '@MCDB install      第一次使用MCDB请务必执行一次!');
			normFeedback(name, '§2========================');

		}
		//@MCDB help      显示帮助
		else if (input == '@MCDB help' || input == '@mcdb help') {
			normFeedback(name, '§2====================');
			normFeedback(name, '@here      报点');
			normFeedback(name, '@task <add/remove>      添加/移除任务列表');
			normFeedback(name, '@sh <命令>      向控制台注入指令');
			normFeedback(name, '@=<表达式>      计算表达式');
			normFeedback(name, '@bot <spawn/kill/tp> <名称>  生成/移除/传送到指定假人');
			normFeedback(name, '@bot list      列出所有假人');
			normFeedback(name, '@item <pick/clear>      拾取/清除所有掉落物');
			normFeedback(name, '@tick <status/fast/normal/倍数>    查询/设置随机刻');
			normFeedback(name, '@moblist      列出所有实体');
			normFeedback(name, '@ki <status/true/false>      查询/开启/关闭死亡不掉落');
			normFeedback(name, '@mg <status/true/false>      查询/开启/关闭生物破坏');
			normFeedback(name, '@load <block/circle/remove>    添加方形/圆形/移除/列出常加载区块');
			normFeedback(name, '@sta <name/null>    将侧边栏显示切换成指定计分板/关闭');
			normFeedback(name, `@day <game/server>    查询游戏内/开服天数`);
			normFeedback(name, `@back    回到死亡地点`);
			normFeedback(name, `@kill    快速自杀`);
			normFeedback(name, `@count <entity/item>	统计加载的实体/掉落物数量`);
			normFeedback(name, `@qb <make/resume/restart>      快速备份/回档/重启服务器`);
			normFeedback(name, `@qb time      查询上次qb备份时间`);
			normFeedback(name, `@server <survival/creative>		切换至生存/创造服`);
			normFeedback(name, '§2========================');
		}
		//@MCDB install      安装插件相关组件
		else if (input == '@MCDB install' || input == '@mcdb install') {
			runcmd('scoreboard objectives add Dig dummy §l§7挖掘榜');
			runcmd('scoreboard objectives add Killed dummy §l§7击杀榜');
			runcmd('scoreboard objectives add Dead dummy §l§7死亡榜');
			runcmd('scoreboard objectives add Placed dummy §l§7放置榜');
			runcmd('scoreboard objectives add Attack dummy §l§7伤害榜');
			runcmd('scoreboard objectives add Hurt dummy §l§7承伤榜');
			runcmd('scoreboard objectives add Tasks dummy §l§e服务器摸鱼指南');
			runcmd('scoreboard objectives add _CounterCache dummy');
			runcmd('scoreboard objectives add Counter dummy');
			//runcmd('scoreboard objectives add Health dummy 生命值');
			//runcmd('scoreboard objectives setdisplay belowname Health');
			normFeedback(name, '已初始化MCDB插件及其相关组件');
		}
		//@MCDB updatelog	获取更新日志
		else if (input == '@MCDB updatelog' || input == `@mcdb updatelog`) {
			setTimeout(function () {
				sendSimpleForm(uuid, `${Plugin_Version} 更新日志`, updatelog, '["XianYu_Hil NP！"]');
			}, 3000);
		}
		//@here      报点
		else if (input == '@here') {
			runcmd('playsound random.levelup @a');
			normFeedback(`@a`, `§e§l${name}§r在§e§l${world}[${x},${y},${z}]§r向大家打招呼！`);
		}
		//@task      操作任务列表
		else if (input.startsWith('@task ')) {
			let taskName;
			if (input.startsWith('@task add ')) {
				taskName = input.substr(10);
				runcmd(`scoreboard players set ${taskName} Tasks 1`);
				normFeedback(`@a`, `已向待办事项板添加§l${taskName}§r`);
			}
			else if (input.startsWith('@task remove ')) {
				taskName = input.substr(13);
				runcmd(`scoreboard players reset ${taskName} Tasks`);
				normFeedback(`@a`, `已将§l${taskName}§r从待办事项板上移除`);
			}
		}
		//@sh <命令>      向服务器控制台注入指令
		else if (input.startsWith('@sh ')) {
			if (name == op) {
				var command = input.substr(4);
				runcmd(command);
				normFeedback(`@a`, `已向控制台注入了 §l§f${command}`);
			}
		}
		//@=<表达式>      计算表达式
		else if (input.startsWith('@=')) {
			let expression = input.substr(2);
			let result = eval(expression);
			normFeedback(`@a`, `§r§l§7${expression} = §r§l§f${result}`);
		}
		//@bot      假人
		else if (input.startsWith('@bot ')) {
			let botName;
			if (input.startsWith('@bot spawn ')) {
				botName = input.substr(11);
				runcmd(`execute @a[name=${name}] ~~~ summon minecraft:player bot_${botName}`);
				runcmd(`tag @e[name=bot_${botName}] add BOT`);
				runcmd(`execute @a[name=${name}] ~~~ tickingarea add circle ~~~ 4 loader_${botName}`);
				normFeedback(`@a`, `§ebot_${botName} 加入了游戏`);
			}
			else if (input.startsWith('@bot kill ')) {
				botName = input.substr(10);
				runcmd(`kill @e[name=bot_${botName}]`);
				//runcmd(`tickingarea remove loader_${botname}`);
				//callback(`@a`, `bot_${botname}退出了游戏`);
			}
			else if (input.startsWith('@bot tp ')) {
				botName = input.substr(8);
				runcmd(`execute @a[name=${name}] ~~~ tp @e[name=bot_${botName}]`);
			}
			else if (input == '@bot list') {
				runcmd('say 服务器内存在§l @e[tag=BOT]')
			};
		}
		//@item      掉落物相关
		else if (input.startsWith('@item ')) {
			if (input == '@item pick') {
				runcmd(`tp @e[type=item] @a[name=${name}]`);
				normFeedback(`@a`, `${name}拾取了所有掉落物`);
			}
			else if (input == '@item clear') {
				runcmd('kill @e[type=item]');
				normFeedback(`@a`, `已清除所有掉落物`);
			}
		}
		//@tickmgr      随机刻相关
		else if (input.startsWith('@tick ')) {
			if (input == '@tick status') {
				runcmd('gamerule randomtickspeed');
				setTimeout(function () {
					normFeedback(`@a`, `现在的随机刻为${tickStatus}`);
				}, 500);
			}
			else {
				let speed = input.substr(6);
				if (speed == 'fast') {
					runcmd('gamerule randomtickspeed 1024');
					normFeedback(`@a`, `已将游戏内随机刻加快1024倍`);
				}
				else if (speed == 'normal') {
					runcmd('gamerule randomtickspeed 1');
					normFeedback(`@a`, `已将游戏内随机刻恢复正常`);
				}
				else {
					runcmd('gamerule randomtickspeed ' + speed);
					normFeedback(`@a`, `已将游戏内随机刻加快${speed}倍`);
				}
			}

		}
		//@moblist      列出实体
		else if (input == '@moblist') {
			runcmd('say §r§o§9发现有实体§r§l§f @e');
		}
		//@ki      死亡掉落调整
		else if (input.startsWith('@ki ')) {
			if (input == '@ki status') {
				runcmd('gamerule keepinventory');
				setTimeout(function () {
					normFeedback(`@a`, `当前死亡不掉落${kiStatus}`);
				}, 500);
			}
			else {
				if (input == '@ki true') {
					runcmd('gamerule keepinventory true');
					normFeedback(`@a`, `死亡不掉落已开启`);
				}
				else if (input == '@ki false') {
					runcmd('gamerule keepinventory false');
					normFeedback(`@a`, `死亡不掉落已关闭`);
				}
			}

		}
		//@mg      生物破坏
		else if (input.startsWith('@mg ')) {
			if (input == '@mg status') {
				runcmd('gamerule mobGriefing');
				setTimeout(function () {
					normFeedback(`@a`, `当前生物破坏${mgStatus}`);
				}, 500);
			}
			else {
				if (input == '@mg true') {
					runcmd('gamerule mobGriefing true');
					normFeedback(`@a`, `生物破坏已开启`);
				}
				else if (input == '@mg false') {
					runcmd('gamerule mobGriefing false');
					normFeedback(`@a`, `生物破坏已关闭`);
				}
			}

		}
		//@load      常加载区块管理
		else if (input.startsWith('@load ')) {
			if (input == '@load block') {
				runcmd(`execute @a[name=${name}] ~~~ tickingarea add ~~~~~~`);
				normFeedback(`@a`, `将§e§l[${x},${y},${z}]§r所在区块设为常加载区块`);
			}
			else if (input == '@load circle') {
				runcmd(`execute @a[name=${name}] ~~~ tickingarea add circle ~~~ 4`);
				normFeedback(`@a`, `将以§e§l[${x},${y},${z}]§r为圆心，半径为4的圆所覆盖的区块设为常加载区块`);
			}
			else if (input == '@load remove') {
				runcmd(`execute @a[name=${name}] ~~~ tickingarea remove ~~~`);
				normFeedback(`@a`, `移除了§e§l[${x},${y},${z}]§r所在的常加载区块`);
			}
		}
		//@ban      快速封号
		else if (input.startsWith(`@ban `)) {
			let baner = input.substr(5);
			if (name == op) {
				runcmd(`kick ${baner} 您已被服务器封禁，无法再次进入游戏.`);
				runcmd(`whitelist remove ${baner}`);
				normFeedback(`@a`, `已封禁§l${baner}`);
			}
			else {
				normFeedback(name, `你无权使用该命令,警告一次`);
				setTimeout(function () { runcmd(`kick ${name} 试图越权使用@ban指令，自动踢出`) }, 5000);
				log(`${name}试图跨权使用@ban ${baner}`);
			}
		}
		//@show      切换侧边栏显示
		else if (input.startsWith(`@sta `)) {
			let scoreboardName = input.substr(5);
			if (scoreboardName != `null`) {
				let cnName;
				runcmd(`scoreboard objectives setdisplay sidebar ${scoreboardName}`);
				if (scoreboardName == `Dig`) { cnName = `挖掘榜`; }
				else if (scoreboardName == `Placed`) { cnName = `放置榜`; }
				else if (scoreboardName == `Attack`) { cnName = `伤害榜`; }
				else if (scoreboardName == `Hurt`) { cnName = `承伤榜`; }
				else if (scoreboardName == `Killed`) { cnName = `击杀榜`; }
				else if (scoreboardName == `Tasks`) { cnName = `待办事项榜`; }
				else if (scoreboardName == `Dead`) { cnName = `死亡榜` }
				else { cnName = scoreboardName };
				normFeedback(`@a`, `已将侧边栏显示更改为${cnName}`);
			}
			else {
				runcmd(`scoreboard objectives setdisplay sidebar`);
				normFeedback(`@a`, `已关闭侧边栏显示`);
			};
		}
		//@day		显示游戏天数
		else if (input.startsWith(`@day `)) {
			if (input == `@day game`) {
				runcmd(`time query day`);
				setTimeout(function () {
					normFeedback(`@a`, `现在的游戏天数为${gameDay}`);
				}, 500);
			}
			else if (input == `@day server`) {
				let serverDays = getDiffDate('2020-06-25T23:30:00');
				normFeedback(`@a`, `今天是开服的第${serverDays}天`);
			}
		}
		//@back		返回死亡坐标
		else if (input == `@back`) {
			if (playerData[name]["deathPos"]["enable"] == 1) {
				let x = playerData[name]["deathPos"]["x"];
				let y = playerData[name]["deathPos"]["y"];
				let z = playerData[name]["deathPos"]["z"];
				let d = playerData[name]["deathPos"]["d"];
				teleport(uuid, x, y, z, d);
				//tmp[name][4] = 0;
			} else { normFeedback(name, `无死亡记录，无法返回`) };
		}
		//@count	统计实体/掉落物数
		else if (input.startsWith(`@count `)) {
			if (input == `@count entity`) {
				runcmd(`scoreboard players set @e _CounterCache 1`);
				runcmd(`scoreboard players set "entityCounter" Counter 0`);
				runcmd(`scoreboard players operation "entityCounter" Counter += @e _CounterCache`);
				setTimeout(function () {
					normFeedback(`@a`, `当前实体数为${entityCounter}`);
				}, 500);
			}
			else if (input == `@count item`) {
				runcmd(`scoreboard players set @e[type=item] _CounterCache 1`);
				runcmd(`scoreboard players set "itemCounter" Counter 0`);
				runcmd(`scoreboard players operation "itemCounter" Counter += @e[type=item] _CounterCache`);
				setTimeout(function () {
					normFeedback(`@a`, `当前掉落物数为${itemCounter}`);
				}, 500);
			}
		}
		//@kill		自杀
		else if (input == `@kill`) {
			playerData[name]["isSuicide"] = true;
			runcmd(`kill ${name}`);

			//死亡提示
			let suicideNum = Math.floor(Math.random() * 10);
			switch (suicideNum) {
				case 0:
					normFeedback(`@a`, `§l${name}§r进入了通向二次元的路口`);
					break;
				case 1:
					normFeedback(`@a`, `§l${name}§r错杀亲马，悲痛欲绝`);
					break;
				case 2:
					normFeedback(`@a`, `§l${name}§r和张东升一起去爬山`);
					break;
				case 3:
					normFeedback(`@a`, `不要停下来啊，§l${name}§r！`);
					break;
				case 4:
					normFeedback(`@a`, `§l${name}§r删除了MCDB的源代码`);
					break;
				case 5:
					normFeedback(`@a`, `§l${name}§r进入了和宝的蜜穴惨被榨干`);
					break;
				case 6:
					normFeedback(`@a`, `§l${name}§r被确诊为肝坏死`);
					break;
				case 7:
					normFeedback(`@a`, `§l${name}§r划水过度而被原地处死`);
					break;
				case 8:
					normFeedback(`@a`, `§l${name}§r因长期摸鱼感染了新冠肺炎`);
					break;
				case 9:
					normFeedback(`@a`, `§l${name}§r贴了贴和宝`);
					break;
				default:
					normFeedback(`@a`, `§l${name}§r因长期摸鱼感染了新冠肺炎`);
					break;
			}
		}
		//@rs <脚本内容>	执行一段脚本
		else if (input.startsWith(`@rs `)) {
			let scriptText = input.substr(4);
			let result = runScript(scriptText);
			normFeedback(name, result);
		}
		//@qb	服务器备份
		else if (input.startsWith(`@qb `)) {
			if (input == `@qb make`) {
				normFeedback(`@a`, `服务器将在§l10秒§r后重启，进行备份`);
				fileWriteAllText(`qbTime.qb`, TimeNow());
				fileWriteLine(`qbMake.qb`, `start`);
				setTimeout(function () {
					runcmd("stop");
				}, 10000);
			}
			else if (input == `@qb time`) {
				let qbTime = fileReadAllText('qbTime.qb');
				normFeedback(`@a`, `上一个qb备份时间：§l${qbTime}`);
			}
			else if (input == `@qb resume`) {
				normFeedback(`@a`, `服务器将在§l10秒§r后重启，进行回档`);
				fileWriteLine(`qbResume.qb`, `start`);
				setTimeout(function () {
					runcmd("stop");
				}, 10000);
			}
			else if (input == `@qb restart`) {
				normFeedback(`@a`, `服务器将在§l10秒§r后重启`);
				fileWriteLine(`qbRestart.qb`, `start`);
				setTimeout(function () {
					runcmd("stop");
				}, 10000);
			}
		}
		//@server	更换服务器
		else if (input.startsWith("@server ")) {
			if (input == "@server survival") {
				normFeedback(name, `将在3秒后前往生存服`);
				setTimeout(function () {
					transferserver(uuid, '120.27.225.98', 19132);
				}, 3000);
			}
			else if (input == "@server creative") {
				normFeedback(`@a`, `将在3秒后前往创造服`);
				setTimeout(function () {
					transferserver(uuid, '120.27.225.98', 23333);
				}, 3000);
			}
		}
		//@cheat	调整反作弊系统
		else if (input.startsWith("@cheat ")) {
			if (input == "@cheat on" && name == op) {
				isUnCheat = false;
			}
			else {
				isUnCheat = true;
			}
		}
		else {
			normFeedback(name, '未知的指令,请输入@MCDB获取帮助');
		}
	}
	//return true;
});

//#region 计分板操作
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
		if (playerData[bsname]["isSuicide"] == false) {
			runcmd(`scoreboard players add @a[tag=!BOT,name=${bsname}] Dead 1`);
		}
		else {
			playerData[bsname]["isSuicide"] = false;
		}
		//死亡报点
		normFeedback(`@a`, `§r§l§f${bsname}§r§o§4 死于 §r§l§f${world}[${x},${y},${z}]`);
		//记录死亡点
		back(bsname);
		//重置血量记录
		//runcmd(`scoreboard players set @a[tag=!BOT,name=${bsname}] Health 20`);
	}
	if (bsname.startsWith(`bot_`)) {
		removeBOT(bsname);
	}
});

//挖掘榜计算
setAfterActListener('onDestroyBlock', function (e) {
	var pl = JSON.parse(e);
	var name = pl.playername;
	if (name != '') {
		runcmd(`scoreboard players add @a[name=${name}] Dig 1`);
	}
});

//放置榜计算
setAfterActListener('onPlacedBlock', function (e) {
	var pl = JSON.parse(e);
	var name = pl.playername;
	if (name != '') {
		runcmd(`scoreboard players add @a[name=${name}] Placed 1`);
	}
});

//伤害榜/承伤榜计算
setAfterActListener('onMobHurt', function (e) {
	var pl = JSON.parse(e);
	var hurt = pl.dmcount;//伤害数值
	var bdname = pl.mobname;//被打者名字
	var gjname = pl.srcname;//攻击者名字
	//var health = pl.health;//剩余血量

	//伤害榜
	if (pl.srctype == "entity.player.name") {
		runcmd(`scoreboard players add @a[name=${gjname}] Attack ${hurt}`);
	}
	//承伤榜
	if (pl.mobtype == "entity.player.name") {
		runcmd(`scoreboard players add @a[tag=!BOT,name=${bdname}] Hurt ${hurt}`);
		//runcmd(`scoreboard players set @a[tag=!BOT,name=${bdname}] Health ${health}`);
	}
});
//#endregion

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
	var result7 = output.search("Health");
	var result8 = output.search("_CounterCache");

	if (result1 == -1 && result2 == -1 && result3 == -1 && result4 == -1 && result5 == -1 && result6 == -1 && result7 == -1&&result8==-1) {
		return true
	} else {
		return false
	}
});

//控制台输出获取
setAfterActListener('onServerCmdOutput', function (e) {
	let pl = JSON.parse(e);
	var output = pl.output
	if (output.startsWith(`Day is `)) {
		gameDay = output.replace(/[^0-9]/ig, "");
	}
	else if (output.startsWith(`randomtickspeed = `)) {
		tickStatus = output.replace(/[^0-9]/ig, "");
	}
	else if (output.startsWith(`keepinventory = `)) {
		if (output.startsWith(`keepinventory = true`)) { kiStatus = '已开启' }
		else { kiStatus = '已关闭' };
	}
	else if (output.startsWith(`mobGriefing = `)) {
		if (output.startsWith(`mobGriefing = true`)) { mgStatus = '已开启' }
		else { mgStatus = '已关闭' };
	}
	else if (output.search("entityCounter") != -1) {
		entityCounter = output.replace(/[^0-9]/ig, "");
	}
	else if (output.search("itemCounter") != -1) {
		itemCounter = output.replace(/[^0-9]/ig, "");
	}
});

//反作弊UnCheatSystem
setBeforeActListener('onInputCommand', function (e) {
	if (isUnCheat == true) {
		var pl = JSON.parse(e);
		var cmd = pl.cmd;
		var name = pl.playername;
		if (!cmd.startsWith('/?') && !cmd.startsWith('/help') && !cmd.startsWith('/list') && !cmd.startsWith('/me') && !cmd.startsWith('/mixer') && !cmd.startsWith('/msg') && !cmd.startsWith('/tell') && !cmd.startsWith('/w') && !cmd.startsWith('/tickingarea') && !cmd.startsWith('/tp ')) {
			normFeedback(`@a`, `${name} 试图违规使用 ${cmd} 指令，已被阻止`);
			log(`${name} 试图违规使用 ${cmd} 指令`);
			setTimeout(function () { runcmd(`kick ${name} 试图违规使用指令${cmd}，自动踢出`) }, 5000);
			return false;
		} else {
			return true;
		}
	}
	else {
		return true;
	}

});

//#region 玩家上线
//玩家登录监听
setAfterActListener('onLoadName', function (e) {
	var je = JSON.parse(e);
	var name = je.playername;
	var uuid = UUID(name);
	playerData[name] = [];
	playerData[name]["deathPos"] = [];
	playerData[name]["isSuicide"] = false;
	//废弃功能-进服面板
	/*
	var serverDays = getDiffDate('2020-06-25T23:30:00');

	var lg = fileReadAllText('Logininterval.json');
	var lgj = JSON.parse(lg);
	var i;
	var ii = lgj.lgt.sz.length - 1;
	var havaplayer = false;
	var msg;
	for (i in lgj.lgt.sz) {
		if (i <= ii && lgj.lgt.sz[i].id == name) {
			var pl = '"' + name + '"';
			var d = new Date();
			var logint = d.getTime();
			var logout = lgj.lgt.sz[i].logout
			var interval = logint - logout
			let days = Math.floor(interval / (24 * 3600 * 1000));
			let leavel = interval % (24 * 3600 * 1000);
			let hours = Math.floor(leavel / (3600 * 1000));
			let leavel2 = leavel % (3600 * 1000);
			let minutes = Math.floor(leavel2 / (60 * 1000));
			log(`时隔${days}天${hours}时${minutes}分 玩家${name}再次进入了服务器`);
			msg = `现在距离你上次登出服务器过去了${days}天${hours}时${minutes}分`;
			havaplayer = true;
		} else if (i == ii && lgj.lgt.sz[i].id != name && havaplayer == false) {
			var xr = '},{"id":' + '"' + name + '"' + ',"logout":0}]}}'
			var xrz = lg.replace("}]}}", xr);
			fileWriteAllText('Logininterval.json', xrz);
			log(`玩家${name}首次进入服务器`)
			msg = `你是首次进入本服务器，祝你游戏愉快`;
		}
	}
	runcmd(`time query day`);
	request('https://v1.hitokoto.cn', 'GET', 'encode=text', function (e) {
		setTimeout(function () {
			sendSimpleForm(uuid, `HIC Welcome!`, `${name}，欢迎回到HIC\n\n${e}\n\n现在游戏内的天数是${gameDay}今天是开服的第${serverDays}天\n${msg}\n\n${Plugin_Name} - ${Plugin_Version}`, '["叔叔我啊，要进来啦~~~"]');
		}, 18000);
	});
	*/
});
/*
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
*/
//#endregion

//玩家下线解除占用
setAfterActListener('onPlayerLeft', function (e) {
	let pl = JSON.parse(e);
	let name = pl.playername;
	delete playerData[name];
});

log(`******* ${Plugin_Name} - ${Plugin_Version} 已装载完成      用法:@MCDE *******`);
fileWriteLine(`MCDaemonB.log`, outputLOG(Plugin_Name, `running`));
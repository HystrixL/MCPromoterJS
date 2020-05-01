@echo off

timeout /T 5

set qbtime=qb_%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%
set qbpath=C:\MinecraftServer\quickbackup\%qbtime%
set worldpath=C:\MinecraftServer\MCPE\worlds\RebornWorld
set startpath=C:\MinecraftServer\MCModDllExe\debug.bat

md %qbpath%
xcopy %worldpath% %qbpath% /E /H

timeout /T 3
start %startpath%
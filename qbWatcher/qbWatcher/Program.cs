using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MCDBWatcher
{
    class Program
    {
        static void Main(string[] args)
        {
            WatchDog(@"C:\MinecraftServer\MCPE", "*.qb");
            Console.ReadKey();
        }

        private static void WatchDog(string path,string filter)
        {
            FileSystemWatcher watcher = new FileSystemWatcher();

            watcher.Path = path;
            watcher.Filter = filter;
            watcher.Created += new FileSystemEventHandler(QbWatcher);
            watcher.EnableRaisingEvents = true;
            watcher.IncludeSubdirectories = false;
        }
        private static void QbWatcher(object source, FileSystemEventArgs e)
        {
            if (e.Name == "qbMake.qb")
            {
                Console.WriteLine("[" + DateTime.Now + "]" + "Ready to qbMake...");
                System.Threading.Thread.Sleep(25000);
                Console.WriteLine("["+DateTime.Now+"]"+"Start qbMake...");
                DeleteDir(@"C:\MinecraftServer\quickbackup\UnderworldSurvival");
                Console.WriteLine("[" + DateTime.Now + "]" + "Finish Delete...");
                System.Threading.Thread.Sleep(3000);
                CopyDirectory(@"C:\MinecraftServer\MCPE\worlds\UnderworldSurvival", @"C:\MinecraftServer\quickbackup\UnderworldSurvival", true);
                Console.WriteLine("[" + DateTime.Now + "]" + "Finish Copy...");
                System.Threading.Thread.Sleep(5000);
                Console.WriteLine("[" + DateTime.Now + "]" + "Start Server...");
                File.Delete(@"C:\MinecraftServer\MCPE\qbMake.qb");
                RunServer();
                RunWatcher();
            }
            else if(e.Name == "qbResume.qb")
            {
                Console.WriteLine("[" + DateTime.Now + "]" + "Ready to qbResume...");
                System.Threading.Thread.Sleep(25000);
                Console.WriteLine("[" + DateTime.Now + "]" + "Start qbReseum...");
                DeleteDir(@"C:\MinecraftServer\MCPE\worlds\UnderworldSurvival");
                Console.WriteLine("[" + DateTime.Now + "]" + "Finish Delete...");
                System.Threading.Thread.Sleep(3000);
                CopyDirectory(@"C:\MinecraftServer\quickbackup\UnderworldSurvival",@"C:\MinecraftServer\MCPE\worlds\UnderworldSurvival", true);
                Console.WriteLine("[" + DateTime.Now + "]" + "Finish Copy...");
                System.Threading.Thread.Sleep(5000);
                Console.WriteLine("[" + DateTime.Now + "]" + "Start Server...");
                File.Delete(@"C:\MinecraftServer\MCPE\qbResume.qb");
                RunServer();
                RunWatcher();
            }
            else if (e.Name == "qbRestart.qb")
            {
                Console.WriteLine("[" + DateTime.Now + "]" + "Ready to qbRestart...");
                System.Threading.Thread.Sleep(25000);
                Console.WriteLine("[" + DateTime.Now + "]" + "Start Server...");
                File.Delete(@"C:\MinecraftServer\MCPE\qbRestart.qb");
                RunServer();
                RunWatcher();
            }
        }

        public static void DeleteDir(string file)
        {
            try
            {
                //判断文件夹是否还存在
                if (Directory.Exists(file))
                {
                    foreach (string f in Directory.GetFileSystemEntries(file))
                    {
                        if (File.Exists(f))
                        {
                            //如果有子文件删除文件
                            File.Delete(f);
                            Console.WriteLine(f);
                        }
                        else
                        {
                            //循环递归删除子文件夹
                            DeleteDir(f);
                        }
                    }
                    //删除空文件夹
                    Directory.Delete(file);
                    Console.WriteLine(file);
                }
            }
            catch (Exception ex) // 异常处理
            {
                Console.WriteLine(ex.Message.ToString());// 异常信息
            }
        }

        private static bool CopyDirectory(string SourcePath, string DestinationPath, bool overwriteexisting)
        {
            bool ret = false;
            try
            {
                SourcePath = SourcePath.EndsWith(@"\") ? SourcePath : SourcePath + @"\";
                DestinationPath = DestinationPath.EndsWith(@"\") ? DestinationPath : DestinationPath + @"\";

                if (Directory.Exists(SourcePath))
                {
                    if (Directory.Exists(DestinationPath) == false)
                        Directory.CreateDirectory(DestinationPath);

                    foreach (string fls in Directory.GetFiles(SourcePath))
                    {
                        FileInfo flinfo = new FileInfo(fls);
                        flinfo.CopyTo(DestinationPath + flinfo.Name, overwriteexisting);
                    }
                    foreach (string drs in Directory.GetDirectories(SourcePath))
                    {
                        DirectoryInfo drinfo = new DirectoryInfo(drs);
                        if (CopyDirectory(drs, DestinationPath + drinfo.Name, overwriteexisting) == false)
                            ret = false;
                    }
                }
                ret = true;
            }
            catch (Exception ex)
            {
                ret = false;
            }
            return ret;
        }

        private static void RunServer()
        {
            Process server = new Process();
            string targetDir = string.Format(@"C:\MinecraftServer\MCModDllExe");

            server.StartInfo.WorkingDirectory = targetDir;
            server.StartInfo.FileName = "debug.bat";
            server.Start();
            //server.WaitForExit();
        }

        private  static void RunWatcher()
        {
            Process watcher = new Process();
            string targetDir = string.Format(@"C:\MinecraftServer\MCModDllExe");
            watcher.StartInfo.WorkingDirectory = targetDir;
            watcher.StartInfo.FileName = "qbWatcher.exe";
            watcher.Start();
            //watcher.WaitForExit();

            Process.GetCurrentProcess().CloseMainWindow();
            Process.GetCurrentProcess().Close();
        }
    }
}

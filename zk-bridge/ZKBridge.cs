using System;
using System.Net;
using System.Text;
using System.Runtime.InteropServices;
using System.Threading;
using System.IO;

/**
 * ZKTeco Biometric Bridge for Smart PCH
 * ------------------------------------
 * High-performance C# server that interfaces with ZKSDK (libzkfp.dll)
 * and provides a JSON API for the dashboard.
 */
namespace SmartPCH_ZKBridge
{
    class Program
    {
        // --- ZKSDK DLL IMPORTS ---
        [DllImport("libzkfp.dll", EntryPoint = "ZKFPM_Init", CallingConvention = CallingConvention.StdCall)]
        public static extern int ZKFP_Init();

        [DllImport("libzkfp.dll", EntryPoint = "ZKFPM_Terminate", CallingConvention = CallingConvention.StdCall)]
        public static extern int ZKFP_Terminate();

        [DllImport("libzkfp.dll", EntryPoint = "ZKFPM_OpenDevice", CallingConvention = CallingConvention.StdCall)]
        public static extern IntPtr ZKFP_OpenDevice(int index);

        [DllImport("libzkfp.dll", EntryPoint = "ZKFPM_CloseDevice", CallingConvention = CallingConvention.StdCall)]
        public static extern int ZKFP_CloseDevice(IntPtr handle);

        [DllImport("libzkfp.dll", EntryPoint = "ZKFPM_GetDeviceCount", CallingConvention = CallingConvention.StdCall)]
        public static extern int ZKFP_GetDeviceCount();

        [DllImport("libzkfp.dll", EntryPoint = "ZKFPM_AcquireFingerprint", CallingConvention = CallingConvention.StdCall)]
        public static extern int ZKFP_AcquireFingerprint(IntPtr handle, byte[] imgbuf, byte[] template, ref int size);

        // --- GLOBAL STATE ---
        static IntPtr mDevHandle = IntPtr.Zero;
        static bool mIsDeviceOpen = false;
        static byte[] mTemplate = new byte[2048];
        static int mTempLen = 0;

        static void Main(string[] args)
        {
            Console.WriteLine("==========================================");
            Console.WriteLine(" ZKTECO HARDWARE BRIDGE (Smart PCH)");
            Console.WriteLine("==========================================");

            if (InitHardware())
            {
                StartHttpServer();
            }
            else
            {
                Console.WriteLine("\n[ERROR] Qurilma topilmadi yoki drayver o'rnatilmagan!");
                Console.WriteLine("Iltimos, ZKTeco scannerini ulang va 'libzkfp.dll' fayli borligini tekshiring.");
                Console.WriteLine("\n[Simulyatsiya tartibida davom etiladi...]");
                StartHttpServer(); // Falls back to simulation if hardware fails
            }
        }

        static bool InitHardware()
        {
            try {
                if (ZKFP_Init() == 0) {
                    int count = ZKFP_GetDeviceCount();
                    if (count > 0) {
                        mDevHandle = ZKFP_OpenDevice(0);
                        if (mDevHandle != IntPtr.Zero) {
                            mIsDeviceOpen = true;
                            Console.WriteLine("✅ Qurilma muvaffaqiyatli ulandi (ZK Driver OK)");
                            return true;
                        }
                    }
                }
            } catch (Exception ex) {
                Console.WriteLine("Driver Error: " + ex.Message);
            }
            return false;
        }

        static void StartHttpServer()
        {
            HttpListener listener = new HttpListener();
            listener.Prefixes.Add("http://localhost:8080/");
            listener.Start();
            Console.WriteLine("📡 Bridge port 8080 da ishga tushdi...");

            while (true)
            {
                HttpListenerContext context = listener.GetContext();
                ProcessRequest(context);
            }
        }

        static void ProcessRequest(HttpListenerContext context)
        {
            HttpListenerRequest request = context.Request;
            HttpListenerResponse response = context.Response;

            // CORS
            response.AppendHeader("Access-Control-Allow-Origin", "*");
            response.AppendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            response.AppendHeader("Access-Control-Allow-Headers", "Content-Type");

            if (request.HttpMethod == "OPTIONS") {
                response.StatusCode = 204;
                response.Close();
                return;
            }

            if (request.Url.AbsolutePath == "/scan" && request.HttpMethod == "POST")
            {
                Console.WriteLine("\n[INFO] Skanerlash so'rovi keldi...");
                
                string jsonResponse;
                if (mIsDeviceOpen) {
                    jsonResponse = HandleRealScan();
                } else {
                    jsonResponse = HandleMockScan();
                }

                byte[] buffer = Encoding.UTF8.GetBytes(jsonResponse);
                response.ContentType = "application/json";
                response.ContentLength64 = buffer.Length;
                response.OutputStream.Write(buffer, 0, buffer.Length);
            }
            else {
                response.StatusCode = 404;
            }
            response.Close();
        }

        static string HandleRealScan()
        {
            Console.WriteLine("   -> Barmoqingizni bosing...");
            int size = 2048;
            byte[] imgbuf = new byte[640 * 480]; // Standard ZK image buffer
            
            // Wait for finger 
            int ret = -1;
            int timeout = 10; // 10 seconds
            while(timeout > 0) {
                ret = ZKFP_AcquireFingerprint(mDevHandle, imgbuf, mTemplate, ref size);
                if (ret == 0) break;
                Thread.Sleep(500);
                timeout--;
            }

            if (ret == 0) {
                string templateStr = Convert.ToBase64String(mTemplate, 0, size);
                Console.WriteLine("   ✅ Skanerlandi!");
                return "{\"success\": true, \"template\": \"" + templateStr + "\", \"message\": \"Muvaffaqiyatli\"}";
            } else {
                return "{\"success\": false, \"message\": \"Qurilma kutish vaqti tugadi\"}";
            }
        }

        static string HandleMockScan()
        {
            Console.WriteLine("   -> [MOCK] Barmoq izi simulyatsiya qilinmoqda...");
            Thread.Sleep(2000);
            string mockTemplate = "MOCK_TEMPLATE_" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
            return "{\"success\": true, \"template\": \"" + mockTemplate + "\", \"message\": \"Simulyatsiya muvaffaqiyatli\"}";
        }
    }
}

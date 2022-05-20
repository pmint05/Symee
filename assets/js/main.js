const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const modeSwitch = $(".toggle-switch"),
	randomTheme = $("#randomTheme"),
	app = $("#app"),
	menuBtn = $("#menuBtn"),
	menu = $("#menu"),
	backBtn = $("#backBtn"),
	infoBtn = $("#infoBtn"),
	closeInfoBtn = $("#closeInfoBtn"),
	infoWrapper = $("#infoWrapper"),
	msg = $("#msg"),
	form = $("form"),
	noti = $("#noti"),
	changeNameBtn = $("#changeNameBtn"),
	customName = $("#name"),
	deleteMsgBtn = $("#deleteMsgBtn"),
	confirmWrapper = $("#confirmWrapper"),
	confirmMessage = $("#confirmMessage"),
	confirmBtnYes = $("#confirmBtnYes"),
	confirmBtnNo = $("#confirmBtnNo"),
	overlay = $("#overlay"),
	msgList = $("#msgList"),
	fullscreenBtn = $("#fullscreenBtn"),
	changeImageBtn = $("#changeImageBtn"),
	changeImageInput = $("#changeImageInput"),
	body = $("#body");
const SIMSIMI_API_URL = "https://api-sv2.simsimi.net/v2/?text=",
	language = "&lc=vn";
let time = new Date();
let startDate =
	time.getDate() +
	"/" +
	(time.getMonth() + 1 < 10
		? "0" + (time.getMonth() + 1)
		: time.getMonth() + 1) +
	"/" +
	time.getFullYear();
let Symee = JSON.parse(localStorage.getItem("Symee")) || {
	mode: "light",
	name: "Symee",
	theme: "#007bff",
	msgs: {
		[startDate]: [],
	},
	lastDate: "",
	avatar: "",
};
let symeeAvt = Symee.avatar;
symeeAvt != "" ? ($("#avaImg").src = symeeAvt) : 0;
Symee.msgs[startDate] == undefined ? (Symee.msgs[startDate] = []) : 0;
let id = Symee.msgs[startDate]?.length || 0;
let showSavedMsgs = () => {
	msgs = Symee.msgs;
	for (let date in msgs) {
		if (!msgs[date].length > 0) {
			continue;
		}
		let msgDate = `<li class="date"><span>${date}</span></li>`;
		msgList.insertAdjacentHTML("beforeend", msgDate);
		msgs[date].sort((a, b) => {
			return a.id - b.id;
		});
		msgs[date].forEach((msg) => {
			let msgItem = `<li class="msg ${msg.sender}Msg" data-id="${
				msg.id
			}">${
				msg.sender == "symee"
					? `<div class="msgAvatar"><img src="${
							symeeAvt == ""
								? "./assets/images/simava2.png"
								: symeeAvt
					  }" alt="avatar" />`
					: ""
			}</div><div class="msgBody"><div class="msgContent">${
				msg.msgText
			}</div><div class="msgTime"><span>${
				msg.time
			}</span></div></div></li>`;
			msgList.insertAdjacentHTML("beforeend", msgItem);
		});
	}
	msgList.lastChild.nodeName != "#text"
		? msgList.lastChild.scrollIntoView({ behavior: "smooth" })
		: 0;
};
showSavedMsgs();
let lastDate = Symee.lastDate;
let theme = Symee.theme;
document.documentElement.style.setProperty("--primary-color", theme);
document.body.style.setProperty("--primary-color", theme);
let mode = Symee.mode;
if (mode == "dark") {
	document.body.classList.add("dark");
}
let symeeName = Symee.name;
customName.value = symeeName;

let quoteInterval;
let quoteTimeout;

document.addEventListener("DOMContentLoaded", () => {
	setTimeout(() => {
		$("#loadingWrapper").classList.add("hide");
	}, 1000);
	if (msgList.children.length > 0) {
		deleteMsgBtn.classList.remove("disabled");
		noti.classList.add("hide");
	} else {
		deleteMsgBtn.classList.add("disabled");
		fetch("https://api.quotable.io/random?maxLength=50&tag=famous").then(
			(res) => {
				res.json().then((quote) => {
					// console.log(quote);
					let quoteRes = `${quote.content}\n- ${quote.author} -`;
					noti.innerText = quoteRes;
					quoteInterval = setInterval(() => {
						noti.innerText =
							'👋 Hãy nói "Xin chào" để bắt đầu cuộc trò chuyện';
						setTimeout(() => {
							noti.innerText = quoteRes;
						}, 3000);
					}, 6000);
				});
			}
		);
	}
	fetch(`${SIMSIMI_API_URL + "hi" + language}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			credentials: "include",
			mode: "no-cors",
			origin: "*",
			"X-Requested-With": "XMLHttpRequest",
		},
	})
		.then((res) => {
			res.json().then((data) => {
				if (!data.success) {
					$("#avatar").classList.add("error");
					$("#nameField p").innerText = "Offline";
				}
			});
		})
		.catch((err) => {
			$("#avatar").classList.add("error");
			$("#nameField p").innerText = "Offline";
		});
});
msg.onfocus = () => {
	menu.classList.remove("active");
	msgList.lastChild.scrollIntoView({ behavior: "smooth" });
};
body.onclick = () => {
	menu.classList.remove("active");
};
changeNameBtn.onclick = () => {
	menu.classList.remove("active");
	customName.removeAttribute("disabled");
	customName.select();
	window.onkeyup = (e) => {
		if (e.keyCode == 13 && customName === document.activeElement) {
			customName.blur();
		}
	};
	customName.onblur = () => {
		let name = customName.value.trim();
		if (name) {
			document.title = name + " has sent you a message";
			Symee.name = name;
			localStorage.setItem("Symee", JSON.stringify(Symee));
		} else {
			customName.value = symeeName;
		}
		customName.setAttribute("disabled", true);
	};
};
form.onsubmit = (e) => {
	e.preventDefault();

	if (lastDate !== startDate || msgList.children.length === 0) {
		let dateEle = document.createElement("li");
		dateEle.classList.add("date");
		dateEle.innerText = startDate;
		msgList.appendChild(dateEle);
		lastDate = startDate;
		Symee.lastDate = lastDate;
		localStorage.setItem("Symee", JSON.stringify(Symee));
	}
	let msgText = msg.value.trim();
	let userMsg = `<li class="msg userMsg"><div class="msgBody"><div class="msgContent">${msgText}</div><div class="msgTime"><span>${getTime()}</span></div></div></li>`;
	msgList.insertAdjacentHTML("beforeend", userMsg);
	msg.value = "";
	deleteMsgBtn.classList.remove("disabled");
	Symee.msgs[startDate].push({
		msgText,
		time: getTime(),
		id: id++,
		sender: "user",
	});
	localStorage.setItem("Symee", JSON.stringify(Symee));
	let typingMsg = `<li class="msg botMsg" id="typingMsg">
                        <div class="msgAvatar">
                            <img src="${
								symeeAvt == ""
									? "./assets/images/simava2.png"
									: symeeAvt
							}" alt="avatar" />
                        </div>
                        <div class="msgBody">
                            <div class="msgContent">
                                <div class="ticontainer">
                                    <div class="tiblock">
                                        <div class="tidot"></div>
                                        <div class="tidot"></div>
                                        <div class="tidot"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="msgTime">
                                <span>10:00</span>
                            </div>
                        </div>
                    </li>`;
	msgList.insertAdjacentHTML("beforeend", typingMsg);
	msgList.lastChild.scrollIntoView({ behavior: "smooth" });
	getSymeeMsg(msgText);
	noti.classList.add("hide");
};
let getSymeeMsg = (msg) => {
	var xhr = new XMLHttpRequest();

	fetch(`${SIMSIMI_API_URL + msg + language}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			credentials: "include",
			mode: "cors",
			origin: "*",
			"X-Requested-With": "XMLHttpRequest",
		},
	})
		.then((res) => {
			res.json().then((data) => {
				addSymeeMsg(data.success);
				$("#typingMsg").parentNode.removeChild($("#typingMsg"));
			});
		})
		.catch((err) => {
			$("#avatar").classList.add("error");
			$("#nameField p").innerText = "Offline";
			addSymeeMsg("Oops, something went wrong!");
			$("#typingMsg").parentNode.removeChild($("#typingMsg"));
		});
};
let addSymeeMsg = (msgText) => {
	let symeeMsg = `<li class="msg symeeMsg"><div class="msgAvatar"><img src="${
		symeeAvt == "" ? "./assets/images/simava2.png" : symeeAvt
	}" alt="avatar" /></div><div class="msgBody"><div class="msgContent">${msgText}</div><div class="msgTime"><span>${getTime()}</span></div></div></li>`;
	msgList.insertAdjacentHTML("beforeend", symeeMsg);
	msgList.lastChild.scrollIntoView({ behavior: "smooth" });
	Symee.msgs[startDate].push({
		msgText,
		time: getTime(),
		id: id++,
		sender: "symee",
	});
	localStorage.setItem("Symee", JSON.stringify(Symee));
};
msg.onkeyup = (evt) => {
	const value = msg.value;
	if (!value) {
		msg.dataset.state = "";
		return;
	}
	const trimmed = value.trim();
	if (trimmed) {
		msg.dataset.state = "valid";
	} else {
		msg.dataset.state = "invalid";
	}
};
changeImageBtn.onclick = () => {
	changeImageInput.click();
};
changeImageInput.onchange = () => {
	let file = changeImageInput.files[0];
	let reader = new FileReader();
	reader.onload = (e) => {
		let img = new Image();
		img.src = e.target.result;
		img.onload = () => {
			let canvas = document.createElement("canvas");
			let ctx = canvas.getContext("2d");
			const MAX_WIDTH = 200;
			let width = img.width,
				height = img.height;
			if (width > height) {
				if (width > MAX_WIDTH) {
					height *= MAX_WIDTH / width;
					width = MAX_WIDTH;
				}
			} else {
				if (height > MAX_WIDTH) {
					width *= MAX_WIDTH / height;
					height = MAX_WIDTH;
				}
			}
			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(img, 0, 0, width, height);
			let dataURL = canvas.toDataURL("image/png");
			$("#avaImg").src = dataURL;
			$$(".msgAvatar img").forEach((img) => {
				img.src = dataURL;
			});
			Symee.avatar = dataURL;
			localStorage.setItem("Symee", JSON.stringify(Symee));
		};
	};
	reader.readAsDataURL(file);
};
infoBtn.onclick = () => {
	infoWrapper.classList.toggle("show");
};
closeInfoBtn.onclick = () => {
	infoWrapper.classList.remove("show");
};
deleteMsgBtn.onclick = () => {
	confirmFunc("delete", () => {
		noti.classList.remove("hide");
		msgList.innerHTML = "";
		deleteMsgBtn.classList.add("disabled");
		Symee.msgs = { [startDate]: [] };
		localStorage.setItem("Symee", JSON.stringify(Symee));
	});
};
menuBtn.onclick = () => {
	menu.classList.add("active");
};
backBtn.onclick = () => {
	menu.classList.remove("active");
};

modeSwitch.onclick = () => {
	mode = mode === "dark" ? "light" : "dark";
	document.body.classList.toggle("dark");
	Symee.mode = mode;
	localStorage.setItem("Symee", JSON.stringify(Symee));
};

const randomColor = () =>
	`#${Math.random().toString(16).slice(2, 8).padEnd(6, "0")}`;

randomTheme.onclick = () => {
	let randomColorHex = randomColor();
	document.documentElement.style.setProperty(
		"--primary-color",
		randomColorHex
	);
	document.body.style.setProperty("--primary-color", randomColorHex);
	theme = randomColorHex;
	Symee.theme = theme;
	localStorage.setItem("Symee", JSON.stringify(Symee));
};
const rgbToHex = (r, g, b) =>
	"#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
let confirmFunc = (type, callback) => {
	let options = {
		logout: {
			title: "Logout",
			message: "Are you sure to sign out?",
		},
		delete: {
			title: "Delete",
			message: "Are you sure to delete all messages?",
		},
		error: {
			title: "Oops! Something went wrong :(",
			message: "Please try again later",
		},
	};
	overlay.classList.add("show");
	confirmWrapper.classList.add("show");
	confirmHeader.innerText = options[type].title;
	confirmMessage.innerText = options[type].message;
	confirmBtnNo.onclick = () => {
		confirmWrapper.classList.remove("show");
		overlay.classList.remove("show");
	};
	confirmBtnYes.onclick = () => {
		confirmWrapper.classList.remove("show");
		overlay.classList.remove("show");
		callback();
	};
};
let getTime = () => {
	let time = new Date();
	return (
		time.getHours() +
		" : " +
		(time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes())
	);
};
fullscreenBtn.onclick = () => {
	toggleFullScreen(document.body);
	menu.classList.remove("active");
};
function toggleFullScreen(elem) {
	if (
		(document.fullScreenElement !== undefined &&
			document.fullScreenElement === null) ||
		(document.msFullscreenElement !== undefined &&
			document.msFullscreenElement === null) ||
		(document.mozFullScreen !== undefined && !document.mozFullScreen) ||
		(document.webkitIsFullScreen !== undefined &&
			!document.webkitIsFullScreen)
	) {
		if (elem.requestFullScreen) {
			elem.requestFullScreen();
		} else if (elem.mozRequestFullScreen) {
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullScreen) {
			elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		} else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();
		}
		fullscreenBtn.innerHTML =
			'<ion-icon name="contract-outline"></ion-icon>';
	} else {
		if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
		fullscreenBtn.innerHTML = '<ion-icon name="expand-outline"></ion-icon>';
	}
}
document.addEventListener("fullscreenchange", function () {
	checkFullScreen();
});
document.addEventListener("mozfullscreenchange", function () {
	checkFullScreen();
});
document.addEventListener("webkitfullscreenchange", function () {
	checkFullScreen();
});
document.addEventListener("msfullscreenchange", function () {
	checkFullScreen();
});
const checkFullScreen = () => {
	if (
		(document.fullScreenElement !== undefined &&
			document.fullScreenElement === null) ||
		(document.msFullscreenElement !== undefined &&
			document.msFullscreenElement === null) ||
		(document.mozFullScreen !== undefined && !document.mozFullScreen) ||
		(document.webkitIsFullScreen !== undefined &&
			!document.webkitIsFullScreen)
	) {
		fullscreenBtn.innerHTML = '<ion-icon name="expand-outline"></ion-icon>';
	} else {
		fullscreenBtn.innerHTML =
			'<ion-icon name="contract-outline"></ion-icon>';
	}
};
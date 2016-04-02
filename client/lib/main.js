window.init = function() {
	const input = document.querySelector('.input');
	const output = document.querySelector('.output');

	input.onkeydown = (evt) => {
		if (evt.which === 13) {
			const cmd = input.value.trim();
			if (cmd.length) {
				socket.send(cmd + "\n");
			}
			input.value = "";
		}
	};

	const reader = new LineReader();
	reader.online = (line) => {
		const div = document.createElement('div');
		div.textContent = line;
		output.appendChild(div);
	}

	const socket = new WebSocket("ws://localhost:8080/");
	socket.onopen = () => {
		console.log("socket opened");
	}
	socket.onmessage = (msg) => {
		reader.append(msg.data);
	}
}

function LineReader() {
	var buffer = '';
	const obj = {
		append: function(str) {
			buffer += str;
			const ix = buffer.indexOf("\n");
			if (ix >= 0) {
				const message = buffer.substr(0, ix);
				buffer = buffer.substr(ix + 1);
				obj.online(message);
			}
			
		},
		online: function() {}
	};
	return obj;
}
// var socket = io.connect("https://api.softure.com.br");
var socket = io.connect("http://localhost:3000");
var tokenSala = "4c54b3c0-e155-11e9-9f40-854d5326d641";
var participante = {
    "nome": "",
    "idExterno": "",
    "idCliente": "",
    "dados": {}
};

var lerMensagem = function(elem) {
    if(!$(elem).hasClass('msg-lida')) {
        $(elem).addClass("msg-lida");
        var id = $(elem).find(".msg").prop("id");
        socket.emit("ler-mensagem", {sala: tokenSala, id: id});
        console.log(id);
    }
};

$(document).ready(function () {
    var ready = false;

    $("#submit").submit(function (e) {
        e.preventDefault();
        $("#nick").fadeOut();
        $("#chat").fadeIn();
        var nome = $("#nome").val();
        var idExterno = $("#idExterno").val();
        var idCliente = $("#idCliente").val();
        var time = new Date();
        $("#name").html(name);
        $("#time").html('First login: ' + time.getHours() + ':' + time.getMinutes());

        participante.nome = nome;
        participante.idExterno = idExterno;
        participante.idCliente = idCliente;

        socket.emit("regsitrar-participante", participante);
        socket.emit("entrar-sala", {participante: participante, sala: tokenSala});
        ready = true;
    });

    $("#textarea").keypress(function (e) {
        if (e.which == 13) {
            var text = $("#textarea").val();
            $("#textarea").val('');
            var time = new Date();   
            var msgId = time.getTime().toString() + '-' + participante.idExterno;
            let mensagem = {
				mensagem: text,
				dataEnvio: time,
                id: msgId
			};

            $(".chat").append(
                '<li class="self">' +
                    '<div class="msg" id="' + msgId + '">' +
                        '<span>' + $("#nickname").val() + ':</span>' +
                        '<p>' + text + '</p>' +
                        '<time>' + time.getHours() + ':' + time.getMinutes() + '</time>' +
                    '</div>' +
                '</li>');

            socket.emit("enviar-mensagem", {
            	mensagem: mensagem,
				sala: tokenSala,
				idExterno: participante.idExterno
            });
            // automatically scroll down
            document.getElementById('bottom').scrollIntoView();
        }
    });

    socket.on("mensagem-recebida", function (msg) {
        if (ready) {
            var time = new Date(msg.dataEnvio);
            $(".chat").append(
                '<li class="field" onmouseenter="lerMensagem(this)">' +
                    '<div class="msg" id="' + msg.id + '">' +
                        '<span>' + msg.remetente.nome + ':</span>' +
                        '<p>' + msg.mensagem + '</p>' +
                        '<time>' + time.getHours() + ':' + time.getMinutes() + '</time>' +
                    '</div>' +
                '</li>');
        }
    });

    socket.on("mensagem-lida", function (msg) {
        var time = new Date(msg.dataLeitura);
        $(".self").find("#" + msg.id).find("time").append(` - Lida ás ${time.getHours()}:${time.getMinutes()}`);
    })
});


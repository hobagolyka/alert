// INIT
var http = require('http');
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var hostname = '127.0.0.1';
var port = 3000;

// CONFIG
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : '',
    password : '',
    database : ''
});

var email_user = {
    user     : '',
    password : '',
    host: ''
};

var transporter = nodemailer.createTransport({
    host: email_user.host,
    port: '587',
    secure: false,
    auth: {
        user: email_user.user,
        pass: email_user.password
    },
    tls: {
        rejectUnauthorized: false
    }
});

var timer = 60 * 1000;

// FUNCTIONS - DB
function dbconnect(callback) {
    connection.query('SELECT notifications.date_time, notifications.host FROM shadow_trap_id, notifications WHERE shadow_trap_id.trap_id = notifications.trap_id', function(err,row){
        if (err) {
            throw err;
        }
        return callback(err, row);
    });
}

function dbdelete(callback) {
    connection.query('DELETE FROM shadow_trap_id', function(err,row){
        if (err) {
            throw err;
        }
        return callback(err, row);
    });
}

// SERVER
var server = http.createServer(function(req, res) {
    res.statusCode = 200;
});

setInterval(function() {
    dbconnect(function(err, result){
        if (err) throw err;
        else {
            if(result.length > 0){
                var message = '';

                result.forEach(function(item){
                    message = message + 'Új bejegyzés történet: ' + item.date_time + ' időpontban, ' + item.host + ' hoston.\n';
                });

                var mailOptions = {
                    from: email_user.user,
                    to: 'toth.jdt@gmail.com',
                    subject: 'Net snmp értesítés.',
                    text: message
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                    return;
                });
            }
        }
        return;
    });
}, timer);

server.listen(function(port, hostname){
});
